/**
 * @file mip-iframe
 * @author zhangzhiqiang(zhiqiangzhang37@163.com)
 *         clark-t (clarktanglei@163.com)
 */

import util from '../util/index'
import fn from '../util/fn'
import CustomElement from '../custom-element'
import viewport from '../viewport'
import {
  CUSTOM_EVENT_RESIZE_PAGE,
  MESSAGE_MIPIFRAME_RESIZE,
  MESSAGE_PAGE_RESIZE
} from '../page/const'

const ATTR_LIST = [
  'allowfullscreen',
  'allowtransparency',
  'sandbox',
  'referrerpolicy'
]

function encode (str) {
  let arr
  if (typeof TextEncoder !== 'undefined') {
    arr = new TextEncoder('utf-8').encode(str)
  } else {
    arr = new Uint8Array(str.length)
    str = unescape(encodeURIComponent(str))
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i)
    }
  }
  // 不能直接 arr.map().join()
  let output = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    output[i] = String.fromCharCode(arr[i])
  }
  return output.join('')
}

class MipIframe extends CustomElement {
  constructor (...args) {
    super(...args)

    this._src = null
    this.updateIframeSrc = fn.throttle(this.setIframeSrc.bind(this))
  }

  static get observedAttributes () {
    return ['src', 'srcdoc']
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (this.isBuilt) {
      this[name] = newValue
      this.updateIframeSrc()
    }
  }

  set src (value) {
    // 当 srcdoc 存在时，优先展示 srcdoc 的内容
    if (this.element.getAttribute('srcdoc')) {
      return
    }
    // url 必须是 https
    if (value == null || value.slice(0, 8) === 'https://') {
      this._src = value
    } else {
      this.srcdoc = `Invalid &lt;mip-iframe&gt; src. Must start with https://`
    }
  }

  set srcdoc (value) {
    // 当删除 srcdoc 属性时，显示 src 的内容
    if (value == null) {
      this.src = this.element.getAttribute('src')
    } else if (this._srcdoc !== value) {
      this._srcdoc = value
      // 兼容 mip1
      if (this.element.getAttribute('encode')) {
        value = encode(value)
      }
      this._src = 'data:text/html;charset=utf-8;base64,' + window.btoa(value)
    }
  }

  setIframeSrc () {
    if (!this._src) {
      return
    }

    if (this.iframe) {
      if (this.iframe.src !== this._src) {
        this.iframe.src = this._src
      }
      return
    }

    let height = this.element.getAttribute('height')
    let width = this.element.getAttribute('width') || '100%'

    let iframe = document.createElement('iframe')
    iframe.frameBorder = '0'
    iframe.scrolling = util.platform.isIos() ? /* istanbul ignore next */ 'no' : 'yes'

    util.css(iframe, {
      width,
      height
    })

    this.applyFillContent(iframe)
    this.expendAttr(ATTR_LIST, iframe)
    iframe.src = this._src
    this.element.appendChild(iframe)
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

  build () {
    this.bindedHandlePageResize = this.handlePageResize.bind(this)
    this.bindedNotifyRootPage = this.notifyRootPage.bind(this)

    window.addEventListener('message', this.bindedNotifyRootPage)

    this.srcdoc = this.element.getAttribute('srcdoc')
    this.setIframeSrc()
    this.isBuilt = true
  }

  firstInviewCallback () {
    window.addEventListener(CUSTOM_EVENT_RESIZE_PAGE, this.bindedHandlePageResize)
  }

  disconnectedCallback () {
    window.removeEventListener(CUSTOM_EVENT_RESIZE_PAGE, this.bindedHandlePageResize)
    window.removeEventListener('message', this.bindedNotifyRootPage)
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
