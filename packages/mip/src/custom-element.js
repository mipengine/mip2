/**
 * @file custom-element.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import EventEmitter from './util/event-emitter'

class CustomElement {
  constructor (element) {
    /** @public @type {MIPElement} */
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
   * Called when the MIPElement's append to dom.
   */
  connectedCallback () {}

  /**
   * Called when the MIPElement's remove from dom.
   */
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
   * Requests the element to unload any expensive resources when the element
   * goes into non-visible state.
   *
   * @return {boolean}
   */
  unlayoutCallback () {
    return false
  }

  /**
   * Subclasses can override this method to create a dynamic placeholder
   * element and return it to be appended to the element. This will only
   * be called if the element doesn't already have a placeholder.
   * @return {?Element}
   */
  createPlaceholderCallback () {
    return null
  }

  /**
   * Called when the element should perform layout. At this point the element
   * should load/reload resources associated with it. This method is called
   * by the runtime and cannot be called manually. Returns promise that will
   * complete when loading is considered to be complete.
   *
   * @return {!Promise}
   */
  layoutCallback () {
    return Promise.resolve()
  }

  /**
   * Called to notify the element that the first layout has been successfully
   * completed.
   */
  firstLayoutCompleted () {}

  /**
   * Hides or shows the placeholder, if available.
   * @param {boolean} state
   */
  togglePlaceholder (state) {
    this.element.togglePlaceholder(state)
  }

  /**
   * Indicate a element whether has a loading.
   */
  isLoadingEnabled () {
    return false
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
   * @param {Object} action The action object.
   */
  executeEventAction (action) {
    let eventObj = this._actionEvent
    if (action && eventObj) {
      eventObj.trigger(action.handler, action.event, action.arg)
    }
  }

  /**
   * Notice that resources are loaded.
   * @deprecated
   */
  resourcesComplete () {
    // istanbul ignore next
    this.element.resourcesComplete()
  }
}

export default CustomElement
