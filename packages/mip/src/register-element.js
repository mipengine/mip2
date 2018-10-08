/**
 * @file base class of v1 custom element
 * @author sfe-sy (sfe-sy@baidu.com)
 */

/* global HTMLElement */

import resources from './resources'
import layout from './layout'
import performance from './performance'
import customElementsStore from './custom-element-store'
import cssLoader from './util/dom/css-loader'
import prerender from './client-prerender'

class BaseElement extends HTMLElement {
  constructor (element) {
    super(element)

    // get mip2 clazz from custom elements store
    let CustomElement = customElementsStore.get(this.tagName.toLowerCase(), 'mip2')

    /**
     * Viewport state
     * @private
     * @type {boolean}
     */
    this._inViewport = false

    /**
     * Whether the element is into the viewport.
     * @private
     * @type {boolean}
     */
    this._firstInViewport = false

    /**
     * The resources object.
     * @private
     * @type {Object}
     */
    this._resources = resources

    this.__innerHTML = this.innerHTML

    /**
     * Instantiated the custom element.
     * @type {Object}
     * @public
     */
    let customElement = this.customElement = new CustomElement(this)

    // Add first-screen element to performance.
    if (customElement.hasResources()) {
      performance.addFsElement(this)
    }
  }

  connectedCallback () {
    // Apply layout for this.
    this.classList.add('mip-element')
    this._layout = layout.applyLayout(this)
    this.customElement.connectedCallback()

    prerender.execute(() => {
      this._resources.add(this)
    }, this)
  }

  disconnectedCallback () {
    this.customElement.disconnectedCallback()
    this._resources && this._resources.remove(this)
    // performance.fsElementLoaded(this);
  }

  attributeChangedCallback () {
    let ele = this.customElement
    prerender.execute(() => {
      ele.attributeChangedCallback(...arguments)
    }, this)
  }

  build () {
    if (this.isBuilt()) {
      return
    }
    // Add `try ... catch` avoid the executing build list being interrupted by errors.
    try {
      this.customElement.build()
      this._built = true
    } catch (e) {
      console.warn('build error:', e)
    }
  }

  isBuilt () {
    return this._built
  }

  cloneNode (deep) {
    let newNode = super.cloneNode(deep)
    newNode.__innerHTML = this.__innerHTML
    return newNode
  }

  inViewport () {
    return this._inViewport
  }

  viewportCallback (inViewport) {
    this.customElement.viewportCallback(inViewport)
    this._inViewport = inViewport
    if (inViewport && !this._firstInViewport) {
      this._firstInViewport = true
      this.customElement.firstInviewCallback()
    }
  }

  executeEventAction (action) {
    this.customElement.executeEventAction(action)
  }

  /**
   * Check whether the element need to be rendered in advance
   *
   * @param {Object} elementRect element rect
   * @param {Object} viewportRect viewport rect
   *
   * @return {boolean}
   */
  prerenderAllowed (elementRect, viewportRect) {
    return this.customElement.prerenderAllowed(elementRect, viewportRect)
  }

  /**
   * Called by customElement. And tell the performance that element is loaded.
   */
  resourcesComplete () {
    performance.fsElementLoaded(this)
  }
}

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
 */
function registerElement (name, elementClass, css) {
  if (customElementsStore.get(name)) {
    return
  }

  // store the name-clazz pair
  customElementsStore.set(name, elementClass, 'mip2')

  loadCss(css, name)
  window.customElements.define(name, class extends BaseElement {
    static get observedAttributes () {
      return elementClass.observedAttributes
    }
  })
}

export default registerElement
