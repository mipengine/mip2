/**
 * @file mip-fixed
 * @author panyuqi(panyuqi@baidu.com)
 * @desc 解决 MIP1 <mip-fixed> 遗留的问题
 */
import CustomElement from '../custom-element'

class MipFixed extends CustomElement {
  connectedCallback () {
    const viewer = window.MIP.viewer
    const platform = window.MIP.util.platform

    if (this.element.getAttribute('mipdata-fixedidx')) {
      return
    }

    // should not move
    const still = this.element.hasAttribute('still')

    // only in iOS + iframe need moving element to fixedlayer
    const shouldMoveToFixedLayer = !still && platform.isIos() && viewer.isIframed
    viewer.fixedElement.setFixedElement([this.element], shouldMoveToFixedLayer)
  }
}

export default MipFixed
