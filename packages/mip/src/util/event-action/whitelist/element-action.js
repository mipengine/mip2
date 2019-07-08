// import {handleScrollTo} from '../../page/util/ease-scroll'
import {handleScrollTo} from '../../../page/util/ease-scroll'
import {LAYOUT, getLayoutClass} from '../../../layout'
// import parser from '../parser/index'
import log from '../../log'

const logger = log('Event-Action')
// const {transform} = parser

// function isObjective (args) {
//   let arg = args[0]
//   if (typeof arg === 'object') {
//     return true
//   }
//   return false
// }

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

function getAutofocusElement (el) {
  if (el.hasAttribute('autofocus')) {
    return el
  }
  return el.querySelector('[autofocus]')
}

function toggleHide (el, opt) {
  if (opt === undefined) {
    el.classList.toggle('mip-hide')
    return
  }
  el.classList.toggle('mip-hide', !opt)
}

/**
 * 显示元素，如果元素或其子元素有 autofocus 属性，focus 到该元素
 *
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function show ({target}) {
  if (target.classList.contains(getLayoutClass(LAYOUT.NODISPLAY))) {
    logger.warn('layout=nodisplay 的元素不能被动态显示')
    return
  }
  const autofocusEl = getAutofocusElement(target)
  toggleHide(target, true)
  if (autofocusEl) {
    focus(autofocusEl)
  }
}

/**
 * 隐藏元素
 *
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function hide ({target}) {
  toggleHide(target, false)
}

/**
 * 显示/隐藏元素
 *
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function toggle ({target}) {
  toggleHide(target)
}

/**
 * 滚动到目标元素
 *
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function scrollTo ({args, target}) {
  // const parsedArg = transform(arg)()
  // let param
  // if (isObjective(parsedArg)) {
  //   param = parsedArg[0]
  // } else {
  //   param = {
  //     duration: parsedArg[0],
  //     position: parsedArg[1]
  //   }
  // }
  handleScrollTo(target, args)
}

/**
 * 添加/删除元素 class
 *
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function toggleClass ({args, target}) {
  // const parsedArg = transform(arg)()
  let {
    class: className,
    force
  } = args
  // let className
  // let force
  // if (isObjective(parsedArg)) {
  //   className = parsedArg.class
  //   force = parsedArg.force
  // } else {
  //   className = parsedArg[0]
  //   force = parsedArg[1]
  // }
  if (!className || typeof className !== 'string') {
    logger.warn('class 不能为空且必须是 string 类型')
    return
  }
  if (force !== undefined) {
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

export default function elementAction ({object, property, options, args}) {
  let element = document.getElementById(object)

  if (!element) {
    logger.warn(`找不到 id 为 ${object} 的 element`)
    return
  }

  let params = {
    handler: property,
    event: options.event,
    target: element,
    args: args
  }

  if (dom.isMIPElement(element)) {
    params.arg = args.map(arg => JSON.stringify(arg)).join(',')
    return element.executeEventAction(params)
  }

  if (actions[property]) {
    return actions[property](params)
  }

  logger.warn(`找不到名为 ${property} 的全局方法`)
}

// export const globalAction = {
//   show: handleShow,
//   hide: handleHide,
//   toggle: handleToggle,
//   scrollTo: handleScrollTo,
//   toggleClass: handleToggleClass,
//   focus: handleFocus
// }
