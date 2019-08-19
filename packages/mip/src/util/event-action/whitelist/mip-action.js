import {handleScrollTo} from '../../../page/util/ease-scroll'
import viewer from '../../../viewer'
import {parse} from '../parser'
import log from '../../log'

const logger = log('MIP-Action')

function scrollTo ({id, duration, position}) {
  /* istanbul ignore if */
  if (!id) {
    return
  }
  const target = document.getElementById(id)
  handleScrollTo(target, {duration, position})
}

function navigateTo ({url, target, opener}) {
  viewer.navigateTo(url, target, opener)
}

/**
 * 作为打开新窗的后退操作
 * 关闭窗口，如果不能关闭，跳转到目标地址
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

function goBack () {
  window.history.back()
}

function print () {
  window.print()
}

function setData (args) {
  MIP.setData(args)
}

// function getData (args) {
//   MIP.getData(args)
// }

function $set (args) {
  MIP.$set(args)
}

// @TODO deprecated
const ALLOWED_GLOBALS = (
  'Infinity,undefined,NaN,isFinite,isNaN,' +
  'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
  'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
  'm' // MIP global data
).split(',')

const FALLBACK_PARSE_STORE = {}

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
  // getData,
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
      if (fn) {
        logger.error(e)
      }
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


