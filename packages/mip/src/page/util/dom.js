/**
 * @file define dom functions
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css'
import platform from '../../util/platform'

import {MIP_IFRAME_CONTAINER} from '../const/index'
import {raf, transitionEndEvent, animationEndEvent} from './feature-detect'

let activeZIndex = 10000

export function createIFrame (fullpath, pageId, {onLoad, onError} = {}) {
  let container = document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${pageId}"]`)

  // if exists, delete it first
  if (container) {
    container.parentNode.removeChild(container)
  }

  container = document.createElement('iframe')
  container.onload = () => {
    typeof onLoad === 'function' && onLoad()
  }
  container.onerror = () => {
    typeof onError === 'function' && onError()
  }
  // TODO: use XHR to load iframe so that we can get httpRequest.status 404
  container.setAttribute('name', pageId)
  container.setAttribute('src', fullpath)
  container.setAttribute('class', MIP_IFRAME_CONTAINER)

  /**
   * Fix an iOS iframe width bug, see examples/mip1/test.html
   * https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
   */
  // container.style.height = `${viewport.getHeight()}px`
  container.setAttribute('width', '100%')
  container.setAttribute('scrolling', platform.isIos() ? 'no' : 'yes')

  container.setAttribute('data-page-id', pageId)
  container.setAttribute('sandbox', 'allow-top-navigation allow-popups allow-scripts allow-forms allow-pointer-lock allow-popups-to-escape-sandbox allow-same-origin allow-modals')
  document.body.appendChild(container)

  return container
}

export function removeIFrame (pageId) {
  let container = document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${pageId}"]`)
  if (container) {
    container.parentNode.removeChild(container)
  }
}

export function getIFrame (iframe) {
  if (typeof iframe === 'string') {
    return document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${iframe}"]`)
  }

  return iframe
}

function hideAllIFrames () {
  let iframes = document.querySelectorAll(`.${MIP_IFRAME_CONTAINER}`)
  if (iframes) {
    for (let i = 0; i < iframes.length; i++) {
      css(iframes[i], 'display', 'none')
    }
  }
}

/**
 * Create loading div
 *
 * @param {Object} pageMeta Page meta info
 */
export function createLoading (pageMeta) {
  if (document.querySelector('#mip-page-loading-wrapper')) {
    return
  }

  let loading = document.createElement('mip-fixed')
  loading.id = 'mip-page-loading-wrapper'
  loading.setAttribute('class', 'mip-page-loading-wrapper')
  loading.innerHTML = `
    <div class="mip-shell-header mip-border mip-border-bottom">
      <span mip-header-btn class="back-button">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M769.405 977.483a68.544 68.544 0 0 1-98.121 0L254.693 553.679c-27.173-27.568-27.173-72.231 0-99.899L671.185 29.976c13.537-13.734 31.324-20.652 49.109-20.652s35.572 6.917 49.109 20.652c27.173 27.568 27.173 72.331 0 99.899L401.921 503.681l367.482 373.904c27.074 27.568 27.074 72.231 0 99.899z"/></svg>
      </span>
      <div class="mip-shell-header-logo-title">
        <img class="mip-shell-header-logo" src="${pageMeta.header.logo}">
        <span class="mip-shell-header-title"></span>
      </div>
    </div>
  `
  document.body.appendChild(loading)
}

/**
 * Change loading according to targetMeta
 * Return loading div
 *
 * @param {Object} targetMeta Page meta of target page
 * @param {Object} options
 * @param {boolean} options.onlyHeader Moving out only needs header, not loading body
 * @param {boolean} options.transitionContainsHeader whether transition contains header
 * @returns {HTMLElement}
 */
function getLoading (targetMeta, {onlyHeader, transitionContainsHeader} = {}) {
  let loading = document.querySelector('#mip-page-loading-wrapper')
  if (!targetMeta) {
    return loading
  }

  // Transition only need header (frameMovingOut) but doesn't contains header (extended from child mip-shell-xxx)
  // Means doesn't need loading
  if (!transitionContainsHeader && onlyHeader) {
    css(loading, 'display', 'none')
    return loading
  }

  loading.classList.toggle('transition-without-header', !transitionContainsHeader)
  if (transitionContainsHeader) {
    loading.classList.toggle('only-header', !!onlyHeader)
  }

  if (!transitionContainsHeader || !targetMeta.header.show) {
    css(loading.querySelector('.mip-shell-header'), 'display', 'none')
  } else {
    css(loading.querySelector('.mip-shell-header'), 'display', 'flex')
  }

  let $logo = loading.querySelector('.mip-shell-header-logo')
  if (targetMeta.header.logo) {
    $logo.setAttribute('src', targetMeta.header.logo)
    css($logo, 'display', 'block')
  } else {
    css($logo, 'display', 'none')
  }

  if (targetMeta.header.title) {
    loading.querySelector('.mip-shell-header-title').innerHTML = targetMeta.header.title
  }

  css(loading.querySelector('.back-button'), 'display', targetMeta.view.isIndex ? 'none' : 'flex')

  return loading
}

export function createFadeHeader (pageMeta) {
  if (document.querySelector('#mip-page-fade-header-wrapper')) {
    return
  }

  let fadeHeader = document.createElement('mip-fixed')
  fadeHeader.id = 'mip-page-fade-header-wrapper'
  fadeHeader.setAttribute('class', 'mip-page-fade-header-wrapper')
  fadeHeader.innerHTML = `
    <div class="mip-shell-header mip-border mip-border-bottom">
      <span class="back-button">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M769.405 977.483a68.544 68.544 0 0 1-98.121 0L254.693 553.679c-27.173-27.568-27.173-72.231 0-99.899L671.185 29.976c13.537-13.734 31.324-20.652 49.109-20.652s35.572 6.917 49.109 20.652c27.173 27.568 27.173 72.331 0 99.899L401.921 503.681l367.482 373.904c27.074 27.568 27.074 72.231 0 99.899z"/></svg>
      </span>
      <div class="mip-shell-header-logo-title">
        <img class="mip-shell-header-logo" src="${pageMeta.header.logo}">
        <span class="mip-shell-header-title"></span>
      </div>
    </div>
  `
  document.body.appendChild(fadeHeader)
}

/**
 * Change loading according to targetMeta
 * Return loading div
 *
 * @param {Object} targetMeta Page meta of target page
 * @returns {HTMLElement}
 */
function getFadeHeader (targetMeta) {
  let fadeHeader = document.querySelector('#mip-page-fade-header-wrapper')
  if (!targetMeta) {
    return fadeHeader
  }

  let $logo = fadeHeader.querySelector('.mip-shell-header-logo')
  if (targetMeta.header.logo) {
    $logo.setAttribute('src', targetMeta.header.logo)
    css($logo, 'display', 'block')
  } else {
    css($logo, 'display', 'none')
  }

  if (targetMeta.header.title) {
    fadeHeader.querySelector('.mip-shell-header-title').innerHTML = targetMeta.header.title
  }

  css(fadeHeader.querySelector('.back-button'), 'display', targetMeta.view.isIndex ? 'none' : 'flex')

  return fadeHeader
}

/**
 * Add empty `<mip-shell>` if not found in page
 */
export function ensureMIPShell () {
  if (!document.querySelector('mip-shell') && !document.querySelector('[mip-shell]')) {
    let shell = document.createElement('mip-shell')
    let script = document.createElement('script')
    script.setAttribute('type', 'application/json')
    script.innerHTML = '{}'
    shell.appendChild(script)
    document.body.appendChild(shell)
  }
}

export function nextFrame (fn) {
  raf(() => {
    raf(fn)
  })
}

export function whenTransitionEnds (el, type, cb) {
  if (!type) {
    return cb()
  }

  const event = type === 'transition' ? transitionEndEvent : animationEndEvent
  const onEnd = e => {
    if (e.target === el) {
      end()
    }
  }
  const end = () => {
    el.removeEventListener(event, onEnd)
    cb()
  }
  el.addEventListener(event, onEnd)
}

/**
 * Forward iframe animation
 *
 * @param {string} pageId targetPageId
 * @param {Object} options
 * @param {boolean} options.transition allowTransition
 * @param {Object} options.targetMeta pageMeta of target page
 * @param {string} options.newPage whether iframe is just created
 * @param {boolean} options.transitionContainsHeader whether transition contains header
 * @param {Function} options.onComplete callback on complete
 */
export function frameMoveIn (pageId, {transition, targetMeta, newPage, transitionContainsHeader, onComplete} = {}) {
  let iframe = getIFrame(pageId)

  if (!iframe) {
    return
  }

  if (transition) {
    let loading = getLoading(targetMeta, {transitionContainsHeader})
    css(loading, 'display', 'block')
    loading.classList.add('slide-enter', 'slide-enter-active')

    let headerLogoTitle
    let fadeHeader
    if (!transitionContainsHeader) {
      headerLogoTitle = document.querySelector('.mip-shell-header-wrapper .mip-shell-header-logo-title')
      headerLogoTitle.classList.add('fade-out')
      fadeHeader = getFadeHeader(targetMeta)
      css(fadeHeader, 'display', 'block')
      fadeHeader.classList.add('fade-enter', 'fade-enter-active')
    }

    // trigger layout
    /* eslint-disable no-unused-expressions */
    loading.offsetWidth
    /* eslint-enable no-unused-expressions */

    let done = () => {
      hideAllIFrames()
      css(loading, 'display', 'none')

      css(iframe, {
        'z-index': activeZIndex++,
        display: 'block'
      })

      onComplete && onComplete()
    }
    whenTransitionEnds(loading, 'transition', () => {
      loading.classList.remove('slide-enter-to', 'slide-enter-active')
      if (!transitionContainsHeader) {
        fadeHeader.classList.remove('fade-enter-to', 'fade-enter-active')
      }

      if (newPage) {
        setTimeout(done, 100)
      } else {
        done()
      }
    })

    nextFrame(() => {
      loading.classList.add('slide-enter-to')
      loading.classList.remove('slide-enter')
      if (!transitionContainsHeader) {
        fadeHeader.classList.add('fade-enter-to')
        fadeHeader.classList.remove('fade-enter')
      }
    })
  } else {
    hideAllIFrames()
    css(iframe, {
      'z-index': activeZIndex++,
      display: 'block'
    })
    onComplete && onComplete()
  }
}

/**
 * Backward iframe animation
 *
 * @param {string} pageId CurrentPageId
 * @param {Object} options
 * @param {boolean} options.transition AllowTransition
 * @param {Object} options.sourceMeta PageMeta of current page
 * @param {string} options.targetPageId Indicating target iframe id when switching between iframes. undefined when switching to init page.
 * @param {string} options.targetPageMeta TargetPageMeta. Always defined.
 * @param {boolean} options.transitionContainsHeader Whether transition contains header
 * @param {Function} options.onComplete Callback on complete
 */
export function frameMoveOut (pageId,
  {
    transition,
    sourceMeta,
    targetPageId,
    targetPageMeta,
    transitionContainsHeader,
    onComplete
  } = {}) {
  let iframe = getIFrame(pageId)

  if (targetPageId) {
    let targetIFrame = getIFrame(targetPageId)
    activeZIndex -= 2
    css(targetIFrame, {
      display: 'block',
      'z-index': activeZIndex++
    })
  }

  // Init page cannot apply transition
  if (!iframe) {
    onComplete && onComplete()
    return
  }

  if (transition) {
    // Moving out only needs header, not loading body.
    let loading = getLoading(sourceMeta, {onlyHeader: true, transitionContainsHeader})
    let headerLogoTitle
    let fadeHeader

    if (transitionContainsHeader) {
      css(loading, 'display', 'block')
    } else {
      headerLogoTitle = document.querySelector('.mip-shell-header-wrapper .mip-shell-header-logo-title')
      headerLogoTitle.classList.add('fade-out')
      fadeHeader = getFadeHeader(targetPageMeta)
      css(fadeHeader, 'display', 'block')
    }

    iframe.classList.add('slide-leave', 'slide-leave-active')
    if (transitionContainsHeader) {
      loading.classList.add('slide-leave', 'slide-leave-active')
    } else {
      fadeHeader.classList.add('fade-enter', 'fade-enter-active')
    }

    // trigger layout
    /* eslint-disable no-unused-expressions */
    iframe.offsetWidth
    /* eslint-enable no-unused-expressions */

    whenTransitionEnds(iframe, 'transition', () => {
      css(iframe, {
        display: 'none',
        'z-index': 10000
      })
      css(loading, 'display', 'none')
      iframe.classList.remove('slide-leave-to', 'slide-leave-active')
      if (transitionContainsHeader) {
        loading.classList.remove('slide-leave-to', 'slide-leave-active')
      } else {
        fadeHeader.classList.remove('fade-enter-to', 'fade-enter')
      }
      onComplete && onComplete()
    })

    nextFrame(() => {
      iframe.classList.add('slide-leave-to')
      iframe.classList.remove('slide-leave')
      if (transitionContainsHeader) {
        loading.classList.add('slide-leave-to')
        loading.classList.remove('slide-leave')
      } else {
        fadeHeader.classList.add('fade-enter-to')
        fadeHeader.classList.remove('fade-enter')
      }
    })
  } else {
    css(iframe, {
      display: 'none',
      'z-index': 10000
    })
    onComplete && onComplete()
  }
}

/**
 * Append <script>
 */
export function appendScript (src) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    script.onload = resolve
    script.onerror = reject
    script.src = src
    document.body.appendChild(script)
  })
}

/**
 * Fix a UC/Shoubai bug when hiding current iframe
 * https://github.com/mipengine/mip2/issues/19
 */
let $style = document.createElement('style')
let $head = document.head || document.getElementsByTagName('head')[0]
$style.setAttribute('mip-bouncy-scrolling', '')
$style.textContent = '* {-webkit-overflow-scrolling: auto!important;}'
export function disableBouncyScrolling () {
  $head.appendChild($style)
}
export function enableBouncyScrolling () {
  try {
    $head.removeChild($style)
  } catch (e) {}
}
