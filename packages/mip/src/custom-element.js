/**
 * @file custom-element.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import EventEmitter from './util/event-emitter'

class CustomElement {
  constructor (element) {
    /**
     * @type {MIPElement}
     * @public
     */
    this.element = element

    // 不推荐使用
    if (this.init) {
      this.init()
    }
  }

  /**
   * Set observed attributes
   *
   * @static
   * @return {Array} array of attribute name
   */
  static get observedAttributes () {
    return []
  }

  /**
   * Apply the fill content style to an element
   *
   * @param {HTMLElement} ele element
   * @param {boolean} isReplaced whether replaced or not
   */
  applyFillContent (ele, isReplaced) {
    ele.classList.add('mip-fill-content')
    if (isReplaced) {
      ele.classList.add('mip-replaced-content')
    }
  }

  connectedCallback () {}

  disconnectedCallback () {}

  /**
   * Called when the MIPElement's attribute is changed.
   */
  attributeChangedCallback () {}

  /**
   * Called when the MIPElement first enters the viewport.
   */
  firstInviewCallback () {}

  /**
   * Called when the MIPElement has entered or exited the viewport.
   */
  viewportCallback () {}

  /**
   * Control whether the MIPElement is rendred ahead.
   *
   * @return {boolean} If the result is TRUE, the element will be rendred ahead.
   */
  prerenderAllowed () {
    return false
  }

  /**
   * Return the current component containing resources.
   * If it returns true, complete should be called.
   *
   * @return {boolean} whether has resource or not
   */
  hasResources () {
    return false
  }

  /**
   * Called when the MIPElement is first inserted into the document.
   */
  build () {}

  /**
   * Expend current element's attributes which selected by attrs to an other object.
   *
   * @param {Array.<string>} attrs Attributes' name list
   * @param {Object} element The target element
   * @return {Object}
   */
  expendAttr (attrs, element) {
    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i]
      if (this.element.hasAttribute(attr)) {
        let val = this.element.getAttribute(attr)
        element.setAttribute
          ? element.setAttribute(attr, val)
          : element[attr] = val
      }
    }
    return element
  }

  /**
   * Add event actions such as `this.addEventAction("default open", handler)`
   *
   * @param {string} name event name
   * @param {Function} handler event handler
   */
  addEventAction (/* name, handler */) {
    let evt = this._actionEvent
    if (!evt) {
      evt = this._actionEvent = new EventEmitter()
      evt.setEventContext(this)
    }

    evt.on.apply(evt, arguments)
  }

  /**
    * Trigger the handlers had been added by `addEventAction` of an action
    *
    * @param {string} action The action's name
    */
  executeEventAction (action) {
    let eventObj = this._actionEvent
    if (action && eventObj) {
      eventObj.trigger(action.handler, action.event, action.arg)
    }
  }

  /**
   * Notice that resources are loaded.
   */
  resourcesComplete () {
    this.element.resourcesComplete()
  }
}

export default CustomElement
