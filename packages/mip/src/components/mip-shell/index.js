/**
 * @file MIP Shell Base
 * @author wangyisheng@baidu.com (wangyisheng)
 */

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
  build () {
    page = window.MIP.viewer.page

    // Read config
    let ele = this.element.querySelector('script[type="application/json"]')

    if (!ele) {
      return
    }
    let tmpShellConfig
    try {
      tmpShellConfig = JSON.parse(ele.textContent.toString()).routes || []
    } catch (e) {
      tmpShellConfig = []
    }

    if (page.isRootPage) {
      tmpShellConfig.forEach(route => {
        route.meta = fn.extend(true, {}, DEFAULT_SHELL_CONFIG, route.meta || {})
        route.regexp = convertPatternToRegexp(route.pattern || '*')

        // get title from <title> tag
        if (!route.meta.header.title) {
          route.meta.header.title = (document.querySelector('title') || {}).innerHTML || ''
        }
      })

      this.processShellConfig(tmpShellConfig)

      window.MIP_SHELL_CONFIG = tmpShellConfig
      page.notifyRootPage({
        type: 'set-mip-shell-config',
        data: {
          shellConfig: tmpShellConfig
        }
      })
    } else {
      let pageId = page.pageId
      let pageMeta
      if (this.alwaysRefreshOnLoad()) {
        pageMeta = DEFAULT_SHELL_CONFIG
        for (let i = 0; i < tmpShellConfig.length; i++) {
          let config = tmpShellConfig[i]
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

    // Button wrapper & mask
    let buttonGroup = this.currentPageMeta.header.buttonGroup
    let {mask, buttonWrapper} = createMoreButtonWrapper(buttonGroup)
    this.$buttonMask = mask
    this.$buttonWrapper = buttonWrapper

    // Page mask
    this.$pageMask = createPageMask()

    document.body.insertBefore(this.$wrapper, document.body.firstChild)
  }

  renderHeader (pageMeta) {
    if (!pageMeta) {
      pageMeta = this.currentPageMeta
    }
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
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M227.4 608c-55 0-99.4-42.8-99.4-96 0-53 44.4-96 99.4-96 55.2 0 99.6 43 99.6 96 0 53.2-44.4 96-99.6 96zM512 608c-55 0-99.6-42.8-99.6-96 0-53 44.6-96 99.6-96 55 0 99.4 43 99.4 96 0 53.2-44.4 96-99.4 96zM796.4 608c-55 0-99.6-42.8-99.6-96 0-53 44.4-96 99.6-96 55 0 99.6 43 99.6 96 0 53.2-44.4 96-99.6 96z"/></svg>
          </div>
        `
      }
    } else {
      if (moreFlag) {
        // more & close
        headerHTML += `
          <div class="mip-shell-header-button-group">
            <div class="button more" mip-header-btn data-button-name="more">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M227.4 608c-55 0-99.4-42.8-99.4-96 0-53 44.4-96 99.4-96 55.2 0 99.6 43 99.6 96 0 53.2-44.4 96-99.6 96zM512 608c-55 0-99.6-42.8-99.6-96 0-53 44.6-96 99.6-96 55 0 99.4 43 99.4 96 0 53.2-44.4 96-99.4 96zM796.4 608c-55 0-99.6-42.8-99.6-96 0-53 44.4-96 99.6-96 55 0 99.6 43 99.6 96 0 53.2-44.4 96-99.6 96z"/></svg>
            </div>
            <div class="split"></div>
            <div class="button close" mip-header-btn data-button-name="close">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M579.888 512l190.064-190.064a48 48 0 0 0-67.888-67.872L512 444.112 321.936 254.064a48 48 0 1 0-67.872 67.872L444.112 512 254.064 702.064a48 48 0 1 0 67.872 67.872L512 579.888l190.064 190.064a48 48 0 0 0 67.872-67.888L579.888 512z" fill="#333"/></svg>
            </div>
          </div>
        `
      } else {
        // only close
        headerHTML += `
          <div class="mip-shell-header-button-group-standalone">
            <div class="button close" mip-header-btn data-button-name="close">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M579.888 512l190.064-190.064a48 48 0 0 0-67.888-67.872L512 444.112 321.936 254.064a48 48 0 1 0-67.872 67.872L444.112 512 254.064 702.064a48 48 0 1 0 67.872 67.872L512 579.888l190.064 190.064a48 48 0 0 0 67.872-67.888L579.888 512z" fill="#333"/></svg>
            </div>
          </div>
        `
      }
    }

    return headerHTML
  }

  bindRootEvents () {
    // Listen bouncy header events
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

    if (!(pageMeta.header && pageMeta.header.show)) {
      this.$wrapper.classList.add('hide')
      return
    }
    this.$wrapper.classList.remove('hide')

    // Refresh header
    this.slideHeader('down')
    this.$el.innerHTML = this.renderHeader(pageMeta)

    // Button wrapper & mask
    let buttonGroup = pageMeta.header.buttonGroup
    let {mask, buttonWrapper} = createMoreButtonWrapper(buttonGroup, {update: true})
    this.$buttonMask = mask
    this.$buttonWrapper = buttonWrapper

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
      window.MIP_SHELL_CONFIG = newShellConfig
      window.MIP_PAGE_META_CACHE = Object.create(null)
      page.notifyRootPage({
        type: 'set-mip-shell-config',
        data: {
          shellConfig: newShellConfig
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

  alwaysRefreshOnLoad () {
    // If true, always load configures from `<mip-shell>` and overwrite shellConfig when opening new page
    return true
  }
}

export default MipShell
