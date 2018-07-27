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

    // only in iOS + iframe
    if (platform.isIos() && viewer.isIframed) {
      // move element to fixedlayer
      viewer.fixedElement.setFixedElement([this.element], true)
    }
  }
}

export default MipFixed
