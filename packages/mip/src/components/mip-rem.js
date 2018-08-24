/**
 * @file       mip-font-size
 * @author     chenyongle(chenyongle@baidu.com)
 * @description 设置页面文档根元素的 font-size
 */
import viewport from '../viewport'
import CustomElement from '../custom-element'

function init () {
  // 设置默认值
  if (viewport.getWidth() <= 360) {
    document.documentElement.setAttribute('style', 'font-size: 90px')
  } else {
    document.documentElement.setAttribute('style', 'font-size: 100px')
  }
}
class MipRem extends CustomElement {
  connectedCallback () {
    // 获取fontSize 格式类似于 [{"maxWidth": 360, "size": 80}, {"minWidth": 361, "maxWidth": 720, "size": 90}, {"minWidth": 721, "size": 100}]
    let fontSize = this.element.getAttribute('font-size')
    let width = viewport.getWidth()
    if (fontSize) {
      fontSize = '{"array":' + fontSize + '}'
      try {
        fontSize = JSON.parse(fontSize)
        fontSize = fontSize.array
      } catch (e) {
        init()
        console.warn('mip-rem 的 font-size 属性值格式不对！')
        return
      }
      // 类似于 media query 的效果
      for (let i = 0; i < fontSize.length; i++) {
        if (fontSize[i]['maxWidth'] && fontSize[i]['maxWidth'] < width) {
          continue
        }
        if (fontSize[i]['minWidth'] && fontSize[i]['minWidth'] > width) {
          continue
        }
        let size = fontSize[i].size || 100
        document.documentElement.setAttribute('style', 'font-size: ' + size + 'px')
      }
    } else {
      init()
    }
  }
}

export default MipRem
