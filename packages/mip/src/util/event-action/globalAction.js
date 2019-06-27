import {handleScrollTo as scrollTo} from '../../page/util/ease-scroll'
import {LAYOUT, getLayoutClass} from '../../layout'
import log from '../log'

const logger = log('Event-Action')

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
function handleShow (action, target) {
  if (target.classList.contains(getLayoutClass(LAYOUT.NODISPLAY))) {
    logger.warn('layout=nodisplay 的元素不能被动态显示')
    return
  }
  const autofocusEl = getAutofocusElement(target)
  toggle(target, true)
  if (autofocusEl) {
    this.handleFocus(action, autofocusEl)
  }
}

/**
 * 隐藏元素
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleHide (action, target) {
  toggle(target, false)
}

/**
 * 显示/隐藏元素
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleToggle (action, target) {
  toggle(target)
}

/**
 * 滚动到目标元素
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleScrollTo (action, target) {
  let data = {}
  try {
    data = (new Function(`{return ${action.arg}}`))()
  } catch (e) {
    logger.warn('scrollTo 参数有误')
  }
  scrollTo(target, data)
}

/**
 * 添加/删除元素 class
 * 
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleToggleClass (action, target) {
  let data = {}
  try {
    data = (new Function(`{return ${action.arg}}`))()
  } catch (e) {
    logger.warn('toggleClass 参数有误')
    return
  }
  const className = data['class']
  const {force} = data
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
 * @param {Object} action action
 * @param {HTMLElement} target 目标元素
 */
function handleFocus (action, target) {
  target.focus()
}

export const globalAction = {
  handleShow,
  handleHide,
  handleToggle,
  handleScrollTo,
  handleToggleClass,
  handleFocus
}