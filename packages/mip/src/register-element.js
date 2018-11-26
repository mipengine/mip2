/**
 * @file base class of v1 custom element
 * @author sfe-sy (sfe-sy@baidu.com)
 */

/* global HTMLElement */

import resources from './resources'
import {LAYOUT, applyLayout} from './layout'
import performance from './performance'
import customElementsStore from './custom-element-store'
import cssLoader from './util/dom/css-loader'
import dom from './util/dom/dom'
import css from './util/dom/css'
import {parseSizeList} from './size-list'
import {customEmit} from './util/custom-event'

/** @param {!Element} element */
function isInputPlaceholder (element) {
  return 'placeholder' in element
}

/**
 * Finds the last child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
function lastChildElement (parent, callback) {
  for (let child = parent.lastElementChild; child; child = child.previousElementSibling) {
    if (callback(child)) {
      return child
    }
  }
  return null
}

/**
 * Returns "true" for internal MIP nodes or for placeholder elements.
 * @param {!Node} node
 * @return {boolean}
 */
function isInternalNode (node) {
  let tagName = (typeof node === 'string') ? node : node.tagName
  if (tagName && tagName.toLowerCase().indexOf('mip-i-') === 0) {
    return true
  }

  if (node.tagName && (node.hasAttribute('placeholder') ||
      node.hasAttribute('fallback') ||
      node.hasAttribute('overflow'))) {
    return true
  }
  return false
}

class BaseElement extends HTMLElement {
  constructor (element) {
    super(element)

    /** @private {string} */
    this._name = this.tagName.toLowerCase()

    /** @private {boolean} */
    this._inViewport = false

    /** @private {boolean} */
    this._firstInViewport = false

    /** @private {Object} */
    this._resources = resources

    /** @private {?Element} */
    this._loadingContainer = null

    /** @private {?Element} */
    this._laodingElement = null

    /** @private {boolean|undefined} */
    this._loadingDisabled = undefined

    /** @private {string|null|undefined} */
    this._mediaQuery = undefined

    /** @private {SizeList|null|undefined} */
    this._sizeList = undefined

    /** @private {SizeList|null|undefined} */
    this._heightsList = undefined

    /** @private {string} */
    this._layout = LAYOUT.NODISPLAY

    /** @private {?Element|undefined} */
    this.spaceElement = undefined

    // get mip2 clazz from custom elements store
    let CustomElement = customElementsStore.get(this._name, 'mip2')

    /**
     * Instantiated the custom element.
     * @type {Object}
     * @public
     */
    this.customElement = new CustomElement(this)

    // Add first-screen element to performance.
    if (this.customElement.hasResources()) {
      performance.addFsElement(this)
    }
  }

  connectedCallback () {
    // Apply layout for this.
    this.classList.add('mip-element')
    this._layout = applyLayout(this)
    this.customElement.connectedCallback()
    this._resources.add(this)
  }

  disconnectedCallback () {
    this.customElement.disconnectedCallback()
    this._resources && this._resources.remove(this)
    // performance.fsElementLoaded(this);
  }

  attributeChangedCallback () {
    let ele = this.customElement
    ele.attributeChangedCallback(...arguments)
  }

  /**
   * Layout the element with content, and load resources, it must return a
   * promise, if there is not any async operation, it should resolve imediately
   * or it should return a pending promise. A loading animation will be
   * shown during resoures loading.
   *
   * This method is always called for first time in viewport
   *
   * @return {!Promise}
   */
  layoutCallback () {
    this.toggleLoading(true)
    return this.customElement.layoutCallback()
  }

  /**
   * It will be called when element remove by resource, unload resource
   * or unbind event.
   */
  unlayoutCallback () {
    return this.customElement.unlayoutCallback()
  }

  /**
   * Creates a placeholder for the element.
   * @return {?Element}
   */
  createPlaceholder () {
    return this.customElement.createPlaceholderCallback()
  }

  /**
   * Returns an optional placeholder element for this custom element.
   * @return {?Element}
   */
  getPlaceholder () {
    if (this.hasAttribute('placeholder')) {
      return null
    }

    return lastChildElement(this, el => {
      return el.hasAttribute('placeholder') && !isInputPlaceholder(el)
    })
  }

  /**
   * Hides or shows the placeholder, if available.
   * @param {boolean} show
   */
  togglePlaceholder (show) {
    const placeholder = this.getPlaceholder()
    if (!placeholder) {
      return
    }

    // istanbul ignore next
    if (show) {
      placeholder.classList.remove('mip-hidden')
    } else {
      placeholder.classList.add('mip-hidden')
    }
  }

  // /**
  //  * Returns an optional fallback element for this custom element.
  //  * @return {?Element}
  //  */
  // getFallback () {
  //   return lastChildElement(this, el => el.hasAttribute('fallback'))
  // }

  /**
   * Hides or shows the fallback, if available.
   * @param {boolean} show
   */
  toggleFallback (show) {
    this.classList.toggle('mip-notsupported', show)
  }

  /**
   * Whether the loading can be shown for this element.
   * @return {boolean}
   */
  isLoadingEnabled () {
    // 如果元素本身是 placeholder，则不显示 loading
    if (this.hasAttribute('placeholder')) {
      return false
    }

    // 如果没有设置容器大小，不显示 loading
    if (!this.classList.contains('mip-layout-size-defined')) {
      return false
    }

    if (this._loadingDisabled === undefined) {
      this._loadingDisabled = this.hasAttribute('noloading')
    }
    if (this._loadingDisabled) {
      return false
    }

    return this.customElement.isLoadingEnabled()
  }

  /**
   * Creates a loading object.
   */
  prepareLoading () {
    if (!this.isLoadingEnabled()) {
      return
    }

    if (!this._loadingContainer) {
      let container = dom.create(`
        <div class="mip-loading-container mip-fill-content mip-hidden">
        </div>
      `)
      let element = dom.create(`
        <div class="mip-loader">
          <div class="mip-loader-dot"></div>
          <div class="mip-loader-dot"></div>
          <div class="mip-loader-dot"></div>
        </div>
      `)

      container.appendChild(element)
      this.appendChild(container)
      this._loadingContainer = container
      this._laodingElement = element
    }
  }

  /**
   * Turns the loading indicator on or off.
   * @param {boolean} state
   * @param {{cleanup:boolean}=} options
   */
  toggleLoading (state, options) {
    const cleanup = options && options.cleanup

    if (!this.isLoadingEnabled()) {
      return
    }

    this.prepareLoading()
    if (!this._loadingContainer) {
      return
    }

    this._loadingContainer.classList.toggle('mip-hidden', !state)
    this._laodingElement.classList.toggle('mip-active', state)

    if (!state && cleanup) {
      let loadingContainer = this._loadingContainer
      this._loadingContainer = null
      this._loadingElement = null
      this.removeChild(loadingContainer)
    }
  }

  build () {
    if (this.isBuilt()) {
      return
    }

    // Add `try ... catch` avoid the executing build list being interrupted by errors.
    try {
      if (!this.getPlaceholder()) {
        const placeholder = this.createPlaceholder()
        if (placeholder) {
          this.appendChild(placeholder)
        }
      }
      this.customElement.build()
      this._built = true

      // emit build event
      customEmit(this, 'build')
    } catch (e) {
      customEmit(this, 'build-error', e)
      console.warn('build error:', e)
    }
  }

  isBuilt () {
    return this._built
  }

  _getSpace () {
    if (this.spaceElement === undefined &&
      this._layout === LAYOUT.RESPONSIVE) {
      // Expect space to exist, just not yet discovered.
      this.spaceElement = this.querySelector('mip-i-space')
    }
    return this.spaceElement || null
  }

  /**
   * If the element has a media attribute, evaluates the value as a media
   * query and based on the result adds or removes the class
   * `mip-hidden-by-media-query`. The class adds display:none to the
   * element which in turn prevents any of the resource loading to happen for
   * the element.
   */
  applySizesAndMediaQuery () {
    let {defaultView} = this.ownerDocument

    // Media query.
    if (this._mediaQuery === undefined) {
      this._mediaQuery = this.getAttribute('media') || null
    }
    if (this._mediaQuery) {
      this.classList.toggle('mip-hidden-by-media-query',
        !defaultView.matchMedia(this._mediaQuery).matches)
    }

    // Sizes.
    if (this._sizeList === undefined) {
      let sizesAttr = this.getAttribute('sizes')
      this._sizeList = sizesAttr ? parseSizeList(sizesAttr) : null
    }
    if (this._sizeList) {
      css(this, 'width', this._sizeList.select(defaultView))
    }
    // Heights.
    if (this._heightsList === undefined &&
        this._layout === LAYOUT.RESPONSIVE) {
      let heightsAttr = this.getAttribute('heights')
      this._heightsList = heightsAttr
        ? parseSizeList(heightsAttr, /* allowPercent */ true) : null
    }
    if (this._heightsList) {
      let space = this._getSpace()
      if (space) {
        css(space, 'paddingTop',
          this._heightsList.select(defaultView))
      }
    }
  }

  /**
   * Returns the original nodes of the custom element without any service
   * nodes that could have been added for markup. These nodes can include
   * Text, Comment and other child nodes.
   * @return {!Array<!Node>}
   */
  getRealChildNodes () {
    return [...this.childNodes].filter(node => !isInternalNode(node))
  }

  inViewport () {
    return this._inViewport
  }

  viewportCallback (inViewport) {
    this.customElement.viewportCallback(inViewport)
    this._inViewport = inViewport
    // It not support `finaly` in huawei honner h
    let onFinally = () => {
      this.togglePlaceholder(false)
      this.toggleLoading(false, {
        cleanup: true
      })
    }
    if (inViewport && !this._firstInViewport) {
      this.layoutCallback().then(
        () => this.customElement.firstLayoutCompleted(),
        () => this.toggleFallback(true)
      ).then(onFinally, onFinally)

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
   * @deprecated
   */
  resourcesComplete () {
    // istanbul ignore next
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
 * @return {Array<HTMLElement>|undefined}
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
