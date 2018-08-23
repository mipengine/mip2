/**
 * @file MIP 视图相关方法集合
 * @author sekiyika(pengxing@baidu.com)
 */

import EventEmitter from './util/event-emitter'
import rect from './util/dom/rect'
import fn from './util/fn'
import platform from './util/platform'
// import fixedElement from './fixed-element'

// Native objects.
const docElem = document.documentElement
const win = window

/**
 * 触发 scroll 事件
 */
let scrollEvent = fn.throttle(function (event) {
  this.trigger('scroll', event)
}, 1000 / 60)

/**
 * 触发 changed 事件
 */
let changedEvent = fn.throttle(function (event) {
  this.trigger('changed', event)
}, 200)

/**
 * 滚动事件回调
 *
 * @param {Object} event 事件对象
 */
let scrollHandle = function (event) {
  scrollEvent.call(this, event)
  changedEvent.call(this, event)
}

/**
 * 窗口改变事件回调
 * https://stackoverflow.com/questions/8898412/iphone-ipad-triggering-unexpected-resize-events
 *
 * @param {Object} event 事件对象
 */
let savedWindowWidth = win.innerWidth || docElem.clientWidth
let currentWindowWidth
let resizeEvent = fn.throttle(function (event) {
  currentWindowWidth = this.getWidth()
  if (currentWindowWidth !== savedWindowWidth) {
    this.trigger('resize', event)
    savedWindowWidth = currentWindowWidth
  }
}, 200)

/**
 * The object is to solve a series of problems when the page in an iframe and
 * provide some additional methods.
 */
let viewport = {
  /**
   * Initialize the viewport
   *
   * @return {Viewport}
   */
  init () {
    this.scroller = platform.needSpecialScroll ? document.body : win

    this.scroller.addEventListener('scroll', scrollHandle.bind(this), false)

    win.addEventListener('resize', resizeEvent.bind(this))
  },

  /**
   * Get the current vertical position of the page
   *
   * @return {number}
   */
  getScrollTop () {
    return rect.getScrollTop()
  },

  /**
   * Get the current horizontal position of the page
   *
   * @return {number}
   */
  getScrollLeft () {
    return rect.getScrollLeft()
  },

  /**
   * Set the current vertical position of the page
   *
   * @param {number} top The target scrollTop
   */
  setScrollTop (top) {
    rect.setScrollTop(top || 1)
  },

  /**
   * Get the width of the viewport
   *
   * @return {number}
   */
  getWidth () {
    return win.innerWidth || docElem.clientWidth
  },

  /**
   * Get the height of the viewport
   *
   * @return {number}
   */
  getHeight () {
    /* istanbul ignore next */
    return platform.isIOS() ? (docElem.clientHeight || win.innerHeight)
      : (win.innerHeight || docElem.clientHeight)
  },

  /**
   * Get the scroll width of the page
   *
   * @return {number}
   */
  getScrollWidth () {
    return rect.getScrollWidth()
  },

  /**
   * Get the scroll height of the page
   *
   * @return {number}
   */
  getScrollHeight () {
    return rect.getScrollHeight()
  },

  /**
   * Get the rect of the viewport.
   *
   * @return {Object}
   */
  getRect () {
    return rect.get(
      this.getScrollLeft(),
      this.getScrollTop(),
      this.getWidth(),
      this.getHeight()
    )
  }
}

// Mix the methods and attributes of Event into the viewport.
EventEmitter.mixin(viewport)

// export default init.call(viewport);
export default viewport
