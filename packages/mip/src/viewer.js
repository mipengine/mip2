/**
 * @file Hash Function. Support hash get function
 * @author zhangzhiqiang(zhiqiangzhang37@163.com)
 */

/* global top screen location */

import event from './util/dom/event'
import css from './util/dom/css'
import Gesture from './util/gesture'
import platform from './util/platform'
import viewport from './viewport'
import EventAction from './util/event-action'
import EventEmitter from './util/event-emitter'
import fn from './util/fn'
import Page from './page'
import {MESSAGE_ROUTER_PUSH, MESSAGE_ROUTER_REPLACE} from './page/const'
import Messager from './messager';

/**
 * Save window.
 *
 * @inner
 * @type {Object}
 */
const win = window

/**
 * Send Message
 *
 * @inner
 * @type {Object}
 */
const messager = new Messager();

/**
 * The mip viewer.Complement native viewer, and solve the page-level problems.
 */
let viewer = {

  /**
     * The initialise method of viewer
     */
  init () {
    /**
     * The gesture of document.Used by the event-action of Viewer.
     *
     * @private
     * @type {Gesture}
     */
    this._gesture = new Gesture(document, {
      preventX: false
    })

    this.setupEventAction()
    // handle preregistered  extensions
    this.handlePreregisteredExtensions()

    // add normal scroll class to body. except ios in iframe.
    // Patch for ios+iframe is default in mip.css
    if (!platform.needSpecialScroll) {
      document.documentElement.classList.add('mip-i-android-scroll')
      document.body.classList.add('mip-i-android-scroll')
    }

    if (this.isIframed) {
      this.patchForIframe()
      this._viewportScroll()
    }

    this.page = new Page()

    this.page.start()

    this.sendMessage('mippageload', {
      time: Date.now(),
      title: encodeURIComponent(document.title)
    })

    // proxy <a mip-link>
    this._proxyLink(this.page)
  },

  /**
   * whether in an <iframe> ?
   * **Important** if you want to know whether in BaiduResult page, DO NOT use this flag
   *
   * @type {Boolean}
   * @public
   */
  isIframed: win !== top,

  /**
   * Patch for iframe
   */
  patchForIframe () {
    // Fix iphone 5s UC and ios 9 safari bug.
    // While the back button is clicked,
    // the cached page has some problems.
    // So we are forced to load the page in iphone 5s UC
    // and iOS 9 safari.
    let iosVersion = platform.getOsVersion()
    iosVersion = iosVersion ? iosVersion.split('.')[0] : ''
    let needBackReload = (iosVersion === '8' && platform.isUc() && screen.width === 320) ||
            (iosVersion === '9' && platform.isSafari())
    if (needBackReload) {
      window.addEventListener('pageshow', e => {
        if (e.persisted) {
          document.body.style.display = 'none'
          location.reload()
        }
      })
    }
  },

  /**
   * Show contents of page. The contents will not be displayed until the components are registered.
   */
  show () {
    css(document.body, {
      opacity: 1,
      animation: 'none'
    })
    this.isShow = true
    this._showTiming = Date.now()
    this.trigger('show', this._showTiming)
  },

  /**
   * Send message to BaiduResult page,
   * including following types:
   * 1. `loadiframe` when clicking a `<a mip-link>` element
   * 2. `mipscroll` when scrolling inside an iframe, try to let parent page hide its header.
   * 3. `mippageload` when current page loaded
   * 4. `performance_update`
   *
   * @param {string} eventName
   * @param {Object} data Message body
   */
  sendMessage (eventName, data) {
    if (!win.MIP.standalone) {
      // window.top.postMessage({
      //   event: eventName,
      //   data: data
      // }, '*')
      messager.sendMessage(eventName, data);
    }
  },

  /**
   * Setup event-action of viewer. To handle `on="tap:xxx"`.
   */
  setupEventAction () {
    let hasTouch = fn.hasTouch()
    let eventAction = this.eventAction = new EventAction()
    if (hasTouch) {
      // In mobile phone, bind Gesture-tap which listen to touchstart/touchend event
      // istanbul ignore next
      this._gesture.on('tap', event => {
        eventAction.execute('tap', event.target, event)
      })
    } else {
      // In personal computer, bind click event, then trigger event. eg. `on=tap:sidebar.open`, when click, trigger open() function of #sidebar
      document.addEventListener('click', event => {
        eventAction.execute('tap', event.target, event)
      }, false)
    }

    document.addEventListener('click', event => {
      eventAction.execute('click', event.target, event)
    }, false)

    // istanbul ignore next
    event.delegate(document, 'input', 'change', event => {
      eventAction.execute('change', event.target, event)
    })
  },

  /**
   * Setup event-action of viewer. To handle `on="tap:xxx"`.
   */
  handlePreregisteredExtensions () {
    window.MIP = window.MIP || {}
    window.MIP.push = extensions => {
      if (extensions && typeof extensions.func === 'function') {
        extensions.func()
      }
    }
    let preregisteredExtensions = window.MIP.extensions
    if (preregisteredExtensions && preregisteredExtensions.length) {
      for (let i = 0; i < preregisteredExtensions.length; i++) {
        let curExtensionObj = preregisteredExtensions[i]
        if (curExtensionObj && typeof curExtensionObj.func === 'function') {
          curExtensionObj.func()
        }
      }
    }
  },

  /**
   * Event binding callback.
   * For overridding _bindEventCallback of EventEmitter.
   *
   * @private
   * @param {string} name
   * @param {Function} handler
   */
  _bindEventCallback (name, handler) {
    if (name === 'show' && this.isShow && typeof handler === 'function') {
      handler.call(this, this._showTiming)
    }
  },

  /**
   * Listerning viewport scroll
   *
   * @private
   */
  _viewportScroll () {
    let self = this
    let dist = 0
    let direct = 0
    let scrollTop = viewport.getScrollTop()
    // let lastDirect;
    let scrollHeight = viewport.getScrollHeight()
    let lastScrollTop = 0
    let wrapper = (platform.needSpecialScroll ? document.body : win)

    wrapper.addEventListener('touchstart', event => {
      scrollTop = viewport.getScrollTop()
      scrollHeight = viewport.getScrollHeight()
    })

    function pagemove () {
      scrollTop = viewport.getScrollTop()
      scrollHeight = viewport.getScrollHeight()
      if (scrollTop > 0 && scrollTop < scrollHeight) {
        if (lastScrollTop < scrollTop) {
          // down
          direct = 1
        } else if (lastScrollTop > scrollTop) {
          // up
          direct = -1
        }
        dist = lastScrollTop - scrollTop
        lastScrollTop = scrollTop
        if (dist > 10 || dist < -10) {
          // 转向判断，暂时没用到，后续升级需要
          // lastDirect = dist / Math.abs(dist);
          self.sendMessage('mipscroll', {direct, dist})
        }
      } else if (scrollTop === 0) {
        self.sendMessage('mipscroll', {direct: 0})
      }
    }
    wrapper.addEventListener('touchmove', event => pagemove())
    wrapper.addEventListener('touchend', event => pagemove())
  },

  /**
   * Proxy all the links in page.
   *
   * @private
   */
  _proxyLink (page = {}) {
    let self = this
    let {router, isRootPage, notifyRootPage} = page
    let httpRegexp = /^http/
    let telRegexp = /^tel:/

    /**
     * if an <a> tag has `mip-link` or `data-type='mip'` let router handle it,
     * otherwise let TOP jump
     */
    event.delegate(document, 'a', 'click', function (e) {
      let $a = this
      // browser will resolve fullpath, eg. http://localhost:8080/examples/page/tree.html
      let to = $a.href

      if (!to) {
        return
      }
      /**
       * For mail、phone、market、app ...
       * Safari failed when iframed. So add the `target="_top"` to fix it. except uc and tel.
       */
      if (platform.isUc() && telRegexp.test(to)) {
        return
      }
      if (!httpRegexp.test(to)) {
        this.setAttribute('target', '_top')
        return
      }

      e.preventDefault()

      if ($a.hasAttribute('mip-link') || $a.getAttribute('data-type') === 'mip') {
        // send statics message to BaiduResult page
        let loadIframeMessage = {
          url: to,
          ...self._getMipLinkData.call($a)
        }
        self.sendMessage('loadiframe', loadIframeMessage)

        // show transition
        router.rootPage.allowTransition = true

        // create target route with meta
        let targetRoute = {
          path: to,
          meta: {
            header: {
              title: loadIframeMessage.title
            }
          }
        }

        // handle <a mip-link replace>
        if ($a.hasAttribute('replace')) {
          if (isRootPage) {
            router.replace(targetRoute)
          } else {
            notifyRootPage({
              type: MESSAGE_ROUTER_REPLACE,
              data: {route: targetRoute}
            })
          }
        } else if (isRootPage) {
          router.push(targetRoute)
        } else {
          notifyRootPage({
            type: MESSAGE_ROUTER_PUSH,
            data: {route: targetRoute}
          })
        }
      } else {
        top.location.href = to
      }
    }, false)
  },

  /**
   * get alink postMessage data
   *
   * @return {Object} messageData
   */
  _getMipLinkData () {
    // TODO 'pushState'
    let messageKey = 'loadiframe'
    let messageData = {}

    // compatible with MIP1
    let parentNode = this.parentNode

    return {
      click: this.getAttribute('data-click') || parentNode.getAttribute('data-click'),
      title: this.getAttribute('data-title')
        || parentNode.getAttribute('title')
        || this.innerText.trim().split('\n')[0]
    }
  }
}

EventEmitter.mixin(viewer)

export default viewer
