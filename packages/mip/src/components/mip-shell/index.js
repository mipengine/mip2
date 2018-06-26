/**
 * @file MIP Shell Base
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css'
import CustomElement from '../../custom-element'
import fn from '../../util/fn'
import viewport from '../../viewport'
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

        // get title from <title> tag
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
      if (this.alwaysReadConfigOnLoad) {
        pageMeta = DEFAULT_SHELL_CONFIG
        for (let i = 0; i < tmpShellConfig.routes.length; i++) {
          let config = tmpShellConfig.routes[i]
          config.regexp = convertPatternToRegexp(config.pattern || '*')
          if (config.regexp.test(pageId)) {
            config.meta = fn.extend(true, {}, DEFAULT_SHELL_CONFIG, config.meta || {})
            // get title from <title> tag
            if (!config.meta.header.title) {
              config.meta.header.title = (document.querySelector('title') || {}).innerHTML || ''
            }

            this.processShellConfig([config.meta])
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
    this.$el.innerHTML = this.renderHeader()
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

  renderHeader () {
    let pageMeta = this.currentPageMeta
    let {buttonGroup, title, logo} = pageMeta.header
    let showBackIcon = !pageMeta.view.isIndex

    let headerHTML = `
      ${showBackIcon ? `<span class="back-button" mip-header-btn
        data-button-name="back">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M769.405 977.483a68.544 68.544 0 0 1-98.121 0L254.693 553.679c-27.173-27.568-27.173-72.231 0-99.899L671.185 29.976c13.537-13.734 31.324-20.652 49.109-20.652s35.572 6.917 49.109 20.652c27.173 27.568 27.173 72.331 0 99.899L401.921 503.681l367.482 373.904c27.074 27.568 27.074 72.231 0 99.899z"/></svg>
      </span>` : ''}
      <div class="mip-shell-header-logo-title">
        ${logo ? `<img class="mip-shell-header-logo" src="${logo}">` : ''}
        <span class="mip-shell-header-title">${title}</span>
      </div>
    `

    let moreFlag = Array.isArray(buttonGroup) && buttonGroup.length > 0
    if (window.MIP.standalone) {
      if (moreFlag) {
        // only more
        headerHTML += `
          <div class="mip-shell-header-button-group-standalone more" mip-header-btn data-button-name="more">
            <svg t="1529487280740" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6294" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17"><path d="M64 512a85.333333 85.333333 0 1 1 170.666667 0 85.333333 85.333333 0 0 1-170.666667 0zM512 597.333333a85.333333 85.333333 0 1 1 0-170.666666 85.333333 85.333333 0 0 1 0 170.666666zM789.333333 512a85.333333 85.333333 0 1 1 170.666667 0 85.333333 85.333333 0 0 1-170.666667 0z" fill="#555555" p-id="6295"></path></svg>
          </div>
        `
      }
    } else {
      if (moreFlag) {
        // more & close
        headerHTML += `
          <div class="mip-shell-header-button-group">
            <div class="button more" mip-header-btn data-button-name="more">
              <svg t="1529487280740" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6294" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17"><path d="M64 512a85.333333 85.333333 0 1 1 170.666667 0 85.333333 85.333333 0 0 1-170.666667 0zM512 597.333333a85.333333 85.333333 0 1 1 0-170.666666 85.333333 85.333333 0 0 1 0 170.666666zM789.333333 512a85.333333 85.333333 0 1 1 170.666667 0 85.333333 85.333333 0 0 1-170.666667 0z" fill="#555555" p-id="6295"></path></svg>
            </div>
            <div class="split"></div>
            <div class="button close" mip-header-btn data-button-name="close">
              <svg t="1529487311635" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6410" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17"><path d="M557.482667 512L822.613333 246.869333a32.149333 32.149333 0 0 0-45.44-45.44L512 466.517333 246.890667 201.408a32.149333 32.149333 0 1 0-45.44 45.44L466.56 512 201.429333 777.130667a32.149333 32.149333 0 0 0 45.461334 45.44l265.130666-265.109334L777.173333 822.592a32.149333 32.149333 0 1 0 45.461334-45.44L557.482667 512z" fill="#555555" p-id="6411"></path></svg>
            </div>
          </div>
        `
      } else {
        // only close
        headerHTML += `
          <div class="mip-shell-header-button-group-standalone">
            <div class="button close" mip-header-btn data-button-name="close">
              <svg t="1529487311635" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6410" xmlns:xlink="http://www.w3.org/1999/xlink" width="17" height="17"><path d="M557.482667 512L822.613333 246.869333a32.149333 32.149333 0 0 0-45.44-45.44L512 466.517333 246.890667 201.408a32.149333 32.149333 0 1 0-45.44 45.44L466.56 512 201.429333 777.130667a32.149333 32.149333 0 0 0 45.461334 45.44l265.130666-265.109334L777.173333 822.592a32.149333 32.149333 0 1 0 45.461334-45.44L557.482667 512z" fill="#555555" p-id="6411"></path></svg>
            </div>
          </div>
        `
      }
    }

    return headerHTML
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
      // SF can help to navigate by 'changeState' when standalone = false
      if (window.MIP.standalone) {
        window.MIP_ROUTER.go(-1)
      }
      window.MIP.viewer.sendMessage('historyNavigate', {step: -1})
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

  refreshShell ({pageMeta, pageId} = {}) {
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
    this.$el.innerHTML = this.renderHeader()

    this.updateOtherParts()

    // Button wrapper & mask
    let buttonGroup = pageMeta.header.buttonGroup
    let {mask, buttonWrapper} = createMoreButtonWrapper(buttonGroup, {update: true})
    this.$buttonMask = mask
    this.$buttonWrapper = buttonWrapper

    this.$wrapper.classList.remove('hide')
    this.$el.querySelector('.mip-shell-header-logo-title').classList.remove('fade-out')
    setTimeout(() => {
      css(document.querySelector('.mip-page-fade-header-wrapper'), 'display', 'none')
    }, 350)

    // Rebind header events
    this.bindHeaderEvents()
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

    if (toggle) {
      this.$buttonWrapper.classList.add('show')
    } else {
      this.$buttonWrapper.classList.remove('show')
    }
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
    toggleInner(this.$pageMask, toggle, skipTransition)
  }

  /**
   * Toggle something
   *
   * @param {HTMLElement} dom
   * @param {boolean} toggle
   */
  toggleDOM (dom, toggle) {
    toggleInner(dom, toggle)
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
      if (viewport.scroller === window) {
        document.body.classList.add('with-header')
      } else {
        viewport.scroller.classList.add('with-header')
      }
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
    // TODO else
  }

  /**
   * find route.meta by pageId
   *
   * @param {string} pageId pageId
   * @return {Object} meta object
   */
  findMetaByPageId (pageId) {
    let target = window.MIP.viewer.page.isRootPage ? window : window.parent
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
  processShellConfig (routeConfig) {
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
}

export default MipShell
