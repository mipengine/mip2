/**
 * @file       mip-font-size
 * @author     chenyongle(chenyongle@baidu.com)
 * @description 设置页面文档根元素的 font-size
 */
import viewport from '../viewport'
import CustomElement from '../custom-element'

class MipRem extends CustomElement {
  connectedCallback () {
    // 获取fontSize
    let fontSize = this.element.getAttribute('font-size')
    if (viewport.getWidth() <= 360) {
      // 通过 js 设置 !important
      fontSize = fontSize || 90
      document.documentElement.setAttribute('style', 'font-size: ' + fontSize + 'px !important')
    } else {
      fontSize = fontSize || 100
      document.documentElement.setAttribute('style', 'font-size: ' + fontSize + 'px')
    }
  }
}

export default MipRem
