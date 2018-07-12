/**
 * @file mip-iframe
 * @author zhangzhiqiang(zhiqiangzhang37@163.com)
 */

import util from '../util/index'
import CustomElement from '../custom-element'
import viewport from '../viewport'

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

    let timer = setInterval(() => {
      let viewportHeight = viewport.getHeight()
      if (viewportHeight !== 0) {
        this.setIframeHeight(viewportHeight)
        clearInterval(timer)
      }
    }, 500)
  }

  firstInviewCallback () {
    window.addEventListener('resize-mip-iframe', this.setIframeHeight)
  }

  disconnectedCallback () {
    window.removeEventListener('resize-mip-iframe', this.setIframeHeight)
  }

  setIframeHeight (height) {
    util.css(this.iframe, {
      height
    })
  }
}

export default MipIframe
