/**
 * @file MIP 视图相关方法集合
 * @author sekiyika(pengxing@baidu.com)
 */

import EventEmitter from './util/event-emitter'
import rect from './util/dom/rect'
import fn from './util/fn'
import platform from './util/platform'

// Native objects.
const docElem = document.documentElement
const win = window

let getHeight = () => platform.isIOS()
  ? (docElem.clientHeight || win.innerHeight)
  : (win.innerHeight || docElem.clientHeight)
let getWidth = () => win.innerWidth || docElem.clientWidth

let cachedScrollLeft
let cachedScrollTop
let cachedScrollHeight
let cachedScrollWidth
let cachedWidth
let cachedHeight

let updateCachedScroll = () => {
  cachedScrollLeft = rect.getScrollLeft()
  cachedScrollTop = rect.getScrollTop()
  cachedScrollHeight = rect.getScrollHeight()
  cachedScrollWidth = rect.getScrollWidth()
}

let updateCachedSize = () => {
  cachedWidth = getWidth()
  cachedHeight = getHeight()
}

updateCachedScroll()
updateCachedSize()

// 给测试环境使用
if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable */
  Object.defineProperty(win, 'innerWidth', {
    set (val) {
      cachedWidth = val
    }
  })

  Object.defineProperty(win, 'innerHeight', {
    set(val) {
      cachedHeight = val
    }
  })
  /* eslint-enable */
}

/**
 * 滚动事件回调
 *
 * @param {Object} event 事件对象
 */
let scrollHandle = fn.throttle(function (event) {
  updateCachedScroll()

  this.trigger('scroll', event)
  this.trigger('changed', event)
}, 1000 / 60)

/**
 * 窗口改变事件回调
 * https://stackoverflow.com/questions/8898412/iphone-ipad-triggering-unexpected-resize-events
 *
 * @param {Object} event 事件对象
 */
let resizeEvent = fn.throttle(function (event) {
  let width = getWidth()
  if (cachedWidth !== width) {
    this.trigger('resize', event)
    cachedWidth = width
  }
}, 1000 / 60)

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
   * Update cache of size immediate
   */
  updateCachedSize,

  /**
   * Update cache of scroll rect data immediate
   */
  updateCachedScroll,

  /**
   * Get the current vertical position of the page
   *
   * @return {number}
   */
  getScrollTop () {
    return cachedScrollTop
  },

  /**
   * Get the current horizontal position of the page
   *
   * @return {number}
   */
  getScrollLeft () {
    return cachedScrollLeft
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
    return cachedWidth
  },

  /**
   * Get the height of the viewport
   *
   * @return {number}
   */
  getHeight () {
    /* istanbul ignore next */
    return cachedHeight
  },

  /**
   * Get the scroll width of the page
   *
   * @return {number}
   */
  getScrollWidth () {
    return cachedScrollWidth
  },

  /**
   * Get the scroll height of the page
   *
   * @return {number}
   */
  getScrollHeight () {
    return cachedScrollHeight
  },

  /**
   * Get the rect of the viewport.
   *
   * @return {Object}
   */
  getRect () {
    return rect.get(
      cachedScrollLeft,
      cachedScrollTop,
      cachedWidth,
      cachedHeight
    )
  },

  /**
   * Get an element's rect.
   *
   * @param {HTMLElement} element element
   * @return {Object}
   */
  getElementRect (element) {
    let clientRect = element.getBoundingClientRect()
    return rect.get(clientRect.left + cachedScrollLeft, clientRect.top + cachedScrollTop,
      clientRect.width, clientRect.height)
  }
}

// Mix the methods and attributes of Event into the viewport.
EventEmitter.mixin(viewport)

// export default init.call(viewport);
export default viewport
