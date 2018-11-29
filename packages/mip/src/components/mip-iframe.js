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

const {platform, css, event} = util

let attrList = ['allowfullscreen', 'allowtransparency', 'sandbox']

class MipIframe extends CustomElement {
  constructor (...args) {
    super(...args)

    this.iframe = undefined
  }
  isLoadingEnabled () {
    return true
  }

  build () {
    this.iframe = document.createElement('iframe')
    this.iframe.frameBorder = '0'
    this.iframe.scrolling = platform.isIos() ? /* istanbul ignore next */ 'no' : 'yes'

    this.applyFillContent(this.iframe)
    this.element.appendChild(this.iframe)
  }

  layoutCallback () {
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
      return Promise.resolve()
    }

    // window.addEventListener('message', )
    window.addEventListener('message', this.notifyRootPage.bind(this))

    css(this.iframe, {
      width,
      height
    })

    this.iframe.src = src

    // if (srcdoc) {
    //   this.iframe.srcdoc = srcdoc
    // }

    this.expendAttr(attrList, this.iframe)
    element.appendChild(this.iframe)

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

    return event.loadPromise(this.iframe)
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
      css(this.iframe, {
        height
      })
      this.height = height
    }
  }
}

export default MipIframe
