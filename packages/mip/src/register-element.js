/**
 * @file base class of v1 custom element
 * @author sfe-sy (sfe-sy@baidu.com)
 */

/* global HTMLElement */
/* eslint-disable no-proto */

import viewport from './viewport'
import layout from './layout'
import performance from './performance'
import customElementsStore from './custom-element-store'
import cssLoader from './util/dom/css-loader'

let _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
  ? obj => typeof obj
  : obj => (obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj)

let _fixBabelExtend = (function (O) {
  let gPO = O.getPrototypeOf || function (o) {
    return o.__proto__
  }
  let sPO = O.setPrototypeOf || function (o, p) {
    o.__proto__ = p
    return o
  }
  let construct = (typeof Reflect === 'undefined' ? 'undefined' : _typeof(Reflect)) === 'object' ? Reflect.construct : function (Parent, args, Class) {
    let Constructor
    let a = [null]
    a.push.apply(a, args)
    Constructor = Parent.bind.apply(Parent, a)
    return sPO(new Constructor(), Class.prototype)
  }

  return function fixBabelExtend (Class) {
    var Parent = gPO(Class)
    return sPO(Class, sPO(function Super () {
      return construct(Parent, arguments, gPO(this).constructor)
    }, Parent))
  }
}(Object))

function inherits (subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
  if (superClass) {
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
  }
}

function possibleConstructorReturn (self, call) {
  return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}

let createClass = (function createClass () {
  function defineProperties (target, props) {
    for (let i = 0; i < props.length; i++) {
      let descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) {
        descriptor.writable = true
      }
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) {
      defineProperties(Constructor.prototype, protoProps)
    }
    if (staticProps) {
      defineProperties(Constructor, staticProps)
    }
    return Constructor
  }
}())

let BaseElement = _fixBabelExtend(function (_HTMLElement) {
  inherits(BaseElement, _HTMLElement)

  function BaseElement (element) {
    // get mip2 clazz from custom elements store

    var _this = possibleConstructorReturn(
      this,
      (BaseElement.__proto__ || Object.getPrototypeOf(BaseElement)).call(this, element)
    )

    var CustomElement = customElementsStore.get(_this.tagName.toLowerCase(), 'mip2')

    /**
     * Viewport state
     * @private
     * @type {boolean}
     */
    _this._inViewport = false

    /**
     * Whether the element is into the viewport.
     * @private
     * @type {boolean}
     */
    _this._firstInViewport = false

    /**
     * The resources object.
     * @private
     * @type {Object}
     */
    _this._resources = viewport.resources

    _this.__innerHTML = _this.innerHTML

    /**
     * Mip templates nodelist
     *
     * @type {NodeList}
     */
    _this.templates = _this.querySelectorAll('template[type^=mip-]')

    /**
     * Instantiated the custom element.
     * @type {Object}
     * @public
     */
    var customElement = _this.customElement = new CustomElement(_this)

    // Add first-screen element to performance.
    if (customElement.hasResources()) {
      performance.addFsElement(_this)
    }
    return _this
  }

  BaseElement.prototype.connectedCallback = function connectedCallback () {
    // Apply layout for this.
    this.classList.add('mip-element')
    this._layout = layout.applyLayout(this)
    this.customElement.connectedCallback()

    // Add to resource manager.
    this._resources && this._resources.add(this)
  }

  BaseElement.prototype.disconnectedCallback = function disconnectedCallback () {
    this.customElement.disconnectedCallback()
    this._resources && this._resources.remove(this)
    // performance.fsElementLoaded(this);
  }

  BaseElement.prototype.attributeChangedCallback = function attributeChangedCallback () {
    var ele = this.customElement
    ele.attributeChangedCallback.apply(ele, arguments)
  }

  BaseElement.prototype.build = function build () {
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

  BaseElement.prototype.isBuilt = function isBuilt () {
    return this._built
  }

  BaseElement.prototype.cloneNode = function cloneNode (deep) {
    var newNode = HTMLElement.prototype.cloneNode.call(this, deep)
    newNode.__innerHTML = this.__innerHTML
    return newNode
  }

  BaseElement.prototype.inViewport = function inViewport () {
    return this._inViewport
  }

  BaseElement.prototype.viewportCallback = function viewportCallback (inViewport) {
    this._inViewport = inViewport
    if (!this._firstInViewport) {
      this._firstInViewport = true
      this.customElement.firstInviewCallback()
    }
    this.customElement.viewportCallback(inViewport)
  }

  BaseElement.prototype.executeEventAction = function executeEventAction (action) {
    this.customElement.executeEventAction(action)
  }

  /**
   * Check whether the element need to be rendered in advance.
   *
   * @return {boolean}
   */
  BaseElement.prototype.prerenderAllowed = function prerenderAllowed () {
    return this.customElement.prerenderAllowed()
  }

  /**
   * Called by customElement. And tell the performance that element is loaded.
   */
  BaseElement.prototype.resourcesComplete = function resourcesComplete () {
    performance.fsElementLoaded(this)
  }

  return BaseElement
}(HTMLElement))

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
  // window.customElements.define(name, class extends BaseElement {
  //   static get observedAttributes () {
  //     return elementClass.observedAttributes
  //   }
  // })
  window.customElements.define(name, (function (_BaseElement) {
    function clazz () {
      return possibleConstructorReturn(this, (clazz.__proto__ || Object.getPrototypeOf(clazz)).apply(this, arguments))
    }
    inherits(clazz, _BaseElement)

    createClass(clazz, null, [{
      key: 'observedAttributes',
      get () {
        return elementClass.observedAttributes
      }
    }])
    return clazz
  }(BaseElement)))
}

export default registerElement
