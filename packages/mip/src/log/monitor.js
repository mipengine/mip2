/**
 * @file monitor.js
 * @description 监控数据监控处理
 * @author schoeu
 */

import ls from './log-send'
import coreTags from './core-tags'

const RATE = 0.1
let tags

/* istanbul ignore if */
if (!Array.isArray(coreTags)) {
  tags = []
}

tags = coreTags.filter((it = '') => !!it.trim())

/**
 * MIP错误捕获处理
 *
 * @param {Object} e 错误事件对象
 * @param {number} opts.rate 抽样率
 */
export function errorHandler (e = {}, { rate = 0.1 }) {
  rate = rate || RATE

  // 报错文件请求路径, 跨域js文件中错误无信息暂不上报
  let filename = e.filename || ''

  /* istanbul ignore if */
  if (!filename) {
    return
  }

  // 错误信息
  let message = e.message || ''

  // 错误行号
  let lineno = e.lineno || ''

  // 错误列号
  let colno = e.colno || 0

  /* istanbul ignore if */
  // 非百度 CDN 域名忽略
  if (!/(c\.mipcdn|mipcache\.bdstatic)\.com\/static/.test(filename)) {
    return
  }

  let tagInfo = /\/(mip-.+)\//g.exec(filename) || []
  let tagName = tagInfo[1] || ''
  let sampling = Math.random() <= rate

  // 只记录官方组件错误
  if (tags.indexOf(tagName) > -1 && sampling) {
    // 数据处理
    let logData = {
      file: filename,
      msg: message,
      ln: lineno,
      col: colno || (window.event && window.event.errorCharacter) || 0,
      href: window.location.href
    }

    setTimeout(() => ls.sendLog('mip-stability', logData), 0)
  }
}

export default function install () {
  window.removeEventListener('error', errorHandler)
  window.addEventListener('error', errorHandler)
}
