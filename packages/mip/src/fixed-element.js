/**
 *
 * @file fixed element
 * @author xx
 */

import platform from './util/platform'
import css from './util/dom/css'
import layout from './layout'
import util from './util/index'

/**
 * The fixed element processor.
 * https://bugs.webkit.org/show_bug.cgi?id=154399
 *
 * @class
 */
class FixedElement {
  constructor () {
    /**
     * @private
     * @type {HTMLElement}
     */
    this._fixedLayer = null

    /**
     * @private
     * @type {number}
     */
    this._count = 0

    /**
     * Whether the platform is android and uc browser.
     * @private
     * @type {boolean}
     */
    this._isAndroidUc = platform.isUc() && /* istanbul ignore next */!platform.isIos()

    /**
     * @private
     * @type {Array.<FixedElement>}
     */
    this._fixedElements = []
  }

  /**
   * Initializition of current fixed element processor.
   */
  init () {
    let mipFixedElements = document.body.querySelectorAll('mip-fixed, mip-semi-fixed')

    this.setFixedElement(mipFixedElements)
    let fixedLen = this._fixedElements.length
    let isIframed = window.MIP.viewer.isIframed
    if ((platform.isIos()) && isIframed) {
      // let fixedLayer =
      this.getFixedLayer()
      for (let i = 0; i < fixedLen; i++) {
        let fixedElem = this._fixedElements[i]

        // clone mip-semi-fixed node
        if (fixedElem.element.tagName.toLowerCase() === 'mip-semi-fixed') {
          let ele = fixedElem.element
          let parentNode = ele.parentNode
          let nextSbiling = ele.nextElementSibling
          let node = ele.cloneNode(true)

          if (nextSbiling) {
            parentNode.insertBefore(node, nextSbiling)
          } else {
            parentNode.appendChild(node)
          }
        }
        this.moveToFixedLayer(fixedElem, i)
      }
    }
    /* istanbul ignore if */
    if (isIframed) {
      this.doCustomElements()
    }
  }

  /**
   * Process some fixed elements.
   *
   * @param {Array.<MIPElement>} fixedElements fixed elements
   * @param {boolean}  move flag for if moving to fixedlayer
   * @return {any}
   */
  setFixedElement (fixedElements, move) {
    let fixedEle = {}
    // let fixedTypeCount = {};

    for (let i = 0; i < fixedElements.length; i++) {
      let ele = fixedElements[i]
      let fType = ele.getAttribute('type')

      // check invalid element and delete from document
      let bottom = layout.parseLength(ele.getAttribute('bottom'))
      let top = layout.parseLength(ele.getAttribute('top'))
      /* eslint-disable */
      if (fType === 'left' && !top && !bottom ||
            fType === 'gototop' && ele.firstElementChild.tagName.toLowerCase() !== 'mip-gototop' ||
            ele.tagName.toLowerCase() !== 'mip-semi-fixed' && ele.tagName.toLowerCase() !== 'mip-fixed') {
        ele.parentElement && ele.parentElement.removeChild(ele)
        continue
      }
      /* eslint-enable */

      // mip-semi-fixed
      if (ele.tagName.toLowerCase() === 'mip-semi-fixed') {
        if (!ele.id) {
          ele.id = 'mip-semi-fixed' + this._count
        }
        fType = 'semi-fixed'
      }

      // Calculate z-index based on the declared z-index and DOM position.
      css(ele, {
        'z-index': 10000 - this._count
      })

      // While platform is android-uc, change the position to 'absolute'.
      if (this._isAndroidUc) {
        css(ele, {
          position: 'absolute'
        })
      }

      this.setFixedElementRule(ele, fType)
      let eleId = 'Fixed' + (this._count)
      fixedEle = {
        id: eleId,
        element: ele
      }
      fixedEle.element.setAttribute('mipdata-fixedIdx', eleId)

      this._count++
      this._fixedElements.push(fixedEle)

      // when `setFixedElement function` called by components,
      // the element will moved to fixedlayer directly.
      if (move) {
        this.moveToFixedLayer(fixedEle, this._count)
        return 10000 - this._count
      }
    }
  }

  /**
   * Create the fixed layer of current object if it does not exsit and return it.
   *
   * @return {Element}
   */
  getFixedLayer () {
    if (this._fixedLayer) {
      return this._fixedLayer
    }
    this._fixedLayer = document.createElement('body')
    this._fixedLayer.className = 'mip-fixedlayer'
    let height = (this._isAndroidUc) ? '100%' : 0
    let width = (this._isAndroidUc) ? '100%' : 0
    css(this._fixedLayer, {
      'position': 'absolute',
      'top': 0,
      'left': 0,
      'height': height,
      'width': width,
      'pointer-events': 'none',
      'overflow': 'hidden',
      'animation': 'none',
      '-webkit-animation': 'none',
      'border': 'none',
      'box-sizing': 'border-box',
      'box-shadow': 'none',
      'display': 'block',
      'float': 'none',
      'margin': 0,
      'opacity': 1,
      'outline': 'none',
      'transform': 'none',
      'transition': 'none',
      'visibility': 'visible',
      'background': 'none'
    })
    let html = document.getElementsByTagName('html')[0]
    html.appendChild(this._fixedLayer)
    return this._fixedLayer
  }

  /**
   * Move a fixed element to the fixed layer.
   *
   * @param {MIPElement} fixedEle fixedEle
   * @param {string} idx idx
   */
  moveToFixedLayer (fixedEle, idx) {
    let element = fixedEle.element
    if (element.parentElement === this._fixedLayer) {
      return
    }
    /* istanbul ignore else */
    if (!fixedEle.placeholder) {
      css(element, {
        'pointer-events': 'initial'
      })
      fixedEle.placeholder = document.createElement('mip-i-ph')
      fixedEle.placeholder.setAttribute('mipdata-fixedIdx', fixedEle.id)
      fixedEle.placeholder.style.display = 'none'
    }

    element.parentElement.replaceChild(fixedEle.placeholder, element)
    this.getFixedLayer().appendChild(element)
  }

  /**
   * Process custom elements created by user.
   */
  doCustomElements () {
    let stylesheets = document.styleSheets
    /* istanbul ignore if */
    if (!stylesheets) {
      return
    }
    // Find the 'position: fixed' elements.
    // let fixedSelectors = [];
    for (let i = 0; i < stylesheets.length; i++) {
      let stylesheet = stylesheets[i]
      /* istanbul ignore if */
      if (stylesheet.disabled || !stylesheet.ownerNode ||
                stylesheet.ownerNode.tagName !== 'STYLE' ||
                stylesheet.ownerNode.hasAttribute('mip-extension')) {
        continue
      }
      this._findFixedSelectors(stylesheet.cssRules)
    }
  }

  /**
   * Find the selectors of 'position: fixed' elements.
   * CSSRule: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule#Type_constants
   *
   * @param {string} cssRules cssRules
   */
  _findFixedSelectors (cssRules) {
    for (let i = 0; i < cssRules.length; i++) {
      let cssRule = cssRules[i]
      let rType = cssRule.type
      if (rType === 1) {
        // CSSStyleRule
        if (cssRule.selectorText !== '*' && cssRule.style.position === 'fixed') {
          try {
            let fixedSelector = cssRule.selectorText
            let elements = document.querySelectorAll(fixedSelector)
            for (let j = 0; j < elements.length; j++) {
              /**
               * in `development` mode, CSS isn't extracted
               * and will be inserted in runtime, which will be removed by this func.
               */
              /* istanbul ignore next */
              if (process.env.NODE_ENV === 'production') {
                elements[j].parentElement.removeChild(elements[j])
              }
            }
          } catch (e) {
            /* istanbul ignore next */
            console.warn('Cannot find the selector of custom fixed elements')
          }
        }
      } else if (rType === 4) {
        // CSSMediaRule
        this._findFixedSelectors(cssRule.cssRules)
      }/* istanbul ignore next */ else if (rType === 12) {
        // CSSSupportsRule
        this._findFixedSelectors(cssRule.cssRules)
      }
    }
  }

  /**
   * Set styles of a fixed element with type.
   *
   * @param {MIPElement} fixedEle fixedEle
   * @param {string} type Layout type of the fixedEle.
   */
  setFixedElementRule (fixedEle, type) {
    switch (type) {
      case 'top':
        break
      case 'bottom':
        break
      case 'right':
        this.setStyle(fixedEle)
        break
      case 'left':
        this.setStyle(fixedEle)
        break
      case 'semi-fixed':
        break
      case 'gototop':
        fixedEle.style.bottom = '90px'
        fixedEle.style.right = '10%'
        break
      default:
        fixedEle.style.display = 'none'
    }
  }

  /**
   * Set styles of a fixed element.
   *
   * @param {MIPElement} fixedEle fixedEle
   */
  setStyle (fixedEle) {
    let bottom = layout.parseLength(fixedEle.getAttribute('bottom'))
    if (bottom) {
      fixedEle.style.bottom = bottom
      return
    }
    let top = layout.parseLength(fixedEle.getAttribute('top'))
    if (top) {
      fixedEle.style.top = top
    }
  }

  /**
   * Show fixed layer
   *
   * @param {HTMLElement} layer layer
   */
  showFixedLayer (layer) {
    /* istanbul ignore else */
    if (layer) {
      css(layer, {
        display: 'block'
      })
    }
  }

  /**
   * Hide fixed layer
   *
   * @param {HTMLElement} layer layer
   */
  hideFixedLayer (layer) {
    /* istanbul ignore else */
    if (layer) {
      css(layer, {
        display: 'none'
      })
    }
  }

  /**
   * set a placeholder
   *
   * @param {Object} height the height of element
   */
  setPlaceholder (height) {
    let placeholder = document.body.querySelector('div[mip-fixed-placeholder]')

    if (!placeholder) {
      placeholder = document.createElement('div')
      placeholder.setAttribute('mip-fixed-placeholder', '')
      util.css(placeholder, {
        position: 'relative',
        display: 'none'
      })
      document.body.appendChild(placeholder)
    }

    if (height) {
      util.css(placeholder, {
        display: 'block',
        height: height + 'px'
      })
    }
  }
}

export default new FixedElement()
