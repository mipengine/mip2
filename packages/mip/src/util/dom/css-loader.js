/**
 * @file css loader
 * @author sekiyika(pengxing@baidu.com)
 */

/**
 * Creates the properly configured style element.
 *
 * @param {Document} doc doc
 * @param {Element|ShadowRoot} cssRoot css root
 * @param {string} cssText css text
 * @param {string} name name
 * @param {boolean} isRuntimeCss is runtime css
 * @return {Element}
*/
function insertStyleElement (doc, cssRoot, cssText, name, isRuntimeCss) {
  let style = doc.createElement('style')
  let afterElement = null

  style.textContent = cssText

  if (isRuntimeCss) {
    style.setAttribute('mip-main', '')
  } else {
    style.setAttribute('mip-extension', name || '')
    afterElement = cssRoot.querySelector('style[mip-main]')
  }

  insertAfterOrAtStart(cssRoot, style, afterElement)
  return style
}

function insertAfterOrAtStart (styleRoot, styleElement, afterElement) {
  afterElement
    ? afterElement.nextSibling
      ? styleRoot.insertBefore(styleElement, afterElement.nextSibling)
      : styleRoot.appendChild(styleElement)
    : styleRoot.insertBefore(styleElement, styleRoot.firstChild)
}

export default {
  insertStyleElement
}
