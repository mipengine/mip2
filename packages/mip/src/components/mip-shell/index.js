/* istanbul ignore file */
/**
 * @file MIP Shell Base
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {
  convertPatternToRegexp,
  checkRouteConfig
} from './util'
import {
  createMoreButtonWrapper,
  createPageMask,
  toggleInner,
  renderHeader,
  bindHeaderEvents,
  unbindHeaderEvents
} from './dom'
import {render} from './render'
import {makeCacheUrl} from '../../util'
import css from '../../util/dom/css'
import fn from '../../util/fn'
import CustomElement from '../../custom-element'
import {
  createLoading,
  toggleFadeHeader
} from '../../page/util/dom'
import Router from '../../page/router/index'
import {
  DEFAULT_SHELL_CONFIG,
  CUSTOM_EVENT_RESIZE_PAGE,
  MESSAGE_ROUTER_PUSH,
  MESSAGE_ROUTER_REPLACE,
  MESSAGE_ROUTER_BACK,
  MESSAGE_ROUTER_FORWARD,
  MESSAGE_CROSS_ORIGIN,
  MESSAGE_BROADCAST_EVENT,
  MESSAGE_PAGE_RESIZE,
  OUTER_MESSAGE_CHANGE_STATE,
  OUTER_MESSAGE_CLOSE
} from '../../page/const/index'
import viewport from '../../viewport'
import {customEmit} from '../../util/custom-event'

let viewer = null
let page = null
let isHeaderShown = false

window.MIP_PAGE_META_CACHE = Object.create(null)
window.MIP_SHELL_CONFIG = null

class MipShell extends CustomElement {
  // ===================== CustomElement LifeCycle =====================
  constructor (...args) {
    super(...args)

    this.messageHandlers = []

    // If true, always load configures from `<mip-shell>` and overwrite shellConfig when opening new page
    this.alwaysReadConfigOnLoad = true

    // If true, always use title in shell config of target page when switing page
    // Otherwise, use title from last page (`data-title` and shell config and innerText)
    this.alwaysUseTitleInShellConfig = false

    // If true, page switching transition contains header
    this.transitionContainsHeader = true

    // If true, all MIP Shell Config warning won't be shown
    this.ignoreWarning = false
  }

  build () {
    viewer = window.MIP.viewer
    page = viewer.page

    // Read config
    let ele = this.element.querySelector('script[type="application/json"]')
    let tmpShellConfig

    if (ele) {
      try {
        tmpShellConfig = JSON.parse(ele.textContent.toString()) || {}
        if (tmpShellConfig.alwaysReadConfigOnLoad !== undefined) {
          this.alwaysReadConfigOnLoad = tmpShellConfig.alwaysReadConfigOnLoad
        }
        if (tmpShellConfig.transitionContainsHeader !== undefined) {
          this.transitionContainsHeader = tmpShellConfig.transitionContainsHeader
        }
        if (tmpShellConfig.ignoreWarning !== undefined) {
          this.ignoreWarning = tmpShellConfig.ignoreWarning
        }
        if (!tmpShellConfig.routes) {
          !this.ignoreWarning && console.warn('检测到 MIP Shell 配置没有包含 `routes` 数组，MIP 将自动生成一条默认的路由配置。')
          tmpShellConfig.routes = [{
            pattern: '*',
            meta: DEFAULT_SHELL_CONFIG
          }]
        }
      } catch (e) {
        !this.ignoreWarning && console.warn('检测到格式非法的 MIP Shell 配置，MIP 将使用默认的配置代替。')
        tmpShellConfig = {
          routes: [{
            pattern: '*',
            meta: DEFAULT_SHELL_CONFIG
          }]
        }
      }
    } else {
      !this.ignoreWarning && console.warn('没有检测到 MIP Shell 配置，MIP 将使用默认的配置代替。')
      tmpShellConfig = {
        routes: [{
          pattern: '*',
          meta: DEFAULT_SHELL_CONFIG
        }]
      }
    }

    if (page.isRootPage) {
      tmpShellConfig.routes.forEach(route => {
        !this.ignoreWarning && checkRouteConfig(route)
        route.meta = fn.extend(true, {}, DEFAULT_SHELL_CONFIG, route.meta || {})
        route.regexp = convertPatternToRegexp(route.pattern || '*')

        // Get title from <title> tag
        if (!route.meta.header.title) {
          route.meta.header.title = (document.querySelector('title') || {}).innerHTML || ''
        }
      })
      this.processShellConfig(tmpShellConfig)

      window.MIP_SHELL_CONFIG = tmpShellConfig.routes
      // Append other DOM
      let children = this.element.children
      let otherDOM = [].slice.call(children).slice(1, children.length)
      if (otherDOM.length > 0) {
        otherDOM.forEach(dom => {
          dom.setAttribute('mip-shell-inner', '')
          document.body.appendChild(dom)
        })
      }
    } else {
      let pageId = page.pageId
      let pageMeta

      if (page.isCrossOrigin) {
        // If this iframe is a cross origin one
        // Read all config and save it in window.
        // Avoid find page meta from `window.parent`
        tmpShellConfig.routes.forEach(route => {
          !this.ignoreWarning && checkRouteConfig(route)
          route.meta = fn.extend(true, {}, DEFAULT_SHELL_CONFIG, route.meta || {})
          route.regexp = convertPatternToRegexp(route.pattern || '*')

          // Get title from <title> tag
          if (!route.meta.header.title) {
            route.meta.header.title = (document.querySelector('title') || {}).innerHTML || ''
          }

          // Find current page meta
          if (route.regexp.test(pageId)) {
            pageMeta = window.MIP_PAGE_META_CACHE[pageId] = route.meta
          }
        })

        window.MIP_SHELL_CONFIG = tmpShellConfig.routes
        window.MIP_PAGE_META_CACHE = Object.create(null)
      } else if (this.alwaysReadConfigOnLoad) {
        // If `alwaysReadConfigOnLoad` equals `true`
        // Read config in leaf pages and pick up the matched one. Send it to page for updating.
        pageMeta = DEFAULT_SHELL_CONFIG
        for (let i = 0; i < tmpShellConfig.routes.length; i++) {
          let config = tmpShellConfig.routes[i]
          !this.ignoreWarning && checkRouteConfig(config)
          config.regexp = convertPatternToRegexp(config.pattern || '*')

          // Only process matched page meta
          if (config.regexp.test(pageId)) {
            config.meta = fn.extend(true, {}, DEFAULT_SHELL_CONFIG, config.meta || {})
            // get title from <title> tag
            if (!config.meta.header.title) {
              config.meta.header.title = (document.querySelector('title') || {}).innerHTML || ''
            }

            this.processShellConfigInLeaf(tmpShellConfig, i)

            pageMeta = window.parent.MIP_PAGE_META_CACHE[pageId] = config.meta
            break
          }
        }
      }

      if (!pageMeta) {
        pageMeta = this.findMetaByPageId(pageId)
      }

      page.emitCustomEvent(window.parent, page.isCrossOrigin, {
        name: 'mipShellEvents',
        data: {
          type: 'updateShell',
          data: {pageMeta}
        }
      })
    }
  }

  prerenderAllowed () {
    return true
  }

  firstInviewCallback () {
    this.currentPageMeta = this.findMetaByPageId(page.pageId)

    if (page.isRootPage) {
      page.pageMeta = this.currentPageMeta
      this.initShell()
      this.initRouter()
      this.bindRootEvents()
    }

    this.bindAllEvents()
  }

  disconnectedCallback () {
    if (page.isRootPage) {
      this.unbindHeaderEvents()
    }
  }

  // ===================== Only Root Page Functions =====================

  /**
   * Create belows:
   * 1. Shell wrapper
   * 2. Header
   * 3. Button wrapper & mask
   * 4. Page mask (mainly used to cover header)
   */
  initShell () {
    // Shell wrapper
    this.$wrapper = document.createElement('mip-fixed')
    this.$wrapper.setAttribute('type', 'top')
    this.$wrapper.classList.add('mip-shell-header-wrapper')
    if (this.currentPageMeta.header && this.currentPageMeta.header.show) {
      isHeaderShown = true
    } else {
      this.$wrapper.classList.add('hide')
      isHeaderShown = false
    }

    // Header
    this.$el = document.createElement('div')
    this.$el.classList.add('mip-shell-header', 'transition')
    this.renderHeader(this.$el)
    this.$wrapper.insertBefore(this.$el, this.$wrapper.firstChild)

    document.body.insertBefore(this.$wrapper, document.body.firstChild)

    // Other sync parts
    this.renderOtherParts()

    // Button wrapper & mask
    let buttonGroup = this.currentPageMeta.header.buttonGroup
    let {mask, buttonWrapper} = createMoreButtonWrapper(buttonGroup)
    this.$buttonMask = mask
    this.$buttonWrapper = buttonWrapper

    // Page mask
    this.$pageMask = createPageMask()

    // Loading
    this.$loading = createLoading(this.currentPageMeta)

    setTimeout(() => {
      // Other async parts
      this.renderOtherPartsAsync()
    }, 0)
  }

  initRouter () {
    // Init router
    let router = new Router()
    router.init()
    router.listen(this.render.bind(this))
    this.router = router

    // Handle events emitted by SF
    // DELETE ME
    viewer.onMessage('changeState', ({url}) => {
      router.replace(makeCacheUrl(url, 'url', true))
    })
    viewer.onMessage(OUTER_MESSAGE_CHANGE_STATE, ({url}) => {
      router.replace(makeCacheUrl(url, 'url', true))
    })

    window.MIP_SHELL_OPTION = {
      allowTransition: false,
      isForward: true
    }

    this.messageHandlers.push((type, data) => {
      // Deal message and operate router
      if (type === MESSAGE_ROUTER_PUSH) {
        if (data.options.allowTransition) {
          window.MIP_SHELL_OPTION.allowTransition = true
        }
        router.push(data.route)
      } else if (type === MESSAGE_ROUTER_REPLACE) {
        if (data.options.allowTransition) {
          window.MIP_SHELL_OPTION.allowTransition = true
        }
        router.replace(data.route)
      } else if (type === MESSAGE_ROUTER_BACK) {
        window.MIP_SHELL_OPTION.allowTransition = true
        window.MIP_SHELL_OPTION.isForward = false
        router.back()
      } else if (type === MESSAGE_ROUTER_FORWARD) {
        window.MIP_SHELL_OPTION.allowTransition = true
        router.forward()
      }
    })
  }

  bindRootEvents () {
    this.currentViewportHeight = viewport.getHeight()
    this.currentViewportWidth = viewport.getWidth()

    // Receive and resend message
    this.messageHandlers.push((type, data) => {
      if (type === MESSAGE_BROADCAST_EVENT) {
        // Broadcast Event
        page.broadcastCustomEvent(data)
      } else if (type === MESSAGE_PAGE_RESIZE) {
        this.resizeAllPages()
      }
    })

    // update every iframe's height when viewport resizing
    let resizeHandler = () => {
      // only when screen gets spinned
      let currentViewportHeight = viewport.getHeight()
      if (this.currentViewportHeight !== currentViewportHeight) {
        this.currentViewportWidth = viewport.getWidth()
        this.currentViewportHeight = currentViewportHeight
        this.resizeAllPages()
      }
    }
    // viewport.on('resize', resizeHandler)
    setInterval(resizeHandler, 250)

    // Listen events
    window.addEventListener('mipShellEvents', e => {
      let {type, data} = e.detail[0]

      switch (type) {
        case 'updateShell':
          this.refreshShell({pageMeta: data.pageMeta})
          break
        case 'slide':
          this.slideHeader(data.direction)
          break
        case 'togglePageMask':
          this.togglePageMask(data.toggle, data.options)
          break
        case 'toggleDropdown':
          this.toggleDropdown(data.toggle)
          break
        case 'toggleTransition':
          this.toggleTransition(data.toggle)
          break
      }
    })

    // Bind DOM events
    this.bindHeaderEvents()

    window.MIP.viewer.eventAction.execute('active', this.element, {})
  }

  /**
   * Render with current route
   *
   * @param {Route} from route
   * @param {Route} to route
   */
  render (from, to) {
    render(this, from, to)
  }

  /**
   * Render shell header
   * @param {HTMLElement} container container of shell header
   */
  renderHeader (container) {
    renderHeader(this, container)
  }

  /**
   * Save scroll position in root page
   */
  saveScrollPosition () {
    this.rootPageScrollPosition = viewport.getScrollTop()
  }

  /**
   * Restore scroll position in root page
   */
  restoreScrollPosition () {
    viewport.setScrollTop(this.rootPageScrollPosition)
  }

  /**
   * Handle resize event
   */
  resizeAllPages () {
    // 1.set every page's iframe
    Array.prototype.slice.call(document.querySelectorAll('.mip-page__iframe')).forEach($el => {
      $el.style.height = `${this.currentViewportHeight}px`
    })
    // 2.notify <mip-iframe> in every page
    page.broadcastCustomEvent({
      name: CUSTOM_EVENT_RESIZE_PAGE,
      data: {
        height: this.currentViewportHeight
      }
    })
  }

  bindHeaderEvents () {
    bindHeaderEvents(this)
  }

  unbindHeaderEvents () {
    unbindHeaderEvents(this)
  }

  handleClickHeaderButton (buttonName) {
    if (buttonName === 'back') {
      // **Important** only allow transition happens when Back btn & <a> clicked
      window.MIP_SHELL_OPTION.allowTransition = true
      window.MIP_SHELL_OPTION.isForward = false
      page.back()
    } else if (buttonName === 'more') {
      this.toggleDropdown(true)
    } else if (buttonName === 'close') {
      window.MIP.viewer.sendMessage(OUTER_MESSAGE_CLOSE)
    } else if (buttonName === 'cancel') {
      this.toggleDropdown(false)
    }

    this.handleShellCustomButton(buttonName)

    page.emitEventInCurrentPage({
      name: `shell-header:click-${buttonName}`
    })
  }

  /**
   *
   * @param {Object} options
   * @param {Object} pageMeta Updated pageMeta
   * @param {string} pageId Current pageId. If `pageMeta` is not provided, `pageId` will be used to find pageMeta
   * @param {boolean} asyncRefresh `true` when `refreshShell` invoked in `processShellConfig` in async mode
   */
  refreshShell ({pageMeta, pageId, asyncRefresh} = {}) {
    // Unbind header events
    this.unbindHeaderEvents()

    if (pageId) {
      pageMeta = this.findMetaByPageId(pageId)
    }
    this.currentPageMeta = pageMeta

    if (!(pageMeta.header && pageMeta.header.show)) {
      this.$wrapper.classList.add('hide')
      css(this.$loading, 'display', 'none')
      if (!this.transitionContainsHeader) {
        let headerLogoTitle = this.$el.querySelector('.mip-shell-header-logo-title')
        headerLogoTitle && headerLogoTitle.classList.remove('fade-out')
        toggleFadeHeader(false)
      }
      return
    }

    // Refresh header
    this.toggleTransition(false)
    /* eslint-disable no-unused-expressions */
    window.innerHeight
    this.slideHeader('down')
    window.innerHeight
    /* eslint-enable no-unused-expressions */
    this.toggleTransition(true)
    if (asyncRefresh) {
      // In async mode: (Invoked from `processShellConfig` by user)
      // 1. Render fade header with updated pageMeta
      // 2. Show fade header with trnasition (fade)
      // 3. Wait for transition ending
      // 4. Update real header (along with otherParts, buttonWrapper, buttonMask)
      // 5. Hide fade header
      // 6. Bind header events
      toggleFadeHeader(true, pageMeta)
      setTimeout(() => {
        this.renderHeader(this.$el)
        toggleFadeHeader(false)
        // Rebind header events
        this.bindHeaderEvents()
      }, 350)
    } else {
      // In sync mode: (Invoked from event 'updateShell' by MIP Page)
      // 1. Update real header (along with otherParts, buttonWrapper, buttonMask)
      // 2. Bind header events
      // 3. Wait for transition ending
      // 4. Hide fade header (Fade header was shown in MIP Page)
      this.renderHeader(this.$el)
      css(this.$loading, 'display', 'none')
    }

    this.updateOtherParts()

    // Button wrapper & mask
    let buttonGroup = pageMeta.header.buttonGroup
    let {mask, buttonWrapper} = createMoreButtonWrapper(buttonGroup, {update: true})
    this.$buttonMask = mask
    this.$buttonWrapper = buttonWrapper

    this.$wrapper.classList.remove('hide')

    if (!asyncRefresh) {
      if (!this.transitionContainsHeader) {
        let headerLogoTitle = this.$el.querySelector('.mip-shell-header-logo-title')
        headerLogoTitle && headerLogoTitle.classList.remove('fade-out')
        toggleFadeHeader(false)
      }

      // Rebind header events
      this.bindHeaderEvents()
    }
  }

  slideHeader (direction) {
    if (this.pauseBouncyHeader) {
      return
    }
    if (direction === 'up') {
      this.$el.classList.add('slide-up')
    } else {
      this.$el.classList.remove('slide-up')
    }
  }

  /**
   * Toggle more button wrapper
   *
   * @param {boolean} toggle display or not
   */
  toggleDropdown (toggle) {
    toggleInner(this.$buttonMask, toggle)
    toggleInner(this.$buttonWrapper, toggle, {transitionName: 'slide'})
  }

  /**
   * Toggle display of page mask
   * Mainly used to cover header in iframes
   *
   * @param {boolean} toggle display or not
   * @param {Object} options
   * @param {boolean} options.skipTransition show result without transition
   */
  togglePageMask (toggle, {skipTransition, extraClass} = {}) {
    if (!isHeaderShown) {
      return
    }

    if (extraClass) {
      toggle ? this.$pageMask.classList.add(extraClass) : this.$pageMask.classList.remove(extraClass)
    }

    toggleInner(this.$pageMask, toggle, {skipTransition})
  }

  /**
   * Toggle something
   *
   * @param {HTMLElement} dom
   * @param {boolean} toggle
   * @param {Object} options
   * @param {boolean} options.skipTransition Show result without transition
   * @param {boolean} options.transitionName Transition name. Defaults to 'fade'
   */
  toggleDOM (dom, toggle, options) {
    toggleInner(dom, toggle, options)
  }

  /**
   * Toggle header transition class
   * Remove transition during page switching
   *
   * @param {boolean} toggle
   */
  toggleTransition (toggle) {
    toggle ? this.$el.classList.add('transition') : this.$el.classList.remove('transition')
  }

  // ===================== All Page Functions =====================
  bindAllEvents () {
    // Don't let browser restore scroll position.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    let {show: showHeader, bouncy} = this.currentPageMeta.header
    // Set `padding-top` on scroller
    if (showHeader) {
      document.body.classList.add('with-header')
    }

    if (bouncy) {
      page.setupBouncyHeader()
    }

    // Cross origin
    this.messageHandlers.push((type, data) => {
      if (type === MESSAGE_CROSS_ORIGIN) {
        customEmit(window, data.name, data.data)
      }
    })

    window.addEventListener('message', e => {
      try {
        this.messageHandlers.forEach(handler => {
          handler.call(this, e.data.type, e.data.data || {})
        })
      } catch (e) {
        // Message sent from SF will cause cross domain error when reading e.source.location
        // Just ignore these messages.
      }
    }, false)
  }

  updateShellConfig (newShellConfig) {
    if (page.isRootPage) {
      window.MIP_SHELL_CONFIG = newShellConfig.routes
      window.MIP_PAGE_META_CACHE = Object.create(null)
      page.notifyRootPage({
        type: 'set-mip-shell-config',
        data: {
          shellConfig: newShellConfig.routes,
          update: true
        }
      })
    }
  }

  /**
   * find route.meta by pageId
   *
   * @param {string} pageId pageId
   * @return {Object} meta object
   */
  findMetaByPageId (pageId) {
    let target
    if (!page.isRootPage && !page.isCrossOrigin) {
      target = window.parent
    } else {
      target = window
    }

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

    console.warn('Cannot find MIP Shell Config for current page. Use default instead.')
    return Object.assign({}, DEFAULT_SHELL_CONFIG)
  }

  // ===================== Interfaces =====================
  processShellConfig (shellConfig) {
    // Change shell config
    // E.g. `shellConfig.routes.forEach(route => route.meta.header.buttonGroup = [])` forces empty buttons
  }

  processShellConfigInLeaf (shellConfig, matchIndex) {
    // Change shell config in leaf page
    // E.g. `shellConfig.routes[matchIndex].meta.header.bouncy = false` disables bouncy feature
    // Only works when `alwaysReadConfigOnLoad` equals `true`
  }

  handleShellCustomButton (buttonName) {
    // Handle click on custom button
    // The only param `butonName` equals attribute values of `data-button-name`
    // E.g. click on `<div mip-header-btn data-button-name="hello"></div>` will pass `'hello'` as buttonName
  }

  renderOtherParts () {
    // Render other shell parts (except header)
    // Use `this.currentPageMeta` to get page config
    // E.g. footer, sidebar
  }

  renderOtherPartsAsync () {
    // Render other shell parts (async version for performance's sake)
    // Use `this.currentPageMeta` to get page config
    // E.g. footer, sidebar
  }

  updateOtherParts () {
    // Update other shell parts (except header)
    // Use `this.currentPageMeta` to get page config
    // E.g. footer, sidebar
  }

  showHeaderCloseButton () {
    // Whether show close button in header
    // Only effective when window.MIP.standalone = false
    return true
  }

  beforeSwitchPage (options) {
    // Operations before switch page transition
    // params `options` contains:
    // targetPageId
    // targetPageMeta
    // sourcePageId
    // sourcePageMeta
    // newPage, true/false, whether a new frame should be created
    // isForward, true/false, indicates transition direction
  }

  afterSwitchPage (options) {
    // Operations before switch page transition
    // params `options` contains:
    // targetPageId
    // targetPageMeta
    // sourcePageId
    // sourcePageMeta
    // newPage, true/false, whether a new frame should be created
    // isForward, true/false, indicates transition direction
  }
}

export default MipShell
