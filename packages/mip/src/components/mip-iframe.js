/**
 * @file mip-iframe
 * @author zhangzhiqiang(zhiqiangzhang37@163.com)
 */

import util from '../util/index'
import CustomElement from '../custom-element'
import viewport from '../viewport'
import {
  CUSTOM_EVENT_RESIZE_PAGE,
  MESSAGE_MIPIFRAME_RESIZE,
  MESSAGE_PAGE_RESIZE
} from '../page/const'

let attrList = ['allowfullscreen', 'allowtransparency', 'sandbox']

class MipIframe extends CustomElement {
  build () {
    this.handlePageResize = this.handlePageResize.bind(this)
    this.notifyRootPage = this.notifyRootPage.bind(this)
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

    // window.addEventListener('message', )
    window.addEventListener('message', this.notifyRootPage.bind(this))

    let iframe = document.createElement('iframe')
    iframe.frameBorder = '0'
    iframe.scrolling = util.platform.isIos() ? /* istanbul ignore next */ 'no' : 'yes'
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
        /* istanbul ignore if */
        if (viewportHeight === 0) {
          return
        }
        this.setIframeHeight(viewportHeight)
        clearInterval(timer)
      }, 500)
    }
  }

  firstInviewCallback () {
    window.addEventListener(CUSTOM_EVENT_RESIZE_PAGE, this.handlePageResize.bind(this))
  }

  disconnectedCallback () {
    window.removeEventListener(CUSTOM_EVENT_RESIZE_PAGE, this.handlePageResize.bind(this))
    window.removeEventListener('message', this.notifyRootPage.bind(this))
  }

  notifyRootPage ({data}) {
    if (data.type === MESSAGE_MIPIFRAME_RESIZE) {
      window.MIP.viewer.page.notifyRootPage({
        type: MESSAGE_PAGE_RESIZE
      })
    }
  }

  handlePageResize (e) {
    if (e.detail && e.detail.length) {
      this.setIframeHeight(e.detail[0].height || viewport.getHeight())
    }
  }

  setIframeHeight (height) {
    /* istanbul ignore if */
    if (!this.fullscreen) {
      return
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
