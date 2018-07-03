/**
 * @file custom element
 * @author sekiyika(pengxing@baidu.com)
 */

import CustomElement from '../../src/custom-element'

export default class MIPTestCustomElement extends CustomElement {
  static get observedAttributes () {
    return ['name']
  }

  init () {
    this.initCalled = true
  }

  connectedCallback () {
    this.connectedCallbackCalled = true
    this.applyFillContent(this.element, true)
  }

  disconnectedCallback () {
    this.disconnectedCallbackCalled = true
  }

  attributeChangedCallback () {
    this.attributeChangedCallbackCalled = true
  }

  firstInviewCallback () {
    this.firstInviewCallbackCalled = true
  }

  viewportCallback () {
    this.viewportCallbackCalled = true
  }

  prerenderAllowed () {
    this.prerenderAllowedCalled = true
    return true
  }

  hasResources () {
    this.hasResourcesCalled = true
    return false
  }
  build () {
    this.buildCalled = true
  }
}
