/**
 * @file mip-fixed
 * @author panyuqi(panyuqi@baidu.com)
 * @desc 解决 MIP1 <mip-fixed> 遗留的问题
 */
import CustomElement from '../custom-element'

class MipFixed extends CustomElement {
  connectedCallback () {
    let viewer = window.MIP.viewer
    let platform = window.MIP.util.platform

    if (this.element.getAttribute('mipdata-fixedidx')) {
      return
    }

    // only in iOS + iframe need moving element to fixedlayer
    let shouldMoveToFixedLayer = platform.isIos() && viewer.isIframed
    viewer.fixedElement.setFixedElement([this.element], shouldMoveToFixedLayer)
  }
}

export default MipFixed
