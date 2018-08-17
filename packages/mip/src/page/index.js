/**
 * @file main entry
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {
  ensureMIPShell,
  getIFrame,
  toggleFadeHeader
} from './util/dom'
import {getCleanPageId} from './util/path'
import Debouncer from './util/debounce'
import {supportsPassive} from './util/feature-detect'
import {scrollTo} from './util/ease-scroll'
import {
  MAX_PAGE_NUM,
  CUSTOM_EVENT_SCROLL_TO_ANCHOR,
  CUSTOM_EVENT_SHOW_PAGE,
  MESSAGE_ROUTER_PUSH,
  MESSAGE_ROUTER_REPLACE,
  MESSAGE_ROUTER_BACK,
  MESSAGE_ROUTER_FORWARD,
  MESSAGE_CROSS_ORIGIN,
  MESSAGE_BROADCAST_EVENT
} from './const/index'

import {customEmit} from '../util/custom-event'
import viewport from '../viewport'
import performance from '../performance'
import '../styles/mip.less'

/**
 * use passive event listeners if supported
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
const eventListenerOptions = supportsPassive ? {passive: true} : /* istanbul ignore next */false

class Page {
  constructor () {
    Object.assign(this, window.MIP.viewer.pageMeta)
    this.pageId = undefined
    this.fullpath = undefined
    this.pageMeta = undefined

    // root page
    this.children = []
    this.currentPageId = undefined
    this.targetWindow = window
  }

  initPageId () {
    // generate pageId
    this.fullpath = window.location.href
    this.pageId = getCleanPageId(this.fullpath)
    this.currentPageId = this.pageId
  }

  /**
   * scroll to hash with ease transition
   *
   * @param {string} hash hash
   */
  scrollToHash (hash) {
    if (typeof hash !== 'string' || hash[0] !== '#') {
      return
    }

    try {
      const anchor = document.getElementById(hash.slice(1)) ||
        document.getElementById(decodeURIComponent(hash.slice(1)))

      /* istanbul ignore next */
      if (anchor) {
        scrollTo(anchor.offsetTop, {
          scrollTop: viewport.getScrollTop()
        })
      }
    } catch (e) {}
  }

  /**
   * listen to viewport.scroller, toggle header when scrolling up & down
   *
   */
  setupBouncyHeader () {
    if (this.bouncyHeaderSetup) {
      return
    }
    const THRESHOLD = 10
    let scrollTop
    let lastScrollTop = 0
    let scrollDistance
    let scrollHeight = viewport.getScrollHeight()
    let viewportHeight = viewport.getHeight()

    // viewportHeight = 0 before frameMoveIn animation ends
    // Wait a minute
    /* istanbul ignore next */
    if (viewportHeight === 0) {
      setTimeout(this.setupBouncyHeader.bind(this), 100)
      return
    }

    this.bouncyHeaderSetup = true
    this.debouncer = new Debouncer(() => {
      scrollTop = viewport.getScrollTop()
      scrollDistance = Math.abs(scrollTop - lastScrollTop)

      // ignore bouncy scrolling in iOS
      /* istanbul ignore next */
      if (scrollTop < 0 || scrollTop + viewportHeight > scrollHeight) {
        return
      }

      /* istanbul ignore next */
      if (lastScrollTop < scrollTop && scrollDistance >= THRESHOLD) {
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
      }/* istanbul ignore next */ else if (lastScrollTop > scrollTop && scrollDistance >= THRESHOLD) {
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
    /* istanbul ignore else */
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
    /* istanbul ignore next */
    viewport.scroller.removeEventListener('scroll', this.debouncer, false)
  }

  start () {
    ensureMIPShell()
    this.initPageId()

    /**
     * scroll to anchor after all the elements loaded
     * fix: https://github.com/mipengine/mip2/issues/125
     */
    performance.on('update', timing => {
      if (timing.MIPFirstScreen) {
        // scroll to current hash if exists
        this.scrollToHash(window.location.hash)
      }
    })

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
  /* istanbul ignore next */
  toggleFadeHeader (toggle, pageMeta) {
    toggleFadeHeader(toggle, pageMeta)
  }

  /**
   * Emit a custom event in current page
   *
   * @param {Window} targetWindow Window of target page. Can be `window` or `window.top`
   * @param {boolean} isCrossOrigin Whether targetWindow is cross origin compared with current one
   * @param {Object} event Event needs to be sent
   * @param {string} event.name Event name
   * @param {Object} event.data Event data
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

  /**
   * Broadcast custom event to all pages.
   *
   * @param {Object} event Event needs to be sent
   * @param {string} event.name Event name
   * @param {Object} event.data Event data
   */
  broadcastCustomEvent (event) {
    if (this.isRootPage) {
      customEmit(window, event.name, event.data)

      this.children.forEach(pageMeta => {
        if (pageMeta.targetWindow) {
          pageMeta.targetWindow.postMessage({
            type: MESSAGE_CROSS_ORIGIN,
            data: event
          }, '*')
        }
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

  push (route, options = {}) {
    this.notifyRootPage({
      type: MESSAGE_ROUTER_PUSH,
      data: {route, options}
    })
  }

  replace (route, options = {}) {
    this.notifyRootPage({
      type: MESSAGE_ROUTER_REPLACE,
      data: {route, options}
    })
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
  /* istanbul ignore next */
  checkIfExceedsMaxPageNum (targetPageId) {
    if (this.children.length >= MAX_PAGE_NUM) {
      let currentPage
      for (let i = 0; i < this.children.length; i++) {
        currentPage = this.children[i]
        // find first removable page, which can't be target page or current page
        if (currentPage.pageId !== targetPageId &&
          currentPage.pageId !== this.currentPageId) {
          const firstRemovableIframe = getIFrame(currentPage.pageId)
          if (firstRemovableIframe && firstRemovableIframe.parentNode) {
            firstRemovableIframe.parentNode.removeChild(firstRemovableIframe)
          }
          // remove from children list
          this.children.splice(i, 1)
          return
        }
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
      '[mip-shell-inner]',
      '.mip-shell-header-wrapper',
      '.mip-shell-more-button-mask',
      '.mip-shell-more-button-wrapper',
      '.mip-shell-header-mask',
      '[mip-global-component]'
    ]
    let notInWhitelistSelector = whitelist.map(selector => `:not(${selector})`).join('')
    return [...document.querySelectorAll(`body > ${notInWhitelistSelector}`)]
  }
}

export default Page
