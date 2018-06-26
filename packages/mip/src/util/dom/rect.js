/**
 * @file rect
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict'

// Save the native object or method.
let docBody = document.body
let docElem = document.documentElement
let round = Math.round

/**
 * Browsers have some bugs in frame of IOS, the native getBoundingClientRect() also needs to recalculate,
 * so increase the "this" module.
 */
export default {

  setScroller (scroller) {
    this.scroller = scroller
  },

  get (left, top, width, height) {
    left = round(left)
    top = round(top)
    width = round(width)
    height = round(height)
    return {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height
    }
  },

  /**
   * Get an element's rect.
   *
   * @param {HTMLElement} element element
   * @return {Object}
   */
  getElementRect (element) {
    let clientRect = element.getBoundingClientRect()
    return this.get(clientRect.left + this.getScrollLeft(), clientRect.top + this.getScrollTop(),
      clientRect.width, clientRect.height)
  },

  /**
   * Get an element's offset.
   *
   * @param {HTMLElement} element element
   * @return {Object}
   */
  getElementOffset (element) {
    let clientRect = element.getBoundingClientRect()
    return {
      left: round(clientRect.left),
      top: round(clientRect.top),
      width: round(clientRect.width),
      height: round(clientRect.height)
    }
  },

  /**
   * Get scrollLeft
   *
   * @return {number}
   */
  getScrollLeft () {
    return round(this.scroller === window ? (docBody.scrollLeft || docElem.scrollLeft)
      : this.scroller.scrollLeft)
  },

  /**
   * Get scrollTop
   *
   * @return {number}
   */
  getScrollTop () {
    return round(this.scroller === window ? (docBody.scrollTop || docElem.scrollTop)
      : (this.scroller.scrollTop === 1 ? 0 : this.scroller.scrollTop))
  },

  /**
   * Set scrollTop
   *
   * @param {number} top top
   */
  setScrollTop (top) {
    if (this.scroller === window) {
      window.scrollTo(0, top)
    } else {
      // scroll top is 0, it's set to 1 to avoid scroll-freeze issue
      // https://github.com/ampproject/amphtml/issues/330
      this.scroller.scrollTop = top || 1
    }
  },

  /**
   * Get scrollHeight
   *
   * @return {number}
   */
  getScrollHeight () {
    return round(this.scroller === window ? (docBody.scrollHeight || docElem.scrollHeight)
      : this.scroller.scrollHeight)
  },

  /**
   * Get scrollWidth.
   *
   * @return {number}
   */
  getScrollWidth () {
    return window.innerWidth
  },

  /**
   * Whether two rect object are overlapped.
   *
   * @param {Object} rect1 rect1
   * @param {Object} rect2 rect2
   * @return {boolean}
   */
  overlapping (rect1, rect2) {
    return rect1.top <= rect2.bottom && rect2.top <= rect1.bottom &&
      rect1.left <= rect2.right && rect2.left <= rect1.right
  }
}
