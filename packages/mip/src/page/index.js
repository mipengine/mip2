/**
 * @file main entry
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {isSameRoute, getFullPath} from './util/route'
import {
  ensureMIPShell,
  createIFrame,
  getIFrame,
  frameMoveIn,
  frameMoveOut,
  createLoading,
  createFadeHeader,
  toggleFadeHeader,
  enableBouncyScrolling,
  disableBouncyScrolling
} from './util/dom'
import Debouncer from './util/debounce'
import {supportsPassive} from './util/feature-detect'
import {scrollTo} from './util/ease-scroll'
import {
  MAX_PAGE_NUM,
  NON_EXISTS_PAGE_ID,
  CUSTOM_EVENT_SCROLL_TO_ANCHOR,
  CUSTOM_EVENT_SHOW_PAGE,
  CUSTOM_EVENT_HIDE_PAGE,
  DEFAULT_SHELL_CONFIG,
  MESSAGE_ROUTER_PUSH,
  MESSAGE_ROUTER_REPLACE,
  MESSAGE_ROUTER_BACK,
  MESSAGE_ROUTER_FORWARD,
  MESSAGE_SET_MIP_SHELL_CONFIG,
  MESSAGE_UPDATE_MIP_SHELL_CONFIG,
  MESSAGE_SYNC_PAGE_CONFIG,
  MESSAGE_REGISTER_GLOBAL_COMPONENT,
  MESSAGE_CROSS_ORIGIN,
  MESSAGE_BROADCAST_EVENT,
  MESSAGE_PAGE_RESIZE,
  CUSTOM_EVENT_RESIZE_PAGE
} from './const/index'

import {customEmit} from '../vue-custom-element/utils/custom-event'
import fn from '../util/fn'
import {makeCacheUrl} from '../util'
import viewport from '../viewport'
import Router from './router/index'
import GlobalComponent from './appshell/globalComponent'
import platform from '../util/platform'
import '../styles/mip.less'

/**
 * use passive event listeners if supported
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
const eventListenerOptions = supportsPassive ? {passive: true} : false
// const eventListenerOptions = false

class Page {
  constructor () {
    Object.assign(this, window.MIP.viewer.pageMeta)
    this.pageId = undefined

    // root page
    // this.appshell = undefined
    this.children = []
    this.currentPageId = undefined
    this.messageHandlers = []
    this.currentPageMeta = {}
    this.direction = undefined
    this.appshellRoutes = []
    this.appshellCache = Object.create(null)
    this.targetWindow = window

    // sync from mip-shell
    this.transitionContainsHeader = true

    /**
     * transition will be executed only when `Back` button clicked,
     * due to a bug when going back with gesture in mobile Safari.
     */
    this.allowTransition = false
  }

  /**
   * clean pageId
   *
   * @param {string} pageId pageId
   * @return {string} cleaned pageId
   */
  cleanPageId (pageId) {
    let hashReg = /#.*$/
    return pageId && pageId.replace(hashReg, '')
  }

  initRouter () {
    let router

    // generate pageId
    this.pageId = this.cleanPageId(window.location.href)
    this.currentPageId = this.pageId

    if (this.isRootPage) {
      // outside iframe
      router = new Router()
      router.init()
      router.listen(this.render.bind(this))

      window.MIP_ROUTER = router

      // handle events emitted by child iframe
      this.messageHandlers.push((type, data) => {
        if (type === MESSAGE_ROUTER_PUSH) {
          router.push(data.route)
        } else if (type === MESSAGE_ROUTER_REPLACE) {
          router.replace(data.route)
        } else if (type === MESSAGE_ROUTER_BACK) {
          this.allowTransition = true
          router.back()
        } else if (type === MESSAGE_ROUTER_FORWARD) {
          this.allowTransition = true
          router.forward()
        }
      })

      // handle events emitted by BaiduResult page
      window.MIP.viewer.onMessage('changeState', ({url}) => {
        router.replace(makeCacheUrl(url, 'url', true))
      })
    }

    this.router = router
  }

  initAppShell () {
    if (this.isRootPage) {
      this.globalComponent = new GlobalComponent()
      this.messageHandlers.push((type, data) => {
        if (type === MESSAGE_SET_MIP_SHELL_CONFIG) {
          // Set mip shell config in root page
          this.appshellRoutes = data.shellConfig
          this.appshellCache = Object.create(null)
          this.currentPageMeta = this.findMetaByPageId(this.pageId)
          createLoading(this.currentPageMeta)

          if (!this.transitionContainsHeader) {
            createFadeHeader(this.currentPageMeta)
          }

          // Set bouncy header
          if (!data.update && this.currentPageMeta.header.bouncy) {
            this.setupBouncyHeader()
          }
        } else if (type === MESSAGE_UPDATE_MIP_SHELL_CONFIG) {
          if (data.pageMeta) {
            this.appshellCache[data.pageId] = data.pageMeta
          } else {
            data.pageMeta = this.findMetaByPageId(data.pageId)
          }
          customEmit(window, 'mipShellEvents', {
            type: 'updateShell',
            data
          })
        } else if (type === MESSAGE_SYNC_PAGE_CONFIG) {
          // Sync config from mip-shell
          this.transitionContainsHeader = data.transitionContainsHeader
        } else if (type === MESSAGE_BROADCAST_EVENT) {
          // Broadcast Event
          this.broadcastCustomEvent(data)
        } else if (type === MESSAGE_REGISTER_GLOBAL_COMPONENT) {
          // Register global component (Not finished)
          console.log('register global component')
          // this.globalComponent.register(data)
        } else if (type === MESSAGE_PAGE_RESIZE) {
          this.resizeAllPages()
        }
      })

      // update every iframe's height when viewport resizing
      viewport.on('resize', () => {
        // only when screen gets spinned
        let currentViewportWidth = viewport.getWidth()
        if (this.currentViewportWidth !== currentViewportWidth) {
          this.currentViewportHeight = viewport.getHeight()
          this.currentViewportWidth = currentViewportWidth
          this.resizeAllPages()
        }
      })

      // Set iframe height when resizing
      // viewport.on('resize', () => {
      //   [].slice.call(document.querySelectorAll('.mip-page__iframe')).forEach($el => {
      //     $el.style.height = `${viewport.getHeight()}px`
      //   })
      // })
    }

    // cross origin
    this.messageHandlers.push((type, data) => {
      if (type === MESSAGE_CROSS_ORIGIN) {
        customEmit(window, data.name, data.data)
      }
    })
  }

  /**
   * scroll to hash with ease transition
   *
   * @param {string} hash hash
   */
  scrollToHash (hash) {
    if (hash) {
      try {
        let $hash = document.querySelector(decodeURIComponent(hash))
        if ($hash) {
          // scroll to current hash
          scrollTo($hash.offsetTop, {
            scrollTop: viewport.getScrollTop()
          })
        }
      } catch (e) {}
    }
  }

  /**
   * listen to viewport.scroller, toggle header when scrolling up & down
   *
   */
  setupBouncyHeader () {
    if (this.bouncyHeaderSetup) {
      return
    }
    this.bouncyHeaderSetup = true
    const THRESHOLD = 10
    let scrollTop
    let lastScrollTop = 0
    let scrollDistance
    let scrollHeight = viewport.getScrollHeight()
    let viewportHeight = viewport.getHeight()
    let lastScrollDirection

    // viewportHeight = 0 before frameMoveIn animation ends
    // Wait a minute
    if (viewportHeight === 0) {
      setTimeout(this.setupBouncyHeader.bind(this), 100)
      return
    }

    this.debouncer = new Debouncer(() => {
      scrollTop = viewport.getScrollTop()
      scrollDistance = Math.abs(scrollTop - lastScrollTop)

      // ignore bouncy scrolling in iOS
      if (scrollTop < 0 || scrollTop + viewportHeight > scrollHeight) {
        return
      }

      if (lastScrollTop < scrollTop && scrollDistance >= THRESHOLD) {
        if (lastScrollDirection !== 'up') {
          lastScrollDirection = 'up'
          let target = this.isRootPage ? window : window.parent
          this.emitCustomEvent(target, this.isCrossOrigin, {
            name: 'mipShellEvents',
            data: {
              type: 'slide',
              data: {
                direction: 'up'
              }
            }
          })
        }
      } else if (lastScrollTop > scrollTop && scrollDistance >= THRESHOLD) {
        if (lastScrollDirection !== 'down') {
          lastScrollDirection = 'down'
          let target = this.isRootPage ? window : window.parent
          this.emitCustomEvent(target, this.isCrossOrigin, {
            name: 'mipShellEvents',
            data: {
              type: 'slide',
              data: {
                direction: 'down'
              }
            }
          })
        }
      }

      lastScrollTop = scrollTop
    })

    // use passive event listener to improve scroll performance
    viewport.scroller.addEventListener('scroll', this.debouncer, eventListenerOptions)
    this.debouncer.handleEvent()
  }

  /**
   * notify root page with an eventdata
   *
   * @param {Object} data eventdata
   */
  notifyRootPage (data) {
    if (this.isRootPage) {
      window.postMessage(data, window.location.origin)
    } else {
      window.parent.postMessage(data, this.isCrossOrigin ? '*' : window.location.origin)
    }
  }

  /**
   * destroy current page
   *
   */
  destroy () {
    viewport.scroller.removeEventListener('scroll', this.debouncer, false)
  }

  start () {
    // Don't let browser restore scroll position.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    ensureMIPShell()
    this.initRouter()
    this.initAppShell()

    // Listen message from inner iframes
    window.addEventListener('message', (e) => {
      try {
        this.messageHandlers.forEach(handler => {
          handler.call(this, e.data.type, e.data.data || {})
        })
      } catch (e) {
        // Message sent from SF will cause cross domain error when reading e.source.location
        // Just ignore these messages.
      }
    }, false)

    // Job complete!
    document.body.setAttribute('mip-ready', '')

    // ========================= Some HACKs =========================

    // prevent bouncy scroll in iOS 7 & 8
    if (platform.isIos()) {
      let iosVersion = platform.getOsVersion()
      iosVersion = iosVersion ? iosVersion.split('.')[0] : ''
      if (!(iosVersion === '8' || iosVersion === '7')) {
        document.documentElement.classList.add('mip-i-ios-scroll')
      }
    }

    // adjust scroll position in iOS, see viewer._lockBodyScroll()
    if (window.MIP.viewer.isIframed && platform.isIos()) {
      document.documentElement.classList.add('trigger-layout')
      document.body.classList.add('trigger-layout')
      viewport.setScrollTop(1)
    }

    // trigger layout to solve a strange bug in Android Superframe, which will make page unscrollable
    if (platform.isAndroid()) {
      setTimeout(() => {
        document.documentElement.classList.add('trigger-layout')
        document.body.classList.add('trigger-layout')
      })
    }

    // fix a UC/shoubai bug https://github.com/mipengine/mip2/issues/19
    let isBuggy = platform.isIos() &&
      !platform.isSafari() && !platform.isChrome()
    window.addEventListener(CUSTOM_EVENT_SHOW_PAGE, (e) => {
      if (isBuggy) {
        enableBouncyScrolling()
      }
    })
    window.addEventListener(CUSTOM_EVENT_HIDE_PAGE, (e) => {
      if (isBuggy) {
        disableBouncyScrolling()
      }
    })

    if (this.isRootPage) {
      this.currentViewportHeight = viewport.getHeight()
      this.currentViewportWidth = viewport.getWidth()
    }

    // scroll to current hash if exists
    this.scrollToHash(window.location.hash)
    window.addEventListener(CUSTOM_EVENT_SCROLL_TO_ANCHOR, (e) => {
      this.scrollToHash(e.detail[0])
    })

    // trigger show page custom event
    this.emitEventInCurrentPage({name: CUSTOM_EVENT_SHOW_PAGE})
  }

  // ========================= Util functions for developers =========================
  togglePageMask (toggle, options) {
    // Only show page mask in root page
    if (!this.isRootPage) {
      this.emitCustomEvent(window.parent, true, {
        name: 'mipShellEvents',
        data: {
          type: 'togglePageMask',
          data: {
            toggle,
            options
          }
        }
      })
    }
  }

  toggleDropdown (toggle) {
    let target = this.isRootPage ? window : window.parent
    customEmit(target, 'mipShellEvents', {
      type: 'toggleDropdown',
      data: {
        toggle
      }
    })
  }

  toggleFadeHeader (toggle, pageMeta) {
    toggleFadeHeader(toggle, pageMeta)
  }

  /**
   * Emit a custom event in current page
   *
   * @param {Object} event event
   */
  emitCustomEvent (targetWindow, isCrossOrigin, event) {
    if (isCrossOrigin) {
      targetWindow.postMessage({
        type: MESSAGE_CROSS_ORIGIN,
        data: event
      }, '*')
    } else {
      customEmit(targetWindow, event.name, event.data)
    }
  }

  broadcastCustomEvent (event) {
    if (this.isRootPage) {
      customEmit(window, event.name, event.data)

      this.children.forEach(pageMeta => {
        pageMeta.targetWindow.postMessage({
          type: MESSAGE_CROSS_ORIGIN,
          data: event
        }, '*')
      })
    } else {
      window.parent.postMessage({
        type: MESSAGE_BROADCAST_EVENT,
        data: event
      }, '*')
    }
  }

  back () {
    this.notifyRootPage({type: MESSAGE_ROUTER_BACK})
  }

  forward () {
    this.notifyRootPage({type: MESSAGE_ROUTER_FORWARD})
  }

  // =============================== Root Page methods ===============================

  /**
   * emit a custom event in current page
   *
   * @param {Object} event event
   */
  emitEventInCurrentPage (event) {
    let currentPage = this.getPageById(this.currentPageId)
    this.emitCustomEvent(currentPage.targetWindow, currentPage.isCrossOrigin, event)
  }

  /**
   * find route.meta by pageId
   * @param {string} pageId pageId
   * @return {Object} meta object
   */
  findMetaByPageId (pageId) {
    if (this.appshellCache[pageId]) {
      return this.appshellCache[pageId]
    } else {
      let route
      for (let i = 0; i < this.appshellRoutes.length; i++) {
        route = this.appshellRoutes[i]
        if (route.regexp.test(pageId)) {
          this.appshellCache[pageId] = route.meta
          return route.meta
        }
      }
    }

    return Object.assign({}, DEFAULT_SHELL_CONFIG)
  }

  /**
   * save scroll position in root page
   */
  saveScrollPosition () {
    this.rootPageScrollPosition = viewport.getScrollTop()
  }

  /**
   * restore scroll position in root page
   */
  restoreScrollPosition () {
    viewport.setScrollTop(this.rootPageScrollPosition)
  }

  /**
   * apply transition effect to relative two pages
   *
   * @param {string} targetPageId targetPageId
   * @param {Object} targetMeta metainfo of targetPage
   * @param {Object} options
   * @param {Object} options.newPage if just created a new page
   * @param {Function} options.onComplete if just created a new page
   */
  applyTransition (targetPageId, targetMeta, options = {}) {
    let localMeta = this.findMetaByPageId(targetPageId)
    /**
     * priority of header.title:
     * 1. <a mip-link data-title>
     * 2. <mip-shell> route.meta.header.title
     * 3. <a mip-link></a> innerText
     */
    let innerTitle = {title: targetMeta.defaultTitle || undefined}
    let finalMeta = fn.extend(true, innerTitle, localMeta, targetMeta)

    customEmit(window, 'mipShellEvents', {
      type: 'toggleTransition',
      data: {
        toggle: false
      }
    })

    if (targetPageId === this.pageId || this.direction === 'back') {
      // backward
      let backwardOpitons = {
        transition: targetMeta.allowTransition || this.allowTransition,
        sourceMeta: this.currentPageMeta,
        transitionContainsHeader: this.transitionContainsHeader,
        onComplete: () => {
          this.allowTransition = false
          this.currentPageMeta = finalMeta
          customEmit(window, 'mipShellEvents', {
            type: 'toggleTransition',
            data: {
              toggle: true
            }
          })
          if (this.direction === 'back' && targetPageId !== this.pageId) {
            document.documentElement.classList.add('mip-no-scroll')
            Array.prototype.slice.call(this.getElementsInRootPage()).forEach(e => e.classList.add('hide'))
          }
          options.onComplete && options.onComplete()
        }
      }

      if (this.direction === 'back') {
        backwardOpitons.targetPageId = targetPageId
        backwardOpitons.targetPageMeta = this.findMetaByPageId(targetPageId)
      } else {
        backwardOpitons.targetPageMeta = this.currentPageMeta
      }

      // move current iframe to correct position
      backwardOpitons.rootPageScrollPosition = 0
      if (targetPageId === this.pageId) {
        backwardOpitons.rootPageScrollPosition = this.rootPageScrollPosition
        document.documentElement.classList.remove('mip-no-scroll')
        Array.prototype.slice.call(this.getElementsInRootPage()).forEach(e => e.classList.remove('hide'))
      }
      frameMoveOut(this.currentPageId, backwardOpitons)

      this.direction = null
      // restore scroll position in root page
      if (targetPageId === this.pageId) {
        this.restoreScrollPosition()
      }
    } else {
      // forward
      frameMoveIn(targetPageId, {
        transition: targetMeta.allowTransition || this.allowTransition,
        targetMeta: finalMeta,
        newPage: options.newPage,
        transitionContainsHeader: this.transitionContainsHeader,
        onComplete: () => {
          this.allowTransition = false
          this.currentPageMeta = finalMeta
          // TODO: Prevent transition on first view in some cases
          customEmit(window, 'mipShellEvents', {
            type: 'toggleTransition',
            data: {
              toggle: true
            }
          })
          /**
           * Disable scrolling of root page when covered by an iframe
           * NOTE: it doesn't work in iOS, see `_lockBodyScroll()` in viewer.js
           */
          document.documentElement.classList.add('mip-no-scroll')
          Array.prototype.slice.call(this.getElementsInRootPage()).forEach(e => e.classList.add('hide'))
          options.onComplete && options.onComplete()
        }
      })
    }
  }

  /**
   * add page to `children`
   *
   * @param {Page} page page
   */
  addChild (page) {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].pageId === page.pageId) {
        this.children.splice(i, 1)
        break
      }
    }
    this.children.push(page)
  }

  /**
   * check if children.length exceeds MAX_PAGE_NUM
   * if so, remove the first child
   */
  checkIfExceedsMaxPageNum () {
    if (this.children.length >= MAX_PAGE_NUM) {
      // remove from children list
      let firstChildPage = this.children.splice(0, 1)[0]
      let firstIframe = getIFrame(firstChildPage.pageId)
      if (firstIframe && firstIframe.parentNode) {
        firstIframe.parentNode.removeChild(firstIframe)
      }
    }
  }

  /**
   * get page by pageId
   *
   * @param {string} pageId pageId
   * @return {Page} page
   */
  getPageById (pageId) {
    if (!pageId || pageId === this.pageId) {
      return this
    }

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].pageId === pageId) {
        return this.children[i]
      }
    }

    return null
  }

  /**
   * get elements in root page, except some shared by all the pages
   *
   * @return {Array<HTMLElement>} elements
   */
  getElementsInRootPage () {
    let whitelist = [
      '.mip-page__iframe',
      '.mip-page-loading-wrapper',
      '.mip-page-fade-header-wrapper',
      'mip-shell',
      '[mip-shell]',
      '.mip-shell-header-wrapper',
      '.mip-shell-more-button-mask',
      '.mip-shell-more-button-wrapper',
      '.mip-shell-header-mask',
      '[mip-global-component]'
    ]
    let notInWhitelistSelector = whitelist.map(selector => `:not(${selector})`).join('')
    return document.body.querySelectorAll(`body > ${notInWhitelistSelector}`)
  }

  /**
   * handle resize event
   */
  resizeAllPages () {
    // 1.set every page's iframe
    Array.prototype.slice.call(document.querySelectorAll('.mip-page__iframe')).forEach($el => {
      $el.style.height = `${this.currentViewportHeight}px`
    })
    // 2.notify <mip-iframe> in every page
    this.broadcastCustomEvent({
      name: CUSTOM_EVENT_RESIZE_PAGE,
      data: {
        height: this.currentViewportHeight
      }
    })
    // 3.notify SF to set the iframe outside
    window.MIP.viewer.sendMessage('resizeContainer', {height: this.currentViewportHeight})
  }

  /**
   * render with current route
   *
   * @param {Route} from route
   * @param {Route} to route
   */
  render (from, to) {
    this.resizeAllPages()
    /**
     * if `to` route is the same with `from` route in path & query,
     * scroll in current page
     */
    if (isSameRoute(from, to, true)) {
      this.emitEventInCurrentPage({
        name: CUSTOM_EVENT_SCROLL_TO_ANCHOR,
        data: to.hash
      })
      return
    }

    // otherwise, render target page
    let targetFullPath = getFullPath(to)
    let targetPageId = this.cleanPageId(targetFullPath)
    let targetPage = this.getPageById(targetPageId)

    if (this.currentPageId === this.pageId) {
      this.saveScrollPosition()
    }

    // Hide page mask and skip transition
    customEmit(window, 'mipShellEvents', {
      type: 'togglePageMask',
      data: {
        toggle: false,
        options: {
          skipTransition: true
        }
      }
    })

    // Show header
    customEmit(window, 'mipShellEvents', {
      type: 'slide',
      data: {
        direction: 'down'
      }
    })

    /**
     * reload iframe when <a mip-link> clicked even if it's already existed.
     * NOTE: forwarding or going back with browser history won't do
     */
    let needEmitPageEvent = true
    if (!targetPage || (to.meta && to.meta.reload)) {
      // when reloading root page...
      if (this.pageId === targetPageId) {
        this.pageId = NON_EXISTS_PAGE_ID
        // destroy root page first
        if (targetPage) {
          targetPage.destroy()
        }
        // TODO: delete DOM & trigger disconnectedCallback in root page
        Array.prototype.slice.call(this.getElementsInRootPage()).forEach(el => el.parentNode && el.parentNode.removeChild(el))
      }

      this.checkIfExceedsMaxPageNum()

      let targetPageMeta = {
        pageId: targetPageId,
        fullpath: targetFullPath,
        standalone: window.MIP.standalone,
        isRootPage: false,
        isCrossOrigin: to.origin !== window.location.origin
      }
      this.addChild(targetPageMeta)

      // Create a new iframe
      targetPageMeta.targetWindow = createIFrame(targetPageMeta).contentWindow
      // needEmitPageEvent = false
      this.applyTransition(targetPageId, to.meta, {
        newPage: true
        // onComplete: () => {
        //   targetPageMeta.targetWindow = createIFrame(targetPageMeta).contentWindow
        //   this.emitEventInCurrentPage({name: CUSTOM_EVENT_HIDE_PAGE})
        //   this.currentPageId = targetPageId
        //   this.emitEventInCurrentPage({name: CUSTOM_EVENT_SHOW_PAGE})
        // }
      })
    } else {
      this.applyTransition(targetPageId, to.meta, {
        onComplete: () => {
          // Update shell if new iframe has not been created
          let pageMeta = this.findMetaByPageId(targetPageId)
          customEmit(window, 'mipShellEvents', {
            type: 'updateShell',
            data: {pageMeta}
          })
        }
      })
      window.MIP.$recompile()
    }

    if (needEmitPageEvent) {
      this.emitEventInCurrentPage({name: CUSTOM_EVENT_HIDE_PAGE})
      this.currentPageId = targetPageId
      this.emitEventInCurrentPage({name: CUSTOM_EVENT_SHOW_PAGE})
    }
  }
}

export default Page
