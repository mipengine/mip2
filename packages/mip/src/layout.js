/**
 * @file layout.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

const SPACE_TAG_NAME = 'mip-i-space'

/**
 * Layout types.
 * @inner
 * @const
 * @type {Object}
 */
const LAYOUT = {
  NODISPLAY: 'nodisplay',
  FIXED: 'fixed',
  FIXED_HEIGHT: 'fixed-height',
  RESPONSIVE: 'responsive',
  CONTAINER: 'container',
  FILL: 'fill',
  FLEX_ITEM: 'flex-item'
}

/**
 * Natural dimensions.
 * @inner
 * @const
 * @type {Object}
 */
const NATURAL_DIMENSIONS = {
  'mip-pix': {
    width: '1px',
    height: '1px'
  },
  'mip-stats': {
    width: '1px',
    height: '1px'
  },
  'mip-audio': null
}

/**
 * Loading elements.
 * @inner
 * @const
 * @type {Object}
 */
const LOADING_ELEMENTS = {
  'mip-anim': true,
  'mip-brightcove': true,
  'mip-embed': true,
  'mip-iframe': true,
  'mip-img': true,
  'mip-list': true,
  'mip-video': true
}

/**
 * Layout for MIPElement.
 */
class Layout {
  /**
   * get layout name
   *
   * @param {string} s layout type string
   * @return {Layout|undefined} Returns undefined in case of failure to parse
   *   the layout string.
   */
  parseLayout (s) {
    for (let i in LAYOUT) {
      if (LAYOUT[i] === s) {
        return s
      }
    }
    return undefined
  }

  /**
   * get layout class by layout name
   *
   * @param {Layout} layout layout name
   * @return {string}
   */
  getLayoutClass (layout) {
    return 'mip-layout-' + layout
  }

  /**
   * Whether an element with this layout inherently defines the size.
   *
   * @param {Layout} layout layout name
   * @return {boolean}
   */
  isLayoutSizeDefined (layout) {
    return (
      layout === LAYOUT.FIXED ||
      layout === LAYOUT.FIXED_HEIGHT ||
      layout === LAYOUT.RESPONSIVE ||
      layout === LAYOUT.FILL ||
      layout === LAYOUT.FLEX_ITEM
    )
  }

  /**
   * Parses the CSS length value. If no units specified, the assumed value is
   * "px". Returns undefined in case of parsing error.
   *
   * @param {string|undefined} s length string
   * @return {!LengthDef|undefined}
   */
  parseLength (s) {
    if (typeof s === 'number') {
      return s + 'px'
    }
    if (!s) {
      return undefined
    }
    if (!/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)?$/.test(s)) {
      return undefined
    }
    if (/^\d+(\.\d+)?$/.test(s)) {
      return s + 'px'
    }
    return s
  }

  /**
   * Returns the numeric value of a CSS length value.
   *
   * @param {string} length length string
   * @return {number}
   */
  getLengthNumeral (length) {
    return parseFloat(length)
  }

  /**
   * Determines whether the tagName is a known element that has natural dimensions
   * in our runtime or the browser.
   *
   * @param {string} tagName The element tag name.
   * @return {DimensionsDef}
   */
  hasNaturalDimensions (tagName) {
    tagName = tagName.toLowerCase()
    return NATURAL_DIMENSIONS[tagName] !== undefined
  }

  /**
   * Determines the default dimensions for an element which could lety across
   * different browser implementations, like <audio> for instance.
   * This operation can only be completed for an element whitelisted by
   * `hasNaturalDimensions`.
   *
   * @param {!Element} element html element
   * @return {DimensionsDef}
   */
  getNaturalDimensions (element) {
    let tagName = element.tagName.toLowerCase()
    if (!NATURAL_DIMENSIONS[tagName]) {
      let doc = element.ownerDocument
      let naturalTagName = tagName.replace(/^mip-/, '')
      let temp = doc.createElement(naturalTagName)
      // For audio, should no-op elsewhere.
      temp.controls = true
      temp.style.position = 'absolute'
      temp.style.visibility = 'hidden'
      doc.body.appendChild(temp)
      NATURAL_DIMENSIONS[tagName] = {
        width: (temp.offsetWidth || 1) + 'px',
        height: (temp.offsetHeight || 1) + 'px'
      }
      doc.body.removeChild(temp)
    }
    return NATURAL_DIMENSIONS[tagName]
  }

  /**
   * Whether the loading can be shown for the specified elemeent. This set has
   * to be externalized since the element's implementation may not be
   * downloaded yet.
   *
   * @param {string} tagName The element tag name.
   * @return {boolean}
   */
  isLoadingAllowed (tagName) {
    return LOADING_ELEMENTS[tagName.toLowerCase()] || false
  }

  /**
   * Apply layout for a MIPElement.
   *
   * @param {MIPElement} element html element
   * @return {string}
   */
  applyLayout (element) {
    if (element._layoutInited) {
      return
    }

    element._layoutInited = true
    let layoutAttr = element.getAttribute('layout')
    let widthAttr = element.getAttribute('width')
    let heightAttr = element.getAttribute('height')
    let sizesAttr = element.getAttribute('sizes')
    let heightsAttr = element.getAttribute('heights')

    // Input layout attributes.
    let inputLayout = layoutAttr ? this.parseLayout(layoutAttr) : null
    let inputWidth =
      widthAttr && widthAttr !== 'auto'
        ? this.parseLength(widthAttr)
        : widthAttr
    let inputHeight = heightAttr ? this.parseLength(heightAttr) : null

    // Effective layout attributes. These are effectively constants.
    let width
    let height
    let layout

    // Calculate effective width and height.
    if (
      (!inputLayout ||
        inputLayout === LAYOUT.FIXED ||
        inputLayout === LAYOUT.FIXED_HEIGHT) &&
      (!inputWidth || !inputHeight) &&
      this.hasNaturalDimensions(element.tagName)
    ) {
      // Default width and height: handle elements that do not specify a
      // width/height and are defined to have natural browser dimensions.
      let dimensions = this.getNaturalDimensions(element)
      width =
        inputWidth || inputLayout === LAYOUT.FIXED_HEIGHT
          ? inputWidth
          : dimensions.width
      height = inputHeight || dimensions.height
    } else {
      width = inputWidth
      height = inputHeight
    }

    // Calculate effective layout.
    if (inputLayout) {
      layout = inputLayout
    } else if (!width && !height) {
      layout = LAYOUT.CONTAINER
    } else if (height && (!width || width === 'auto')) {
      layout = LAYOUT.FIXED_HEIGHT
    } else if (height && width && (sizesAttr || heightsAttr)) {
      layout = LAYOUT.RESPONSIVE
    } else {
      layout = LAYOUT.FIXED
    }

    // Apply UI.
    element.classList.add(this.getLayoutClass(layout))
    if (this.isLayoutSizeDefined(layout)) {
      element.classList.add('mip-layout-size-defined')
    }

    switch (layout) {
      case LAYOUT.NODISPLAY:
        element.style.display = 'none'
        break
      case LAYOUT.FIXED:
        element.style.width = width
        element.style.height = height
        break
      case LAYOUT.FIXED_HEIGHT:
        element.style.height = height
        break
      case LAYOUT.RESPONSIVE:
        let firstChild = element.firstChild
        if (firstChild &&
          firstChild.tagName &&
          firstChild.tagName.toLowerCase() === SPACE_TAG_NAME) {
          return
        }
        let space = element.ownerDocument.createElement(SPACE_TAG_NAME)
        space.style.display = 'block'
        space.style.paddingTop =
          this.getLengthNumeral(height) / this.getLengthNumeral(width) * 100 + '%'
        element.insertBefore(space, element.firstChild)
        element._spaceElement = space
        break
      case LAYOUT.FILL:
        break
      case LAYOUT.CONTAINER:
        break
      case LAYOUT.FLEX_ITEM:
        width && (element.style.width = width)
        height && (element.style.height = height)
        break
    }

    if (element.classList.contains('mip-hidden')) {
      element.classList.remove('mip-hidden')
    }
    return layout
  }
}

export default new Layout()
