/**
 * @file mip-iframe
 * @author zhangzhiqiang(zhiqiangzhang37@163.com)
 */

import util from '../util/index'
import CustomElement from '../custom-element'
import viewport from '../viewport'
import {CUSTOM_EVENT_RESIZE_PAGE} from '../page/const'

let attrList = ['allowfullscreen', 'allowtransparency', 'sandbox']

class MipIframe extends CustomElement {
  build () {
    this.setIframeHeight = this.setIframeHeight.bind(this)
    let element = this.element
    let src = element.getAttribute('src')
    let srcdoc = element.getAttribute('srcdoc')
    if (srcdoc) {
      src = 'data:text/html;charset=utf-8;base64,' + window.btoa(srcdoc)
    }

    let height = element.getAttribute('height')
    let width = element.getAttribute('width') || '100%'

    if (!src || !height) {
      return
    }

    let iframe = document.createElement('iframe')
    iframe.frameBorder = '0'
    iframe.scrolling = 'no'
    util.css(iframe, {
      width,
      height
    })

    this.applyFillContent(iframe)
    iframe.src = src

    this.expendAttr(attrList, iframe)
    element.appendChild(iframe)

    this.iframe = iframe

    /**
     * 修复一个 iOS UC 下的 bug
     * 设置 100% 还不够，必须是精确值，否则弹起再收起软键盘后，iframe 高度不会恢复
     */
    if (height === '100%') {
      this.fullscreen = true
      // 定时器是此时 iframe 可能处于隐藏状态，viewport.getHeight() 获取不到高度
      let timer = setInterval(() => {
        let viewportHeight = viewport.getHeight()
        if (viewportHeight !== 0) {
          this.setIframeHeight(viewportHeight)
          clearInterval(timer)
        }
      }, 500)
    }
  }

  firstInviewCallback () {
    window.addEventListener(CUSTOM_EVENT_RESIZE_PAGE, this.setIframeHeight)
  }

  disconnectedCallback () {
    window.removeEventListener(CUSTOM_EVENT_RESIZE_PAGE, this.setIframeHeight)
  }

  setIframeHeight (height) {
    if (!this.fullscreen) {
      return
    }
    if (height.detail && height.detail.length) {
      height = height.detail[0].height || viewport.getHeight()
    }
    if (height !== this.height) {
      util.css(this.iframe, {
        height
      })
      this.height = height
    }
  }
}

export default MipIframe
