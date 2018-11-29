/**
 * @file Element Function
 * @author xx
 */

import cssLoader from '../util/dom/css-loader'
import {applyLayout} from '../layout'
import performance from '../performance'
import resources from '../resources'
import customElementsStore from '../custom-element-store'
import prerender from '../client-prerender'
import {customEmit} from '../util/custom-event'

/* globals HTMLElement */

/**
 * Save the base element prototype to avoid duplicate initialization.
 * @inner
 * @type {Object}
 */
let baseElementProto

/**
 * Create a basic prototype of mip elements classes
 *
 * @return {Object}
 */
function createBaseElementProto () {
  if (baseElementProto) {
    return baseElementProto
  }

  // Base element inherits from HTMLElement
  let proto = Object.create(HTMLElement.prototype)

  /**
   * Created callback of MIPElement. It will initialize the element.
   */
  proto.createdCallback = function () {
    // get mip1 clazz from custom elements store
    let CustomElement = customElementsStore.get(this.tagName, 'mip1')

    this.classList.add('mip-element')

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

    /**
     * Instantiated the custom element.
     * @type {Object}
     * @public
     */
    let customElement = this.customElement = new CustomElement(this)
    customElement.createdCallback()

    // Add first-screen element to performance.
    if (customElement.hasResources()) {
      performance.addFsElement(this)
    }
  }

  /**
   * When the element is inserted into the DOM, initialize the layout and add the element to the '_resources'.
   */
  proto.attachedCallback = function () {
    // Apply layout for this.
    this._layout = applyLayout(this)
    this.customElement.attachedCallback()
    this._resources.add(this)
  }

  /**
   * When the element is removed from the DOM, remove it from '_resources'.
   */
  proto.detachedCallback = function () {
    this.customElement.detachedCallback()
    this._resources.remove(this)
    performance.fsElementLoaded(this)
  }

  proto.attributeChangedCallback = function (attributeName, oldValue, newValue, namespace) {
    let ele = this.customElement
    prerender.execute(() => {
      ele.attributeChangedCallback(...arguments)
    }, this)
  }

  /**
   * Check whether the element is in the viewport.
   *
   * @return {boolean}
   */
  proto.inViewport = function () {
    return this._inViewport
  }

  /**
   * Called when the element enter or exit the viewport.
   *
   * @param {boolean} inViewport whether in viewport or not
   * And it will call the firstInviewCallback and viewportCallback of the custom element.
   */
  proto.viewportCallback = function (inViewport) {
    this._inViewport = inViewport
    if (!this._firstInViewport) {
      this._firstInViewport = true
      this.customElement.firstInviewCallback()
    }
    this.customElement.viewportCallback(inViewport)
  }

  /**
   * Check whether the building callback has been executed.
   *
   * @return {boolean}
   */
  proto.isBuilt = function () {
    return this._built
  }

  /**
   * Check whether the element need to be rendered in advance.
   *
   * @return {boolean}
   */
  proto.prerenderAllowed = function () {
    return this.customElement.prerenderAllowed()
  }

  /**
   * Build the element and the custom element.
   * This will be executed only once.
   */
  proto.build = function () {
    if (this.isBuilt()) {
      return
    }

    // Add `try ... catch` avoid the executing build list being interrupted by errors.
    try {
      this.customElement.build()
      this._built = true
      customEmit(this, 'build')
    } catch (e) {
      customEmit(this, 'build-error', e)
      console.warn('build error:', e)
    }
  }

  /**
   * Method of executing event actions of the custom Element
   *
   * @param {Object} action event action
   */
  proto.executeEventAction = function (action) {
    this.customElement.executeEventAction(action)
  }

  /**
   * Called by customElement. And tell the performance that element is loaded.
   * @deprecated
   */
  proto.resourcesComplete = function () {
    performance.fsElementLoaded(this)
  }

  baseElementProto = proto

  return baseElementProto
}

/**
 * Create a mip element prototype by name
 *
 * @param {string} name The mip element's name
 * @return {Object}
 */
function createMipElementProto (name) {
  let proto = Object.create(createBaseElementProto())
  proto.name = name
  return proto
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
 * @return {Array<HTMLElement>|undefined}
 */
function registerElement (name, elementClass, css) {
  if (customElementsStore.get(name)) {
    return
  }

  // store the name-clazz pair
  customElementsStore.set(name, elementClass, 'mip1')

  /** @type {Array<BaseElement>} */
  let customElementInstances = []

  // Override createdCallback to count element instances
  let mipElementProto = createMipElementProto(name)
  let createdCallback = mipElementProto.createdCallback
  mipElementProto.createdCallback = function () {
    createdCallback.call(this)
    customElementInstances.push(this)
  }

  loadCss(css, name)
  document.registerElement(name, {
    prototype: mipElementProto
  })

  return customElementInstances
}

export default registerElement
