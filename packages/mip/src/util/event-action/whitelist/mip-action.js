/**
 * @file mip-action.js
 * @author guozhuorong
 * @description MIP 全局行为
 */

import {handleScrollTo} from '../../../page/util/ease-scroll'
import viewer from '../../../viewer'
import {parse} from '../parser'
import log from '../../log'

const logger = log('MIP-Action')

/**
 * 滚动到 ID 为 id 的元素
 *
 * @param {string} id 元素 id
 * @param {number=} duration 滚动持续时间
 * @param {string=} position 滚动到视窗的位置
 */
function scrollTo ({id, duration, position}) {
  /* istanbul ignore if */
  if (!id) {
    return
  }
  const target = document.getElementById(id)
  handleScrollTo(target, {duration, position})
}

/**
 * 跳转到相应的页面
 *
 * @param {URL} url 页面 URL
 * @param {string} target _blank _top
 * @param {boolean=} opener 用于指定大开心页面是否能访问到 window.opener
 */
function navigateTo ({url, target, opener}) {
  viewer.navigateTo(url, target, opener)
}

/**
 * 作为打开新窗的后退操作
 * 关闭窗口，如果不能关闭，跳转到目标地址
 *
 * @param {Object} args 与 navigateTo 参数一致
 */
function closeOrNavigateTo (args) {
  const hasParent = window.parent !== window
  // 顶层 window 并且是被打开的 window 才能关闭
  const canBeClosed = window.opener && !hasParent

  let closed = false
  if (canBeClosed) {
    window.close()
    // 可能被浏览器 block，没有关闭
    closed = window.closed
  }

  /* istanbul ignore if */
  if (!closed) {
    navigateTo(args)
  }
}

/**
 * 页面回退
 */
function goBack () {
  window.history.back()
}

/**
 * 调出打印页面
 */
function print () {
  window.print()
}

/**
 * 写入 MIP Data 数据
 *
 * @param {Object} args 写入的数据
 */
function setData (args) {
  MIP.setData(args)
}

/**
 * 写入 MIP Data 数据并触发全局 HTML 节点的重新扫描
 *
 * @deprecated
 * @param {Object} args 写入的数据
 */
function $set (args) {
  MIP.$set(args)
}

// 旧版 MIP 表达式解析的实现方法
// @TODO deprecated

/**
 * 允许使用的全局对象
 * @type {Array.<string>}
 */
const ALLOWED_GLOBALS = (
  'Infinity,undefined,NaN,isFinite,isNaN,' +
  'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
  'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
  'm' // MIP global data
).split(',')

const FALLBACK_PARSE_STORE = {}

/**
 * 旧版的 MIP 表达式解析方法
 *
 * @deprecated
 * @param {string} argumentText 参数字符串
 * @param {Object} options 解析参数
 * @param {boolean} deprecate 是否提示 deprecated 声明
 */
function setDataParseFallback ({argumentText, options, deprecate}) {
  if (deprecate && !FALLBACK_PARSE_STORE[argumentText]) {
    FALLBACK_PARSE_STORE[argumentText]  = new Function('DOM', `with(this){return ${argumentText}}`)
    logger.warn('当前的 setData 参数存在不符合 MIP-bind 规范要求的地方，请及时进行修改:')
    logger.warn(argumentText)

  }
  let fn = FALLBACK_PARSE_STORE[argumentText]
  let hasProxy = typeof Proxy !== 'undefined'
  let proxy = hasProxy
    ? new Proxy({
        DOM: options.target
      }, {
        has (target, key) {
          return target[key] || ALLOWED_GLOBALS.indexOf(key) < 0
        }
      })
    : /* istanbul ignore next */ {}
  return fn.call(Object.assign(proxy, {event: options.event}))
}

export const actions = {
  setData,
  $set,
  scrollTo,
  navigateTo,
  closeOrNavigateTo,
  goBack,
  print
}

export default function mipAction ({property, argumentText, options}) {
  let action = actions[property]
  if (!action) {
    throw new Error(`不支持在 on 表达式中使用 MIP.${property} 全局方法`)
  }
  /* istanbul ignore if */
  if (!argumentText) {
    action()
    return
  }

  if (property === 'setData' || property === '$set') {
    let fn
    let arg

    try {
      fn = parse(argumentText, 'ObjectLiteral')
      arg = fn(options)
    } catch (e) {
      /* istanbul ignore if */
      if (fn) {
        logger.error(e)
      }
      // 当新版 MIP 表达式解析失败时，走回旧版的解析方法做兼容处理
      // 当且仅当 parse 失败时，认为使用了旧版有问题的 MIP 表达式，并弹出 deprecate 声明
      arg = setDataParseFallback({
        argumentText,
        options,
        deprecate: !fn
      })
    }

    action(arg)
    return
  }

  let fn = parse(argumentText, 'MIPActionArguments')
  let args = fn(options)
  action(args[0])
}


