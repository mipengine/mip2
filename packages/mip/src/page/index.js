/**
 * @file main entry
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {
  createIFrame,
  ensureMIPShell,
  getIFrame,
  toggleFadeHeader
} from './util/dom'
import {getCleanPageId, parsePath} from './util/path'
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
  MESSAGE_BROADCAST_EVENT,
  DEFAULT_SHELL_CONFIG
} from './const/index'
import fn from '../util/fn'
import {customEmit} from '../util/custom-event'
import viewport from '../viewport'
import performance from '../performance'
import '../styles/mip.less'
import {stringifyQuery, resolveQuery} from './util/query';

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
    this.currentPageId = undefined
    this.targetWindow = window

    // 记录 iframe 内的 page 对象。Root Page 这个属性才有意义，但 Root Page 本身不计入。
    this.children = []
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

    const hashContent = hash.slice(1)

    try {
      /**
       * @see {@link http://w3c.github.io/html/browsers.html#navigating-to-a-fragment-identifier}
       */
      const anchor = document.getElementById(hashContent) ||
        document.getElementById(decodeURIComponent(hashContent)) ||
        document.querySelector(`a[name="${hashContent}"]`)

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

  /**
   * Create and prerender iframe(s) sliently
   * Cross Origin is now allowed
   * Each page can invoke this function
   *
   * @param {Array|string} urls
   * @returns {Promise}
   */
  prerender (urls) {
    /* istanbul ignore next */
    if (this.isCrossOrigin) {
      console.warn('跨域 MIP 页面暂不支持预渲染')
      return
    }

    let target = this.isRootPage ? this : /* istanbul ignore next */ window.parent.MIP.viewer.page
    return target.prerenderPages(urls)
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
   * Check if children.length exceeds MAX_PAGE_NUM
   * If so, remove one
   *
   * @param {string} targetPageId targetPageId
   */
  checkIfExceedsMaxPageNum (targetPageId) {
    /* istanbul ignore next */
    if (!this.isRootPage) {
      console.warn('该方法只能在 rootPage 调用')
      return
    }
    if (this.children.length >= MAX_PAGE_NUM) {
      let currentPage
      let prerenderIFrames = []
      let found = false
      for (let i = 0; i < this.children.length; i++) {
        currentPage = this.children[i]
        // Find first removable page, which can't be target page or current page
        if (currentPage.pageId !== targetPageId &&
          currentPage.pageId !== this.currentPageId) {
          const firstRemovableIframe = getIFrame(currentPage.pageId)

          // If prerendered, skip it first
          if (firstRemovableIframe.getAttribute('prerender') === '1') {
            prerenderIFrames.push({iframe: firstRemovableIframe, index: i})
            continue
          }

          if (firstRemovableIframe && firstRemovableIframe.parentNode) {
            firstRemovableIframe.parentNode.removeChild(firstRemovableIframe)
            this.children.splice(i, 1)
            found = true
          }
          return
        }
      }

      if (!found) {
        // Find one in prerendered iframe
        for (let i = 0; i < prerenderIFrames.length; i++) {
          const firstRemovableIframe = prerenderIFrames[i].iframe
          if (firstRemovableIframe && firstRemovableIframe.parentNode) {
            firstRemovableIframe.parentNode.removeChild(firstRemovableIframe)
            this.children.splice(prerenderIFrames[i].index, 1)
            return
          }
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
    if (!pageId) {
      return this
    }

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].pageId === pageId) {
        return this.children[i]
      }
    }

    if (pageId === this.pageId) {
      return this
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

  /**
   * Create and prerender iframe(s) sliently
   * Cross Origin is now allowed
   *
   * @param {Array|string} urls
   * @returns {Promise}
   */
  prerenderPages (urls) {
    /* istanbul ignore next */
    if (!this.isRootPage) {
      console.warn('该方法只能在 rootPage 调用')
      return Promise.reject()
    }
    if (typeof urls === 'string') {
      urls = [urls]
    }

    if (!Array.isArray(urls)) {
      return Promise.reject('预渲染参数必须是一个数组')
    }

    let createPrerenderIFrame = ({fullpath, pageId}) => {
      return new Promise((resolve, reject) => {
        let me = this
        let iframe = getIFrame(pageId)
        /* istanbul ignore next */
        if (iframe) {
          // 预加载前已经存在，直接返回即可
          resolve(iframe)
          return
        }

        createIFrame({fullpath: fullpath + '#prerender=1', pageId}, {
          onLoad (newIframe) {
            newIframe.setAttribute('prerender', '1')
            let targetPageInfo = {
              pageId,
              pageMeta: fn.extend(true, {}, findMetaByPageId(pageId)),
              fullpath,
              standalone: window.MIP.standalone,
              isRootPage: false,
              isCrossOrigin: false,
              isPrerender: true
            }
            targetPageInfo.targetWindow = newIframe.contentWindow
            me.addChild(targetPageInfo)
            me.checkIfExceedsMaxPageNum(pageId)

            resolve(newIframe)
          },
          onError (newIframe) {
            /* istanbul ignore next */
            reject(newIframe)
          }
        })
      })
    }

    let findMetaByPageId = pageId => {
      let target
      /* istanbul ignore next */
      if (!this.isRootPage && !this.isCrossOrigin) {
        target = window.parent
      } else {
        target = window
      }

      /* istanbul ignore next */
      if (target.MIP_PAGE_META_CACHE[pageId]) {
        return target.MIP_PAGE_META_CACHE[pageId]
      } else {
        for (let i = 0; i < target.MIP_SHELL_CONFIG.length; i++) {
          let route = target.MIP_SHELL_CONFIG[i]
          if (route.regexp.test(pageId)) {
            target.MIP_PAGE_META_CACHE[pageId] = route.meta
            return route.meta
          }
        }
      }

      /* istanbul ignore next */
      console.warn('Cannot find MIP Shell Config for current page. Use default instead.')
      /* istanbul ignore next */
      return Object.assign({}, DEFAULT_SHELL_CONFIG)
    }

    return Promise.all(urls.map(fullpath => {
      /* istanbul ignore next */
      if (window.MIP.viewer._isCrossOrigin(fullpath)) {
        console.warn('跨域 MIP 页面暂不支持预渲染', fullpath)
        return Promise.resolve()
      }

      // 处理 URL 的 query 中带有可转义字符的问题
      // 小说资源方存在一些链接如 http://some-site.com/read?bkid=189169121&crid=1&fr=bdgfh&mip=1?novel&pg=3 (有 2 个问号)
      // viewer.open 跳转时，内部的 normalizeLocation 会把 mip=1?novel 转化为 mip=1%3Fnovel
      // 而 prerender 不处理的话，依然是 mip=1?novel
      // 从而导致两端匹配不上，跳转页面时虽然 cache-first，依然找不到目标从而重新开一个新页面
      // 为了解决这个问题，在 prerender 也要对 query 做相同处理
      let parsedPath = parsePath(fullpath)
      /* istanbul ignore next */
      if (parsedPath.query) {
        // parsedPath.query = 'a=1&b=2&mip=1?novel'
        let query = resolveQuery(parsedPath.query) // query = {a: '1', b: '2', mip: '1?novel'}
        let queryAfterProcess = stringifyQuery(query) // queryAfterProcess = '?a=1&b=2&mip=1%3Fnovel
        if (queryAfterProcess.charAt(0) === '?') {
          queryAfterProcess = queryAfterProcess.substring(1, queryAfterProcess.length)
        }
        fullpath = fullpath.replace(parsedPath.query, queryAfterProcess)
      }

      let pageId = getCleanPageId(fullpath)
      return createPrerenderIFrame({fullpath, pageId})
    }))
  }
}

export default Page
