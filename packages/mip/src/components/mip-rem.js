/**
 * @file       mip-font-size
 * @author     chenyongle(chenyongle@baidu.com)
 * @description 设置页面文档根元素的 font-size
 */
import viewport from '../viewport'
import CustomElement from '../custom-element'

class MipRem extends CustomElement {
  connectedCallback () {
    this.changeHtmlFontSize()
    window.addEventListener('resize', this.changeHtmlFontSize.bind(this), false)
  }
  disconnectedCallback () {
    document.documentElement.setAttribute('style', 'font-size: ')
  }
  changeHtmlFontSize () {
    // 获取fontSize 格式类似于 [{"maxWidth": 360, "size": 80}, {"minWidth": 361, "maxWidth": 720, "size": 90}, {"minWidth": 721, "size": 100}]
    let init = ''
    let fontSize = this.element.getAttribute('font-size') || init
    let width = viewport.getWidth()
    try {
      fontSize = JSON.parse(fontSize)
    } catch (e) {
      fontSize = init
      console.warn('mip-rem 的 font-size 属性值格式不对！')
    }
    // 类似于 media query 的效果
    let size = init
    for (let i = fontSize.length - 1; i >= 0; i--) {
      if (fontSize[i]['maxWidth'] && fontSize[i]['maxWidth'] < width) {
        continue
      }
      if (fontSize[i]['minWidth'] && fontSize[i]['minWidth'] > width) {
        continue
      }
      size = fontSize[i].size || init
      break
    }
    document.documentElement.style.fontSize = size + 'px'
  }
}

export default MipRem
