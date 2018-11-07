/**
 * @file render 方法
 * @author wangyisheng@baidu.com (wangyisheng)
 */
/* istanbul ignore file */

import platform from '../../util/platform'
import fn from '../../util/fn'
import css from '../../util/dom/css'
import {switchPage} from './switchPage'
import {isSameRoute, getFullPath} from '../../page/util/route'
import {
  createIFrame,
  getIFrame
} from '../../page/util/dom'
import {getCleanPageId} from '../../page/util/path'
import {
  NON_EXISTS_PAGE_ID,
  CUSTOM_EVENT_SCROLL_TO_ANCHOR,
  CUSTOM_EVENT_SHOW_PAGE,
  CUSTOM_EVENT_HIDE_PAGE,
  MESSAGE_PAGE_ACTIVE
} from '../../page/const/index'

let innerBodyHeight
let innerBodyFreezeTime

export function render (shell, from, to) {
  let page = window.MIP.viewer.page

  shell.resizeAllPages()

  // If `to` route is the same with `from` route in path & query, scroll in current page
  if (isSameRoute(from, to, true)) {
    // Emit event to current active page
    page.emitEventInCurrentPage({
      name: CUSTOM_EVENT_SCROLL_TO_ANCHOR,
      data: to.hash
    })
    return
  }

  // Render target page
  let sourcePage = page.getPageById(page.currentPageId)
  let targetFullPath = getFullPath(to)
  let targetPageId = getCleanPageId(targetFullPath)
  let targetPage = page.getPageById(targetPageId)
  let targetIFrame = getIFrame(targetPageId)
  let isTargetRootPage = targetPage ? targetPage.isRootPage : false

  /**
   * priority of header.title:
   * 1. <a mip-link data-title> (to.meta.title)
   * 2. <mip-shell> targetPageMeta.header.title (findMetaById(id).header.title)
   * 3. <a mip-link></a> innerText (to.meta.defaultTitle)
   */
  let targetPageMeta = fn.extend(true, {}, shell.findMetaByPageId(targetPageId))

  shell.priorTitle = to.meta.header && to.meta.header.title
  document.title = targetPageMeta.header.title = to.meta.header
    ? to.meta.header.title || targetPageMeta.header.title || to.meta.header.defaultTitle
    : targetPageMeta.header.title

  // Transition direction
  let isForward
  if (targetPageMeta.view.isIndex) {
    isForward = false
  } else {
    isForward = window.MIP_SHELL_OPTION.isForward
  }

  // Hide page mask and skip transition
  shell.togglePageMask(false, {skipTransition: true})

  // Show header
  shell.toggleTransition(false)
  shell.slideHeader('down')
  shell.pauseBouncyHeader = true

  let params = {
    targetPageId,
    targetPageMeta,
    sourcePageId: page.currentPageId,
    sourcePageMeta: sourcePage.pageMeta,
    isForward
  }

  // Leave from root page, save scroll position
  if (page.currentPageId === page.pageId) {
    shell.saveScrollPosition()
  }

  // 目标页面是否存在。这是下面决定是否创建 iframe 时要用到的重要判断指标。
  // 如果是 rootPage，要求 page 存在。但因为 isTargetRootPage 本身就是用 targetPage 判断的，所以直接等价于目标页存在。
  // 如果不是 rootPage，则要求 iframe 和 page 同时存在
  // 之所以要判断两个都存在，是因为预渲染情况在 iframe load 之后才添加 page，所以可能 page=null 但是 iframe 已经有了
  let targetExists = isTargetRootPage || (targetIFrame && targetPage)

  if (!targetExists || (to.meta && to.meta.reload && !to.meta.cacheFirst)) {
    // 进入这个分支表示需要创建新的 iframe，有以下情况：
    // 1. 目标页面不存在
    // 2. 目标页面的 iframe 和 page 虽然都存在，但是因为是点击链接跳转的（to.meta.reload = true)，因此为了实时性需要重新加载。
    //    但是 cacheFirst 时还是应该优先使用已有的 iframe，因此不要创建

    // If target page is root page
    if (page.pageId === targetPageId) {
      // Clear root pageId and destroy root page (Root page will exist in newly created iframe)
      page.pageId = NON_EXISTS_PAGE_ID
      // if (targetPage) {
      //   targetPage.destroy()
      // }
      // Delete DOM & trigger disconnectedCallback in root page
      page.getElementsInRootPage().forEach(el => el.parentNode && el.parentNode.removeChild(el))
    }

    if (!targetPage) {
      page.checkIfExceedsMaxPageNum(targetPageId)
    }

    let targetPageInfo = {
      pageId: targetPageId,
      pageMeta: targetPageMeta,
      fullpath: targetFullPath,
      standalone: window.MIP.standalone,
      isRootPage: false,
      isCrossOrigin: to.origin !== window.location.origin
    }

    let iframeCreated = false
    let targetIFrame
    innerBodyHeight = 0
    innerBodyFreezeTime = 0
    let initHackForAndroidScroll = () => {
      let mask = document.createElement('div')
      mask.classList.add('hack-for-android-scroll-mask')
      document.body.appendChild(mask)
      return mask
    }
    let executeHackForAndroidScroll = mask => {
      css(mask, {
        opacity: '0.01',
        display: 'block'
      })
      setTimeout(() => {
        css(mask, {
          display: 'none',
          opacity: ''
        })
      }, 20)
    }
    let iframeOnLoad = () => {
      if (!targetPageInfo.isCrossOrigin && platform.isAndroid()) {
        let doc = targetIFrame.contentWindow.document
        let intervalTimes = 0
        let hackMask = initHackForAndroidScroll()
        let checkInterval = setInterval(() => {
          intervalTimes++
          let currentHeight = doc.body.clientHeight
          if (doc.body.clientHeight !== innerBodyHeight) {
            innerBodyHeight = currentHeight
            innerBodyFreezeTime = 0
            executeHackForAndroidScroll(hackMask)
          } else {
            innerBodyFreezeTime++
          }

          if (innerBodyFreezeTime >= 10 || intervalTimes >= 20) {
            clearInterval(checkInterval)
          }
        }, 500)
      }
    }
    // Bugs appear in QQBrowser when [pushState] and [create iframe] invoked together
    // Ensure [create iframe] before [pushState] and eliminate async operations can help
    // Thus, disable transition in QQBrowser
    if (platform.isQQ() || platform.isQQApp()) {
      targetIFrame = createIFrame(targetPageInfo, {onLoad: iframeOnLoad})
      targetPageInfo.targetWindow = targetIFrame.contentWindow
      iframeCreated = true
      window.MIP_SHELL_OPTION.allowTransition = false
    }

    page.addChild(targetPageInfo)
    params.newPage = true

    shell.beforeSwitchPage(params)

    params.onComplete = () => {
      shell.currentPageMeta = targetPageMeta
      window.MIP_SHELL_OPTION.allowTransition = false
      window.MIP_SHELL_OPTION.isForward = true

      if (!iframeCreated) {
        targetIFrame = createIFrame(targetPageInfo, {onLoad: iframeOnLoad})
        targetPageInfo.targetWindow = targetIFrame.contentWindow
      }
      css(targetIFrame, {
        display: 'block',
        opacity: 1
      })
      shell.toggleTransition(true)
      shell.pauseBouncyHeader = false

      // Get <mip-shell> from root page
      let shellDOM = document.querySelector('mip-shell') || document.querySelector('[mip-shell]')
      if (shellDOM) {
        window.MIP.viewer.eventAction.execute('active', shellDOM, {})
      }

      // Emit show/hide event to both pages
      page.emitEventInCurrentPage({name: CUSTOM_EVENT_HIDE_PAGE})
      page.currentPageId = targetPageId
      page.emitEventInCurrentPage({name: CUSTOM_EVENT_SHOW_PAGE})
    }

    switchPage(shell, params)
  } else {
    // 进到这个分支表示复用已有的 iframe，不重新创建。需要满足：
    // 1. 目标页面的 iframe 和 page 对象都已经存在
    // 2. 并且可能是后退来的（to.meta.reload = false）或者指明从缓存读取（to.meta.cacheFirst = true）

    if (platform.isQQ() || platform.isQQApp()) {
      window.MIP_SHELL_OPTION.allowTransition = false
    }
    // When transition contains header, fadeHeader won't appear
    // Thus updating shell of target page first is required
    if (shell.transitionContainsHeader) {
      shell.refreshShell({pageMeta: targetPageMeta})
    }

    // 如果是预渲染页面
    if (targetPage.isPrerender || (targetIFrame && targetIFrame.getAttribute('prerender') === '1')) {
      params.isPrerender = true
      targetIFrame.contentWindow.postMessage({
        name: window.name,
        event: MESSAGE_PAGE_ACTIVE
      }, '*')
      targetPage.isPrerender = false
      targetIFrame.removeAttribute('prerender')

      if (targetPageId === page.pageId) {
        // Clear root pageId and destroy root page (Root page will exist in newly created iframe)
        page.pageId = NON_EXISTS_PAGE_ID
        // if (targetPage) {
        //   targetPage.destroy()
        // }
        // Delete DOM & trigger disconnectedCallback in root page
        page.getElementsInRootPage().forEach(el => el.parentNode && el.parentNode.removeChild(el))
      }
    }

    params.newPage = false
    params.cacheFirst = to.meta && to.meta.cacheFirst
    shell.beforeSwitchPage(params)

    params.onComplete = () => {
      shell.currentPageMeta = targetPageMeta
      window.MIP_SHELL_OPTION.allowTransition = false
      window.MIP_SHELL_OPTION.isForward = true

      window.MIP.$recompile()

      css(targetIFrame, {
        display: 'block',
        opacity: 1
      })

      if (shell.transitionContainsHeader) {
        css(shell.$loading, 'display', 'none')
      } else {
        shell.refreshShell({pageMeta: targetPageMeta})
      }
      shell.toggleTransition(true)
      shell.pauseBouncyHeader = false

      // Get <mip-shell> from root page
      let shellDOM = document.querySelector('mip-shell') || document.querySelector('[mip-shell]')
      if (shellDOM) {
        window.MIP.viewer.eventAction.execute('active', shellDOM, {})
      }

      // Emit show/hide event to both pages
      page.emitEventInCurrentPage({name: CUSTOM_EVENT_HIDE_PAGE})
      page.currentPageId = targetPageId
      page.emitEventInCurrentPage({name: CUSTOM_EVENT_SHOW_PAGE})
    }

    switchPage(shell, params)
  }
}
