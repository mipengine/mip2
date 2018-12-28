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

    // Hack: mip1 站点强制重写 mip-layout-container display，导致无法隐藏 loading
    // 针对 mip-fixed 先把 mip-layout-container 去掉，这个不会对现有样式造成影响
    // TODO: 1. 考虑针对 mip-fixed 统一不使用 layout 处理 2. 推动下游去掉这个 class 的重写
    // 站点 http://mip.cntrades.com/15995352952/sell/itemid-170607633.html
    this.element.classList.remove('mip-layout-container')

    if (this.element.getAttribute('mipdata-fixedidx')) {
      return
    }

    // should not move
    const still = this.element.hasAttribute('still')

    if (!still) {
      // only in iOS + iframe need moving element to fixedlayer
      const shouldMoveToFixedLayer = platform.isIos() && viewer.isIframed
      viewer.fixedElement.setFixedElement([this.element], shouldMoveToFixedLayer)
    }
  }
}

export default MipFixed
