/**
 * @file MIP Shell Base
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css'
import CustomElement from '../../custom-element'
import fn from '../../util/fn'
import event from '../../util/dom/event'
import {isPortrait} from '../../page/util/feature-detect'
import {
  convertPatternToRegexp,
  createMoreButtonWrapper,
  createPageMask,
  toggleInner
} from './util'

const DEFAULT_SHELL_CONFIG = {
  header: {
    title: '',
    logo: '',
    buttonGroup: [],
    show: false,
    bouncy: true
  },
  view: {
    isIndex: false
  }
}

let page = null
window.MIP_PAGE_META_CACHE = Object.create(null)
window.MIP_SHELL_CONFIG = null

class MipShell extends CustomElement {
  // ===================== CustomElement LifeCycle =====================
  constructor (...args) {
    super(...args)

    // If true, always load configures from `<mip-shell>` and overwrite shellConfig when opening new page
    this.alwaysReadConfigOnLoad = true

    // If true, page switching transition contains header
    this.transitionContainsHeader = true
  }

  build () {
    page = window.MIP.viewer.page

    page.notifyRootPage({
      type: 'sync-page-config',
      data: {
        transitionContainsHeader: this.transitionContainsHeader
      }
    })

    // Read config
    let ele = this.element.querySelector('script[type="application/json"]')

    if (!ele) {
      return
    }
    let tmpShellConfig
    try {
      tmpShellConfig = JSON.parse(ele.textContent.toString()) || {}
      if (!tmpShellConfig.routes) {
        tmpShellConfig.routes = []
      }
    } catch (e) {
      tmpShellConfig = {routes: []}
    }

    if (page.isRootPage) {
      tmpShellConfig.routes.forEach(route => {
        route.meta = fn.extend(true, {}, DEFAULT_SHELL_CONFIG, route.meta || {})
        route.regexp = convertPatternToRegexp(route.pattern || '*')

        // Get title from <title> tag
        if (!route.meta.header.title) {
          route.meta.header.title = (document.querySelector('title') || {}).innerHTML || ''
        }
      })
      this.processShellConfig(tmpShellConfig)

      window.MIP_SHELL_CONFIG = tmpShellConfig.routes
      page.notifyRootPage({
        type: 'set-mip-shell-config',
        data: {
          shellConfig: tmpShellConfig.routes
        }
      })
    } else {
      let pageId = page.pageId
      let pageMeta

      if (page.isCrossOrigin) {
        // If this iframe is a cross origin one
        // Read all config and save it in window.
        // Avoid find page meta from `window.parent`
        tmpShellConfig.routes.forEach(route => {
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
      } else if (this.alwaysReadConfigOnLoad) {
        // If `alwaysReadConfigOnLoad` equals `true`
        // Read config in leaf pages and pick up the matched one. Send it to page for updating.
        pageMeta = DEFAULT_SHELL_CONFIG
        for (let i = 0; i < tmpShellConfig.routes.length; i++) {
          let config = tmpShellConfig.routes[i]
          config.regexp = convertPatternToRegexp(config.pattern || '*')

          // Only process matched page meta
          if (config.regexp.test(pageId)) {
            config.meta = fn.extend(true, {}, DEFAULT_SHELL_CONFIG, config.meta || {})
            // get title from <title> tag
            if (!config.meta.header.title) {
              config.meta.header.title = (document.querySelector('title') || {}).innerHTML || ''
            }

            // this.processShellConfig([config.meta])
            pageMeta = window.MIP_PAGE_META_CACHE[pageId] = config.meta
            break
          }
        }
      }

      page.notifyRootPage({
        type: 'update-mip-shell-config',
        data: {
          pageId,
          pageMeta
        }
      })

      if (pageMeta && pageMeta.header.bouncy) {
        page.setupBouncyHeader()
      }
    }
  }

  prerenderAllowed () {
    return true
  }

  firstInviewCallback () {
    this.currentPageMeta = this.findMetaByPageId(page.pageId)

    if (page.isRootPage) {
      this.initShell()
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
    if (!(this.currentPageMeta.header && this.currentPageMeta.header.show)) {
      this.$wrapper.classList.add('hide')
    }

    // Header
    this.$el = document.createElement('div')
    this.$el.classList.add('mip-shell-header', 'mip-border', 'mip-border-bottom', 'transition')
    this.renderHeader(this.$el)
    this.$wrapper.insertBefore(this.$el, this.$wrapper.firstChild)

    document.body.insertBefore(this.$wrapper, document.body.firstChild)

    // Button wrapper & mask
    let buttonGroup = this.currentPageMeta.header.buttonGroup
    let {mask, buttonWrapper} = createMoreButtonWrapper(buttonGroup)
    this.$buttonMask = mask
    this.$buttonWrapper = buttonWrapper

    // Page mask
    this.$pageMask = createPageMask()

    // Other parts
    this.renderOtherParts()

    window.MIP.viewer.fixedElement.init()
  }

  renderHeader (container) {
    let pageMeta = this.currentPageMeta
    let {
      buttonGroup,
      title,
      logo,
      color = '#000000',
      borderColor,
      backgroundColor = '#ffffff'
    } = pageMeta.header
    let showBackIcon = !pageMeta.view.isIndex

    let headerHTML = `
      ${showBackIcon ? `<span class="back-button" mip-header-btn
        data-button-name="back">
        <svg t="1530857979993" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3173"
          xmlns:xlink="http://www.w3.org/1999/xlink">
          <path  fill="currentColor" d="M348.949333 511.829333L774.250667 105.728C783.978667 96 789.333333 83.712 789.333333 71.104c0-12.629333-5.354667-24.917333-15.082666-34.645333-9.728-9.728-22.037333-15.082667-34.645334-15.082667-12.586667 0-24.917333 5.333333-34.624 15.082667L249.557333 471.616A62.570667 62.570667 0 0 0 234.666667 512c0 10.410667 1.130667 25.408 14.890666 40.042667l455.424 435.605333c9.706667 9.728 22.016 15.082667 34.624 15.082667s24.917333-5.354667 34.645334-15.082667c9.728-9.728 15.082667-22.037333 15.082666-34.645333 0-12.608-5.354667-24.917333-15.082666-34.645334L348.949333 511.829333z"
            p-id="3174"></path>
        </svg>
      </span>` : ''}
      <div class="mip-shell-header-logo-title">
        ${logo ? `<img class="mip-shell-header-logo" src="${logo}">` : ''}
        <span class="mip-shell-header-title">${title}</span>
      </div>
    `

    let moreFlag = Array.isArray(buttonGroup) && buttonGroup.length > 0
    let closeFlag = !window.MIP.standalone && this.showHeaderCloseButton()

    if (moreFlag && closeFlag) {
      // more & close
      headerHTML += `
        <div class="mip-shell-header-button-group">
          <div class="button more" mip-header-btn data-button-name="more">
            <svg t="1530857985972" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3393"
              xmlns:xlink="http://www.w3.org/1999/xlink">
              <path d="M128 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3394" fill="currentColor"></path>
              <path d="M512 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3395" fill="currentColor"></path>
              <path d="M896 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3396" fill="currentColor"></path>
            </svg>
          </div>
          <div class="split"></div>
          <div class="button close" mip-header-btn data-button-name="close">
            <svg t="1530857971603" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2953"
              xmlns:xlink="http://www.w3.org/1999/xlink">
              <path  fill="currentColor" d="M586.026667 533.248l208.789333-208.576c9.856-8.874667 15.488-21.248 15.850667-34.858667a53.717333 53.717333 0 0 0-15.829334-39.146666 48.042667 48.042667 0 0 0-36.224-15.872c-14.165333 0-27.584 5.632-37.802666 15.850666L512 459.221333l-208.789333-208.576a48.042667 48.042667 0 0 0-36.245334-15.850666c-14.144 0-27.562667 5.632-37.781333 15.850666A48.085333 48.085333 0 0 0 213.333333 285.504a53.717333 53.717333 0 0 0 15.850667 39.168l208.789333 208.576-208.576 208.853333a48.085333 48.085333 0 0 0-15.850666 34.88 53.717333 53.717333 0 0 0 15.850666 39.146667c9.194667 10.24 22.058667 15.872 36.224 15.872 14.144 0 27.562667-5.632 37.802667-15.850667L512 607.274667l208.597333 208.853333c9.216 10.24 22.08 15.872 36.224 15.872s27.584-5.632 37.802667-15.850667c9.856-8.874667 15.488-21.269333 15.850667-34.88a53.717333 53.717333 0 0 0-15.850667-39.146666l-208.597333-208.853334z"
                p-id="2954"></path>
            </svg>
          </div>
        </div>
     `
    } else if (moreFlag && !closeFlag) {
      // only more
      headerHTML += `
        <div class="mip-shell-header-button-group-standalone more" mip-header-btn data-button-name="more">
          <svg t="1530857985972" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3393"
            xmlns:xlink="http://www.w3.org/1999/xlink">
            <path d="M128 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3394" fill="currentColor"></path>
            <path d="M512 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3395" fill="currentColor"></path>
            <path d="M896 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3396" fill="currentColor"></path>
          </svg>
        </div>
     `
    } else if (!moreFlag && closeFlag) {
      // only close
      headerHTML += `
        <div class="mip-shell-header-button-group-standalone">
          <div class="button close" mip-header-btn data-button-name="close">
            <svg t="1530857971603" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2953"
              xmlns:xlink="http://www.w3.org/1999/xlink">
              <path  fill="currentColor" d="M586.026667 533.248l208.789333-208.576c9.856-8.874667 15.488-21.248 15.850667-34.858667a53.717333 53.717333 0 0 0-15.829334-39.146666 48.042667 48.042667 0 0 0-36.224-15.872c-14.165333 0-27.584 5.632-37.802666 15.850666L512 459.221333l-208.789333-208.576a48.042667 48.042667 0 0 0-36.245334-15.850666c-14.144 0-27.562667 5.632-37.781333 15.850666A48.085333 48.085333 0 0 0 213.333333 285.504a53.717333 53.717333 0 0 0 15.850667 39.168l208.789333 208.576-208.576 208.853333a48.085333 48.085333 0 0 0-15.850666 34.88 53.717333 53.717333 0 0 0 15.850666 39.146667c9.194667 10.24 22.058667 15.872 36.224 15.872 14.144 0 27.562667-5.632 37.802667-15.850667L512 607.274667l208.597333 208.853333c9.216 10.24 22.08 15.872 36.224 15.872s27.584-5.632 37.802667-15.850667c9.856-8.874667 15.488-21.269333 15.850667-34.88a53.717333 53.717333 0 0 0-15.850667-39.146666l-208.597333-208.853334z"
                p-id="2954"></path>
            </svg>
          </div>
        </div>
      `
    }

    container.innerHTML = headerHTML

    // Set color & borderColor & backgroundColor
    css(container, 'background-color', backgroundColor)
    css(container.querySelectorAll('svg'), 'fill', color)
    css(container.querySelector('.mip-shell-header-title'), 'color', color)
    if (!borderColor) {
      container.classList.add('mip-border', 'mip-border-bottom')
      css(container, 'border-bottom', '0')
      css(container, 'box-sizing', 'content-box')
      borderColor = '#e1e1e1'
    } else {
      container.classList.remove('mip-border', 'mip-border-bottom')
      css(container, 'border-bottom', `1px solid ${borderColor}`)
      css(container, 'box-sizing', 'border-box')
    }
    css(container.querySelector('.mip-shell-header-logo'), 'border-color', borderColor)
    css(container.querySelector('.mip-shell-header-button-group'), 'border-color', borderColor)
    css(container.querySelector('.mip-shell-header-button-group .split'), 'background-color', borderColor)
  }

  bindRootEvents () {
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

    this.bindHeaderEvents()
  }

  bindHeaderEvents () {
    let me = this
    // Delegate header
    this.headerEventHandler = event.delegate(this.$el, '[mip-header-btn]', 'click', function (e) {
      let buttonName = this.dataset.buttonName
      me.handleClickHeaderButton(buttonName)
    })

    // Delegate dropdown button
    this.buttonEventHandler = event.delegate(this.$buttonWrapper, '[mip-header-btn]', 'click', function (e) {
      let buttonName = this.dataset.buttonName
      me.handleClickHeaderButton(buttonName)
    })

    if (this.$buttonMask) {
      this.$buttonMask.onclick = () => this.toggleDropdown(false)
    }
  }

  unbindHeaderEvents () {
    if (this.headerEventHandler) {
      this.headerEventHandler()
      this.headerEventHandler = undefined
    }

    if (this.buttonEventHandler) {
      this.buttonEventHandler()
      this.buttonEventHandler = undefined
    }
  }

  handleClickHeaderButton (buttonName) {
    if (buttonName === 'back') {
      // **Important** only allow transition happens when Back btn & <a> clicked
      if (isPortrait()) {
        page.allowTransition = true
      }
      page.direction = 'back'
      page.router.back()
    } else if (buttonName === 'more') {
      this.toggleDropdown(true)
    } else if (buttonName === 'close') {
      window.MIP.viewer.sendMessage('close')
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
      return
    }

    // Refresh header
    this.slideHeader('down')
    if (asyncRefresh) {
      // In async mode: (Invoked from `processShellConfig` by user)
      // 1. Render fade header with updated pageMeta
      // 2. Show fade header with trnasition (fade)
      // 3. Wait for transition ending
      // 4. Update real header (along with otherParts, buttonWrapper, buttonMask)
      // 5. Hide fade header
      // 6. Bind header events
      page.toggleFadeHeader(true, pageMeta)
      setTimeout(() => {
        this.renderHeader(this.$el)
        page.toggleFadeHeader(false)
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
      }

      setTimeout(() => {
        page.toggleFadeHeader(false)
        // css(document.querySelector('.mip-page-fade-header-wrapper'), 'display', 'none')
      }, 350)

      // Rebind header events
      this.bindHeaderEvents()
    }
  }

  slideHeader (direction) {
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
  togglePageMask (toggle, {skipTransition} = {}) {
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
    let {show: showHeader} = this.currentPageMeta.header
    // Set `padding-top` on scroller
    if (showHeader) {
      document.body.classList.add('with-header')
    }
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

    return Object.assign({}, DEFAULT_SHELL_CONFIG)
  }

  // ===================== Interfaces =====================
  processShellConfig (shellConfig) {
    // Change shell config
    // E.g. `routeConfig.header.buttonGroup = []` forces empty buttons
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
}

export default MipShell
