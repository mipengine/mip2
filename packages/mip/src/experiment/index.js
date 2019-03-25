/**
 * @file 实验 API 提供入口
 * @author mj(zoumiaojiang@gmail.com)
 */

import defaultExperimentConfig from './config'

let experimentConfig = defaultExperimentConfig

/**
 * 判断是否是实验生效状态
 *
 * @param {Date|stirng|number} start 开始时间
 * @param {Date|stirng|number} end 结束事件
 * @returns {boolean} 当前时间是否生效的结果
 */
function isTimeInRange (start, end) {
  let expStartTime = (new Date(start || Date.now())).getTime()
  let expEndTime = (new Date(end || '2099-01-01')).getTime()
  let nowTime = Date.now()

  // 如果实验生效时间配置错误
  if (!expStartTime || !expEndTime || expStartTime > expEndTime) {
    return false
  }

  return nowTime >= expStartTime && nowTime <= expEndTime
}

/**
 * 设置 cookie
 *
 * @param {string} key cookie 的 key
 * @param {string} value cookie 的 value
 * @param {Date} expires cookie 的失效时间
 */
function setCookie (key, value, expires) {
  var domain = document.domain
  let date = new Date()
  date.setTime(Date.now() + expires)
  document.cookie = `${key}=${escape(value)};path=/;expires=${date.toGMTString()};domain=${domain};`
}

/**
 * 获取 cookie 的内容
 *
 * @param {string} key cookie 的名称
 * @returns {string} 获取的 cookie 的内容
 */
function getCookie (key) {
  let reg = new RegExp('(^| )' + key + '=([^;]*)(;|$)')
  let arr = document.cookie.match(reg)

  if (arr && arr[2]) {
    return unescape(arr[2])
  }
  return ''
}

/**
 * 全局设置实验配置（提供一种 API 设置全局实验配置的机制）
 *
 * @param {Object} conf 待设置的配置信息
 */
export function setConfig (conf) {
  experimentConfig = conf
}

/**
 * 验证是否命中 sites 类型的实验
 *
 * @param {string} expName 实验名称
 * @returns {boolean} 实验命中情况的结果
 */
export function assertSite (expName) {
  let siteConf = experimentConfig.site || {}
  let expConf = siteConf[expName]

  if (!expConf) {
    return false
  }

  let currentUrl = window.location.href
  let expSites = expConf.sites || []

  for (let i = 0; i < expSites.length; i++) {
    let siteHost = expSites[i]
    let siteCacheName = siteHost.replace(/\./g, '-')
    let { startTime, endTime } = expConf

    if ((currentUrl.indexOf(siteHost) > -1 ||
      currentUrl.indexOf(siteCacheName) > -1) &&
      isTimeInRange(startTime, endTime)
    ) {
      return true
    }
  }

  return false
}

/**
 * 验证是否命中了 ABTest 类型实验
 *
 * @param {string} expName 实验名称
 * @returns {boolean} 实验命中情况的结果
 */
export function assertAbTest (expName) {
  return !!getCookie(expName)
}

/**
 * 处理 abTest 小流量命中情况
 *
 * @param {string} expName 实验名称
 * @param {?Object} abExpConf abTest 小流量实验配置
 * @returns {boolean} 当前实验是否命中
 */
function isShootAbTest (expName, abExpConf = {}) {
  let abArr = []
  let {
    startTime,
    endTime,
    ratio
  } = abExpConf

  setCookie(expName, '', -1)

  if (!ratio || typeof ratio !== 'number' || ratio < 0 || !isTimeInRange(startTime, endTime)) {
    // 如果实验不在生效时间中，则直接标识未命中
    return false
  }

  for (let i = 0; i < 100; i++) {
    abArr[i] = (i < ratio) ? 1 : 0
  }

  let expIndex = parseInt(Math.random() * 100, 10)

  // 如果实验在设定的生效时间中，就可以判断是否命中
  if (abArr[expIndex]) {
    // 命中实验了，将命中结果存如 cookie，保证当前用户每次都能命中，cookie 生效时间 10 分钟
    setCookie(expName, JSON.stringify(abExpConf), 10 * 60 * 1000)
    return true
  }

  return false
}

/**
 * 获取 abTest 命中的所有实验标识
 *
 * @returns {Array<String>} 命中的实验名称标识列表
 */
export function tryAssertAllAbTests () {
  let abTestNames = []

  Object.keys(experimentConfig.abTest || {}).forEach(expName => {
    let abTestConf = experimentConfig.abTest || {}
    let expConf = abTestConf[expName]
    let { startTime, endTime } = expConf

    // 如果实验过期，就整体下线
    if (!isTimeInRange(startTime, endTime)) {
      setCookie(expName, '', -1)
    }

    let abCookieResult = getCookie(expName)

    // 如果 cookie 已经记录了命中情况，就不需要重新再走命中判断逻辑
    if (abCookieResult) {
      // 如果实验配置的信息没有发生变更，直接返回命中情况
      abCookieResult === JSON.stringify(expConf)
        ? abTestNames.push(expName)
        : isShootAbTest(expName, expConf) && abTestNames.push(expName)
    } else {
      isShootAbTest(expName, expConf) && abTestNames.push(expName)
    }
  })

  return abTestNames
}
