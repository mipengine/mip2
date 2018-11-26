/**
 * @file mip-layout.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import CustomElement from '../custom-element'

/**
 *
 */
export default class MipLayout extends CustomElement {
  /** @override */
  build () {
    let container = this.element.ownerDocument.createElement('div')
    this.applyFillContent(container)
    this.element.getRealChildNodes()
      .forEach(child => container.appendChild(child))
    this.element.appendChild(container)
  }

  /** @override */
  prerenderAllowed () {
    return true
  }
}
