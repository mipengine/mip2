/**
 * @file Resource Function
 * @author xx
 */

import fn from './util/fn'
import Gesture from './util/gesture/index'
import viewport from './viewport'
import rect from './util/dom/rect'

/**
 * Store the resources.
 * @inner
 * @type {Object}
 */
let resources = {}

/**
 * Resources counter.
 * @inner
 * @type {number}
 */
let counter = 0

/**
 * MIP Elements's controller. It's use to manage all the elements's custom life circle and
 * provide the overall interfaces of the MIP Elements.
 *
 * @class
 */

class Resources {
  constructor () {
    /**
     * Resources id
     * @private
     * @type {number}
     */
    this._rid = counter++

    /**
     * Element id
     * @private
     * @type {number}
     */
    this._eid = 0

    // add to resources
    resources[this._rid] = {}

    /**
     * The method to udpate state.
     * @type {Function}
     */
    this.updateState = this._update.bind(this)

    /**
     * Viewport
     * @private
     * @type {Object}
     */
    this._viewport = viewport

    this._gesture = new Gesture(document.body, {
      preventX: false
    })
    this._bindEvent()
  }

  /**
   * Bind the events of current object.
   */
  _bindEvent () {
    let self = this
    let timer
    this._viewport.on('changed resize', this.updateState)
    this._gesture.on('swipe', function (e, data) {
      let delay = Math.round(data.velocity * 600)
      delay < 100 && (delay = 100)
      delay > 600 && (delay = 600)
      clearTimeout(timer)
      timer = setTimeout(self.updateState, delay)
    })

    this.updateState()
  }

  /**
   * Add an element for current object and update all the elements's state.
   *
   * @param {MIPElement} element A mip element
   */
  add (element) {
    element._eid = this._eid++
    resources[this._rid][element._eid] = element
    element.build()
    this.updateState()
  }

  /**
   * Remove element from current resources object.
   *
   * @param {MIPElement|string} element Mip element or _eid of element
   * @return {boolean} the removed state of element
   */
  remove (element) {
    let id = element._eid || element
    if (Number.isFinite(+id) && resources[this._rid][id]) {
      delete resources[this._rid][id]
      return true
    }
    return false
  }

  /**
   * Return an object of resources.
   *
   * @return {Array}
   */
  getResources () {
    return resources[this._rid]
  }

  /**
   * Return an array of resources.
   *
   * @return {Array}
   */
  getResourcesList () {
    return fn.values(this.getResources())
  }

  /**
   * Set an element's viewport state to 'true' or 'false'.
   *
   * @param {MIPElement} element element
   * @param {boolean} inViewport inViewport
   */
  setInViewport (element, inViewport) {
    if (element.inViewport() !== inViewport) {
      element.viewportCallback(inViewport)
    }
  }

  /**
   * Update elements's viewport state.
   */
  _update () {
    let resources = this.getResources()
    let viewportRect = this._viewport.getRect()

    for (let i in resources) {
      // Compute the viewport state of current element.
      // If current element`s prerenderAllowed returns `true` always set the state to be `true`.
      let elementRect = rect.getElementRect(resources[i])
      let inViewport = resources[i].prerenderAllowed(elementRect, viewportRect) ||
        rect.overlapping(elementRect, viewportRect)
      this.setInViewport(resources[i], inViewport)
    }
  }

  /**
   * Forced set the element's viewport state to 'true'.
   *
   * @param {MIPElement} element element
   */
  prerenderElement (element) {
    if (element.inViewport && !element.inViewport()) {
      element.viewportCallback && element.viewportCallback(true)
    }
  }
}

export default new Resources()
