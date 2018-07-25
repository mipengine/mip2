/* istanbul ignore file */
/**
 * @file define dom functions
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css'
import platform from '../../util/platform'

import {MIP_IFRAME_CONTAINER} from '../const/index'
import {raf, transitionEndEvent, animationEndEvent, isPortrait} from './feature-detect'
import {normalizeLocation} from './route'
import viewport from '../../viewport'

let activeZIndex = 10000

export function createIFrame ({fullpath, pageId}, {onLoad, onError} = {}) {
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
  let targetOrigin = normalizeLocation(pageId).origin
  let pageMeta = JSON.stringify({
    standalone: window.MIP.standalone,
    isRootPage: false,
    isCrossOrigin: targetOrigin !== window.location.origin
  })
  container.setAttribute('name', pageMeta)

  container.setAttribute('src', fullpath)
  container.setAttribute('class', MIP_IFRAME_CONTAINER)

  /**
   * Fix an iOS iframe width bug, see examples/mip1/test.html
   * https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
   */
  container.style.height = `${viewport.getHeight()}px`
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

export function hideAllIFrames () {
  let iframes = document.querySelectorAll(`.${MIP_IFRAME_CONTAINER}`)
  if (iframes) {
    for (let i = 0; i < iframes.length; i++) {
      css(iframes[i], {
        display: 'none',
        opacity: 0
      })
    }
  }
}

/**
 * Create loading div
 *
 * @param {Object} pageMeta Page meta info
 */
export function createLoading (pageMeta) {
  let loading = document.querySelector('#mip-page-loading-wrapper')
  if (loading) {
    return loading
  }

  let logo = pageMeta ? (pageMeta.header.logo || '') : ''
  loading = document.createElement('mip-fixed')
  loading.id = 'mip-page-loading-wrapper'
  loading.setAttribute('class', 'mip-page-loading-wrapper')
  loading.innerHTML = `
    <div class="mip-shell-header">
      <span mip-header-btn class="back-button">
        <svg t="1530857979993" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3173"
          xmlns:xlink="http://www.w3.org/1999/xlink">
          <path  fill="currentColor" d="M348.949333 511.829333L774.250667 105.728C783.978667 96 789.333333 83.712 789.333333 71.104c0-12.629333-5.354667-24.917333-15.082666-34.645333-9.728-9.728-22.037333-15.082667-34.645334-15.082667-12.586667 0-24.917333 5.333333-34.624 15.082667L249.557333 471.616A62.570667 62.570667 0 0 0 234.666667 512c0 10.410667 1.130667 25.408 14.890666 40.042667l455.424 435.605333c9.706667 9.728 22.016 15.082667 34.624 15.082667s24.917333-5.354667 34.645334-15.082667c9.728-9.728 15.082667-22.037333 15.082666-34.645333 0-12.608-5.354667-24.917333-15.082666-34.645334L348.949333 511.829333z"
            p-id="3174"></path>
        </svg>
      </span>
      <div class="mip-shell-header-logo-title">
        <img class="mip-shell-header-logo" src="${logo}">
        <span class="mip-shell-header-title"></span>
      </div>
    </div>
  `
  document.body.appendChild(loading)
  return loading
}

/**
 * Change loading according to targetMeta
 * Return loading div
 *
 * @param {Object} targetMeta Page meta of target page
 * @param {Object} options
 * @param {boolean} options.onlyHeader Moving out only needs header, not loading body
 * @param {boolean} options.transitionContainsHeader Whether transition contains header
 * @returns {HTMLElement}
 */
export function getLoading (targetMeta, {onlyHeader, transitionContainsHeader} = {}) {
  let loading = document.querySelector('#mip-page-loading-wrapper')
  if (!loading) {
    createLoading()
    loading = document.querySelector('#mip-page-loading-wrapper')
  }

  if (!targetMeta) {
    return loading
  }

  // Transition only need header (frameMoveOut) but doesn't contains header (extended from child mip-shell-xxx)
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

  if (transitionContainsHeader && targetMeta.header.show) {
    // Set color & borderColor & backgroundColor
    let {
      color = '#000000',
      borderColor,
      backgroundColor = '#ffffff'
    } = targetMeta.header
    let loadingContainer = loading.querySelector('.mip-shell-header')

    css(loadingContainer, 'background-color', backgroundColor)
    css(loading.querySelectorAll('svg'), 'fill', color)
    css(loading.querySelector('.mip-shell-header-title'), 'color', color)
    css(loading.querySelector('.mip-shell-header-logo'), 'border-color', borderColor)
    css(loading.querySelector('.mip-shell-header-button-group'), 'border-color', borderColor)
    css(loading.querySelector('.mip-shell-header-button-group .split'), 'background-color', borderColor)
  }

  return loading
}

export function createFadeHeader (pageMeta) {
  let fadeHeader = document.querySelector('#mip-page-fade-header-wrapper')
  if (fadeHeader) {
    return fadeHeader
  }

  let logo = pageMeta ? (pageMeta.header.logo || '') : ''
  fadeHeader = document.createElement('mip-fixed')
  fadeHeader.id = 'mip-page-fade-header-wrapper'
  fadeHeader.setAttribute('class', 'mip-page-fade-header-wrapper')
  fadeHeader.innerHTML = `
    <div class="mip-shell-header">
      <span class="back-button">
        <svg t="1530857979993" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3173"
          xmlns:xlink="http://www.w3.org/1999/xlink">
          <path  fill="currentColor" d="M348.949333 511.829333L774.250667 105.728C783.978667 96 789.333333 83.712 789.333333 71.104c0-12.629333-5.354667-24.917333-15.082666-34.645333-9.728-9.728-22.037333-15.082667-34.645334-15.082667-12.586667 0-24.917333 5.333333-34.624 15.082667L249.557333 471.616A62.570667 62.570667 0 0 0 234.666667 512c0 10.410667 1.130667 25.408 14.890666 40.042667l455.424 435.605333c9.706667 9.728 22.016 15.082667 34.624 15.082667s24.917333-5.354667 34.645334-15.082667c9.728-9.728 15.082667-22.037333 15.082666-34.645333 0-12.608-5.354667-24.917333-15.082666-34.645334L348.949333 511.829333z"
            p-id="3174"></path>
        </svg>
      </span>
      <div class="mip-shell-header-logo-title">
        <img class="mip-shell-header-logo" src="${logo}">
        <span class="mip-shell-header-title"></span>
      </div>
    </div>
  `
  document.body.appendChild(fadeHeader)
  return fadeHeader
}

/**
 * Change fade header according to targetMeta
 * Return fade header div
 *
 * @param {Object} targetMeta Page meta of target page
 * @param {Object} sourceMeta Page meta of source page (undefined when frameMoveIn, NOT undefined when frameMoveOut)
 * @returns {HTMLElement}
 */
export function getFadeHeader (targetMeta, sourceMeta) {
  let fadeHeader = document.querySelector('#mip-page-fade-header-wrapper')
  if (!fadeHeader) {
    createFadeHeader()
    fadeHeader = document.querySelector('#mip-page-fade-header-wrapper')
  }

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

  // Set color & borderColor & backgroundColor
  let colorConfig = sourceMeta ? sourceMeta.header : {}
  let {
    color = '#000000',
    borderColor = '#e1e1e1',
    backgroundColor = '#ffffff'
  } = colorConfig
  let fadeHeaderContainer = fadeHeader.querySelector('.mip-shell-header')

  css(fadeHeaderContainer, 'background-color', backgroundColor)
  css(fadeHeader.querySelectorAll('svg'), 'fill', color)
  css(fadeHeader.querySelector('.mip-shell-header-title'), 'color', color)
  css(fadeHeader.querySelector('.mip-shell-header-logo'), 'border-color', borderColor)
  css(fadeHeader.querySelector('.mip-shell-header-button-group'), 'border-color', borderColor)
  css(fadeHeader.querySelector('.mip-shell-header-button-group .split'), 'background-color', borderColor)

  return fadeHeader
}

/**
 * Toggle fade header
 * Invoked by `refreshShell` in MIP Shell with `asyncRefresh` is `true`
 *
 * @param {boolean} toggle Show/Hide fade header
 * @param {Object} pageMeta pageMeta of current page. `undefined` when `toggle` is `false`
 */
export function toggleFadeHeader (toggle, pageMeta) {
  let fadeHeader = getFadeHeader(pageMeta)

  if (!toggle) {
    css(fadeHeader, 'display', 'none')
    return
  }

  css(fadeHeader, 'display', 'block')
  fadeHeader.classList.add('fade-enter', 'fade-enter-active')

  // trigger layout
  /* eslint-disable no-unused-expressions */
  fadeHeader.offsetWidth
  /* eslint-enable no-unused-expressions */

  whenTransitionEnds(fadeHeader, 'transition', () => {
    fadeHeader.classList.remove('fade-enter-to', 'fade-enter')
  })

  nextFrame(() => {
    fadeHeader.classList.add('fade-enter-to')
    fadeHeader.classList.remove('fade-enter')
  })
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
 * @param {Object} options.targetMeta pageMeta of target page
 * @param {string} options.newPage whether iframe is just created
 * @param {boolean} options.transitionContainsHeader whether transition contains header
 * @param {Function} options.onComplete callback on complete
 */
export function frameMoveIn (pageId,
  {
    targetMeta,
    newPage,
    transitionContainsHeader,
    onComplete
  } = {}) {
  let transition = isPortrait() && window.MIP_SHELL_OPTION.allowTransition
  let iframe
  if (!newPage) {
    iframe = getIFrame(pageId)
    if (!iframe) {
      return
    }
  }

  let done = () => {
    hideAllIFrames()
    window.MIP_SHELL_OPTION.allowTransition = false
    window.MIP_SHELL_OPTION.direction = null
    onComplete && onComplete()

    if (newPage) {
      iframe = getIFrame(pageId)
    }

    css(iframe, 'z-index', activeZIndex++)
  }

  if (!transition) {
    done()
    return
  }

  let loading = getLoading(targetMeta, {transitionContainsHeader})
  loading.classList.add('slide-enter', 'slide-enter-active')
  css(loading, 'display', 'block')

  let headerLogoTitle
  let fadeHeader
  if (!transitionContainsHeader) {
    headerLogoTitle = document.querySelector('.mip-shell-header-wrapper .mip-shell-header-logo-title')
    headerLogoTitle && headerLogoTitle.classList.add('fade-out')
    fadeHeader = getFadeHeader(targetMeta)
    fadeHeader.classList.add('fade-enter', 'fade-enter-active')
    css(fadeHeader, 'display', 'block')
  }

  // trigger layout
  /* eslint-disable no-unused-expressions */
  loading.offsetWidth
  /* eslint-enable no-unused-expressions */

  whenTransitionEnds(loading, 'transition', () => {
    loading.classList.remove('slide-enter-to', 'slide-enter-active')
    if (!transitionContainsHeader) {
      fadeHeader.classList.remove('fade-enter-to', 'fade-enter-active')
    }

    done()
  })

  nextFrame(() => {
    loading.classList.add('slide-enter-to')
    loading.classList.remove('slide-enter')
    if (!transitionContainsHeader) {
      fadeHeader.classList.add('fade-enter-to')
      fadeHeader.classList.remove('fade-enter')
    }
  })
}

/**
 * Backward iframe animation
 *
 * @param {string} pageId CurrentPageId
 * @param {Object} options
 * @param {Object} options.sourceMeta PageMeta of current page
 * @param {string} options.targetPageId Indicating target iframe id when switching between iframes. undefined when switching to init page.
 * @param {string} options.targetPageMeta TargetPageMeta. Always defined.
 * @param {boolean} options.transitionContainsHeader Whether transition contains header
 * @param {Function} options.onComplete Callback on complete
 */
export function frameMoveOut (pageId,
  {
    sourceMeta,
    targetPageId,
    targetPageMeta,
    transitionContainsHeader,
    onComplete,
    rootPageScrollPosition = 0
  } = {}) {
  let transition = isPortrait() && window.MIP_SHELL_OPTION.allowTransition
  let iframe = getIFrame(pageId)

  if (targetPageId) {
    let targetIFrame = getIFrame(targetPageId)
    activeZIndex -= 2
    css(targetIFrame, {
      opacity: 1,
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
      headerLogoTitle && headerLogoTitle.classList.add('fade-out')
      fadeHeader = getFadeHeader(targetPageMeta, sourceMeta)
      css(fadeHeader, 'display', 'block')
    }

    iframe.classList.add('slide-leave', 'slide-leave-active')
    if (transitionContainsHeader) {
      loading.classList.add('slide-leave', 'slide-leave-active')
    } else {
      fadeHeader.classList.add('fade-enter', 'fade-enter-active')
    }

    // trigger layout and move current iframe to correct position
    /* eslint-disable no-unused-expressions */
    css(iframe, {
      opacity: 1,
      top: rootPageScrollPosition + 'px'
    })
    /* eslint-enable no-unused-expressions */

    whenTransitionEnds(iframe, 'transition', () => {
      css(iframe, {
        display: 'none',
        'z-index': 10000,
        top: 0
      })
      iframe.classList.remove('slide-leave-to', 'slide-leave-active')
      if (transitionContainsHeader) {
        loading.classList.remove('slide-leave-to', 'slide-leave-active')
        css(loading, 'display', 'none')
      } else {
        fadeHeader.classList.remove('fade-enter-to', 'fade-enter')
      }

      window.MIP_SHELL_OPTION.allowTransition = false
      window.MIP_SHELL_OPTION.direction = null
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
      opacity: 0,
      display: 'none',
      'z-index': 10000
    })

    window.MIP_SHELL_OPTION.allowTransition = false
    window.MIP_SHELL_OPTION.direction = null
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
