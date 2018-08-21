/**
 * @file       mip-font-size
 * @author     chenyongle(chenyongle@baidu.com)
 * @description 设置页面文档根元素的 font-size
 */
import viewport from '../viewport'
import CustomElement from '../custom-element'

class MipFont extends CustomElement {
  connectedCallback () {
    if (viewport.getWidth() <= 360) {
      // 通过 js 设置 !important
      document.documentElement.setAttribute('style', 'font-size: 90px !important')
    } else {
      document.documentElement.style.fontSize = '100px'
    }
  }
}

export default MipFont
