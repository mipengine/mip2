/**
 * @file Custom Element
 * @author xx
 */

import EventEmitter from '../util/event-emitter'

/**
 * The constructor of  base class of custom element
 *
 * @param {MIPElement} element element
 * @class
 */
class customElement {
  constructor (element) {
    /**
     * @type {MIPElement}
     * @public
     */
    this.element = element
    if (this.init) {
      this.init()
    }
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

  /**
   * Called when the MIPElement is created.
   */
  createdCallback () {}

  /**
   * Called when the MIPElement is inserted into the DOM.
   */
  attachedCallback () {}

  /**
   * Called when the MIPElement is removed from the DOM.
   */
  detachedCallback () {}

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
  addEventAction () {
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

export default {

  /**
   * Create a class of a new type mip element
   *
   * @return {Function}
   */
  create () {
    function impl (element) {
      customElement.call(this, element)
    }
    impl.prototype = Object.create(customElement.prototype)
    return impl
  }
}
