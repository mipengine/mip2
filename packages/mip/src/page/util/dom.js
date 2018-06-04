/**
 * @file define dom functions
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css'
import sandbox from '../../sandbox'

import {MIP_IFRAME_CONTAINER} from '../const'

let {window: sandWin, document: sandDoc} = sandbox
let activeZIndex = 10000

export function createIFrame (path, {onLoad, onError} = {}) {
  let container = document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${path}"]`)

  if (!container) {
    container = document.createElement('iframe')
    container.onload = () => {
      typeof onLoad === 'function' && onLoad()
    }
    container.onerror = () => {
      typeof onError === 'function' && onError()
    }
    // TODO: use XHR to load iframe so that we can get httpRequest.status 404
    container.setAttribute('src', path)
    container.setAttribute('class', MIP_IFRAME_CONTAINER)

    /**
     * Fix an iOS iframe width bug, see examples/mip1/test.html
     * https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
     */
    container.setAttribute('width', '100%')
    container.setAttribute('scrolling', 'no')

    container.setAttribute('data-page-id', path)
    container.setAttribute('sandbox', 'allow-top-navigation allow-popups allow-scripts allow-forms allow-pointer-lock allow-popups-to-escape-sandbox allow-same-origin allow-modals')
    document.body.appendChild(container)
  } else {
    if (typeof onLoad === 'function') {
      onLoad()
    }
  }

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

function hideAllIFrames() {
  document.querySelectorAll(`.${MIP_IFRAME_CONTAINER}`).forEach(iframe => css(iframe, 'display', 'none'))
}

export function createLoading (pageMeta) {
  let loading = document.createElement('div')
  loading.id = 'mip-page-loading'
  loading.setAttribute('class', 'mip-page-loading')
  loading.innerHTML = `
    <div class="mip-page-loading-header">
      <span class="material-icons back-button">keyboard_arrow_left</span>
      <div class="mip-appshell-header-logo-title">
        <img class="mip-appshell-header-logo" src="${pageMeta.header.logo}">
        <span class="mip-appshell-header-title"></span>
      </div>
    </div>
  `
  document.body.appendChild(loading)
}

export function getLoading (targetMeta, onlyHeader) {
  let loading = document.querySelector('#mip-page-loading')
  if (!targetMeta) {
    return loading
  }

  if (onlyHeader) {
    loading.classList.add('only-header')
  } else {
    loading.classList.remove('only-header')
  }

  if (!targetMeta.header.show) {
    css(loading.querySelector('.mip-page-loading-header'), 'display', 'none')
  } else {
    css(loading.querySelector('.mip-page-loading-header'), 'display', 'flex')
  }

  if (targetMeta.header.logo) {
    loading.querySelector('.mip-appshell-header-logo')
      .setAttribute('src', targetMeta.header.logo)
  }

  if (targetMeta.header.title) {
    loading.querySelector('.mip-appshell-header-title')
      .innerHTML = targetMeta.header.title
  }

  if (targetMeta.view.isIndex) {
    css(loading.querySelector('.back-button'), 'display', 'none')
  } else {
    css(loading.querySelector('.back-button'), 'display', 'block')
  }

  return loading
}

export function getMIPShellConfig () {
  let rawJSON
  let $shell = document.body.querySelector('mip-shell')
  if ($shell) {
    rawJSON = $shell.children[0].innerHTML
  }
  try {
    return JSON.parse(rawJSON)
  } catch (e) {}

  return {}
}

export function addMIPCustomScript (win = window) {
  let doc = win.document
  let script = doc.querySelector('script[type="application/mip-script"]')
  if (!script) {
    return
  }

  let customFunction = getSandboxFunction(script.innerHTML)
  script.remove()

  win.addEventListener('ready-to-watch', () => customFunction(sandWin, sandDoc))
}

function getSandboxFunction (script) {
  /* eslint-disable no-new-func */
  return new Function('window', 'document', `
        let {alert, close, confirm, prompt, setTimeout, setInterval, self, top} = window;

        ${script}
    `)
  /* eslint-enable no-new-func */
}

export const inBrowser = typeof window !== 'undefined'

let transitionEndEvent = 'transitionend'
let animationEndEvent = 'animationend'

if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
  transitionEndEvent = 'webkitTransitionEnd'
}

if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
  animationEndEvent = 'webkitAnimationEnd'
}

export const raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : fn => fn()

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
 * @param {Function} options.onComplete callback on complete
 */
export function frameMoveIn (pageId, {transition, targetMeta, newPage, onComplete} = {}) {
  let iframe = getIFrame(pageId)

  if (!iframe) {
    return
  }

  if (transition) {
    let loading = getLoading(targetMeta);
    css(loading, 'display', 'block')

    loading.classList.add('slide-enter', 'slide-enter-active')

    // trigger layout
    /* eslint-disable no-unused-expressions */
    loading.offsetWidth
    /* eslint-enable no-unused-expressions */

    let done = () => {
      hideAllIFrames();
      css(loading, 'display', 'none')
      css(iframe, {
        'z-index': activeZIndex++,
        display: 'block'
      })

      onComplete && onComplete()
    }
    whenTransitionEnds(loading, 'transition', () => {
      loading.classList.remove('slide-enter-to', 'slide-enter-active')

      if (newPage) {
        setTimeout(done, 100)
      }
      else {
        done()
      }
    })

    nextFrame(() => {
      loading.classList.add('slide-enter-to')
      loading.classList.remove('slide-enter')
    })
  } else {
    hideAllIFrames();
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
 * @param {string} pageId currentPageId
 * @param {Object} options
 * @param {boolean} options.transition allowTransition
 * @param {Object} options.sourceMeta pageMeta of current page
 * @param {string} options.targetPageId indicating target iframe id when switching between iframes. undefined when switching to init page.
 * @param {Function} options.onComplete callback on complete
 */
export function frameMoveOut (pageId, {transition, sourceMeta, targetPageId, onComplete} = {}) {
  let iframe = getIFrame(pageId)

  if (!iframe) {
    return;
  }

  if (targetPageId) {
    let targetIFrame = getIFrame(targetPageId)
    activeZIndex -= 2
    css(targetIFrame, {
      display: 'block',
      'z-index': activeZIndex++
    })
  }

  if (transition) {
    let loading = getLoading(sourceMeta, true)
    css(loading, 'display', 'block')

    iframe.classList.add('slide-leave', 'slide-leave-active')
    loading.classList.add('slide-leave', 'slide-leave-active')

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
      loading.classList.remove('slide-leave-to', 'slide-leave-active')
      onComplete && onComplete()
    })

    nextFrame(() => {
      iframe.classList.add('slide-leave-to')
      iframe.classList.remove('slide-leave')
      loading.classList.add('slide-leave-to')
      loading.classList.remove('slide-leave')
    })
  } else {
    css(iframe, {
      display: 'none',
      'z-index': 10000
    })
    onComplete && onComplete()
  }
}

function clickedInEl (el, x, y) {
  const b = el.getBoundingClientRect()
  return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom
}

export function clickedInEls (e, elements) {
  const {clientX: x, clientY: y} = e
  for (const el of elements) {
    if (clickedInEl(el, x, y)) {
      return true
    }
  }
  return false
}

/**
 * create a <div> in iframe to retrieve current scroll top
 * https://medium.com/@dvoytenko/amp-ios-scrolling-and-position-fixed-b854a5a0d451
 */
export function createScrollPosition () {
  let $scrollPosition = document.createElement('div')
  $scrollPosition.id = 'mip-page-scroll-position'
  document.body.appendChild($scrollPosition)
}
