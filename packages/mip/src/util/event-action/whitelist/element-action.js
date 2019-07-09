import {handleScrollTo} from '../../../page/util/ease-scroll'
import {LAYOUT, getLayoutClass} from '../../../layout'
import {parse} from '../parser'
import log from '../../log'
import dom from '../../dom/dom'
const logger = log('Element-Action')

// function argFormat (args, formatter) {
//   if (typeof args[0] === 'object') {
//     return args
//   }
//   let formatted = {}
//   for (let i = 0; i < args.length; i++) {
//     formatted[formatter[i]] = args[i]
//   }
//   return formatted
// }


/**
 * 在目标元素中找具有 autofocus 属性的元素
 *
 * @param {HTMLElement} el 目标元素
 */
function getAutofocusElement (el) {
  if (el.hasAttribute('autofocus')) {
    return el
  }
  return el.querySelector('[autofocus]')
}


/**
 * 显示/隐藏元素
 *
 * @param {HTMLElement} el 目标元素
 * @param {boolean} opt 是否隐藏
 */
function toggleHide (el, opt) {
  if (opt === undefined) {
    el.classList.toggle('mip-hide')
    return
  }
  el.classList.toggle('mip-hide', opt)
}

/**
 * 显示元素，如果元素或其子元素有 autofocus 属性，focus 到该元素
 *
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function show ({target}) {
  /* istanbul ignore if */
  if (target.classList.contains(getLayoutClass(LAYOUT.NODISPLAY))) {
    logger.warn('layout=nodisplay 的元素不能被动态显示')
    return
  }
  const autofocusEl = getAutofocusElement(target)
  toggleHide(target, false)
  if (autofocusEl) {
    focus({target: autofocusEl})

  }
}

/**
 * 隐藏元素
 *
 * @param {HTMLElement} target 目标元素
 */
function hide ({target}) {
  toggleHide(target, true)
}

/**
 * 显示/隐藏元素
 *
 * @param {HTMLElement} target 目标元素
 */
function toggle ({target}) {
  toggleHide(target)
}

/**
 * 滚动到目标元素
 *
 * @param {Object} args 参数
 * @param {HTMLElement} target 目标元素
 */
function scrollTo ({args, target}) {
  handleScrollTo(target, args)
}

/**
 * 添加/删除元素 class
 *
 * @param {Object} args 参数
 * @param {HTMLElement} target 目标元素
 */
function toggleClass ({args, target}) {
  // const parsedArg = transform(arg)()
  let {
    class: className,
    force
  } = args
  /* istanbul ignore if */
  if (!className || typeof className !== 'string') {
    logger.warn('class 不能为空且必须是 string 类型')
    return
  }
  if (force !== undefined) {
    /* istanbul ignore if */
    if (typeof force !== 'boolean') {
      logger.warn('force 必须是 boolean 类型')
    }
    target.classList.toggle(className, force)
    return
  }
  target.classList.toggle(className)
}

/**
 * focus 元素
 *
 * @param {HTMLElement} target 目标元素
 */
function focus ({target}) {
  target.focus()
}


export const actions = {
  show,
  hide,
  toggle,
  scrollTo,
  toggleClass,
  focus
}

export default function elementAction ({object, property, options, argumentText}) {
  let element = document.getElementById(object)

  /* istanbul ignore if */
  if (!element) {
    logger.warn(`找不到 id 为 ${object} 的 element`)
    return
  }

  let params = {
    handler: property,
    event: options.event,
    target: element
  }
  let args

  if (argumentText) {
    try {
      let fn = parse(argumentText, 'MIPActionArguments')
      let args = fn(options)
      params.args = args[0]
    } catch (e) {}
  }

  if (dom.isMIPElement(element)) {
    // 这里需要在后期做更好的处理
    if (params.args) {
      params.arg = args.map(a => JSON.stringify(a)).join(',')

    } else {
      // 当严格的参数写法解析失败的情况下，就直接将原参数文本返回（fallback）
      params.arg = argumentText
    }
    let isTargeted = element.executeEventAction(params)
    if (isTargeted) {
      return
    }
  }

  if (actions[property]) {
    return actions[property](params)
  }

  logger.warn(`找不到名为 ${property} 的方法`)
}

