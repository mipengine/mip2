import {handleScrollTo as scrollTo} from '../../page/util/ease-scroll'
import {LAYOUT, getLayoutClass} from '../../layout'
import parser from '../parser/index'
import log from '../log'

const logger = log('Event-Action')
const {transform} = parser

function isObjective (args) {
  let arg = args[0]
  if (typeof arg === 'object') {
    return true
  }
  return false
}

function getAutofocusElement (el) {
  if (el.hasAttribute('autofocus')) {
    return el
  }
  return el.querySelector('[autofocus]')
}

function toggle (el, opt) {
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
function handleShow ({target}) {
  if (target.classList.contains(getLayoutClass(LAYOUT.NODISPLAY))) {
    logger.warn('layout=nodisplay 的元素不能被动态显示')
    return
  }
  const autofocusEl = getAutofocusElement(target)
  toggle(target, true)
  if (autofocusEl) {
    handleFocus(autofocusEl)
  }
}

/**
 * 隐藏元素
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleHide ({target}) {
  toggle(target, false)
}

/**
 * 显示/隐藏元素
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleToggle ({target}) {
  toggle(target)
}

/**
 * 滚动到目标元素
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleScrollTo ({arg, target}) {
  const parsedArg = transform(arg)()
  let param
  if (isObjective(parsedArg)) {
    param = parsedArg[0]
  } else {
    param = {
      duration: parsedArg[0],
      position: parsedArg[1]
    }
  }
  scrollTo(target, param)
}

/**
 * 添加/删除元素 class
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleToggleClass ({arg, target}) {
  const parsedArg = transform(arg)()
  let className
  let force
  if (isObjective(parsedArg)) {
    className = parsedArg.class
    force = parsedArg.force
  } else {
    className = parsedArg[0]
    force = parsedArg[1]
  }
  if (!className || typeof className !== 'string') {
    logger.warn('class 不能为空且必须是 string 类型')
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
function handleFocus ({target}) {
  target.focus()
}

export const globalAction = {
  show: handleShow,
  hide: handleHide,
  toggle: handleToggle,
  scrollTo: handleScrollTo,
  toggleClass: handleToggleClass,
  focus: handleFocus
}