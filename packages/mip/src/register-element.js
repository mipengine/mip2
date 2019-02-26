/**
 * @file base class of v1 custom element
 * @author sfe-sy (sfe-sy@baidu.com)
 */

import BaseElement from './base-element'
import customElementsStore from './custom-element-store'
import cssLoader from './util/dom/css-loader'

/**
 * Add a style tag to head by csstext
 *
 * @param {string} css Css code
 * @param {string} name name
 */
function loadCss (css, name) {
  if (css) {
    cssLoader.insertStyleElement(document, document.head, css, name, false)
  }
}

/**
 * Register MIPElement.
 *
 * @param {string} name Name of a MIPElement.
 * @param {Class} elementClass element class
 * @param {string} css The csstext of the MIPElement.
 * @return {HTMLElement[]}
 */
function registerElement (name, elementClass, css) {
  if (customElementsStore.get(name)) {
    return
  }

  // store the name-clazz pair
  customElementsStore.set(name, elementClass, 'mip2')

  /** @type {Array<BaseElement>} */
  let customElementInstances = []

  loadCss(css, name)
  window.customElements.define(name, class extends BaseElement {
    static get observedAttributes () {
      return elementClass.observedAttributes
    }

    constructor (...args) {
      super(...args)

      customElementInstances.push(this)
    }
  })

  return customElementInstances
}

export default registerElement
