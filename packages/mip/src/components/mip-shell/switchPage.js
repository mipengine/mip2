/**
 * @file 处理过场动画
 * @author wangyisheng@baidu.com (wangyisheng)
 */
/* istanbul ignore file */

import {isPortrait} from '../../page/util/feature-detect'
import css from '../../util/dom/css'
import {
  getIFrame,
  hideAllIFrames,
  getLoading,
  getFadeHeader,
  nextFrame,
  whenTransitionEnds
} from '../../page/util/dom'

let activeZIndex = 10000

/**
 * Apply transition effect when switching page
 *
 * @param {Object} shell shell instance
 * @param {Object} options
 * @param {string} options.targetPageId targetPageId
 * @param {Object} options.targetPageMeta pageMeta of target page
 * @param {string} options.sourcePageId sourcePageId
 * @param {Object} options.sourcePageMeta pageMeta of source page
 * @param {boolean} options.newPage whether a new iframe should be created
 * @param {boolean} options.isForward whether transition direction is forward
 * @param {Function} options.onComplete complete callback
 */
export function switchPage (shell, options) {
  if (isPortrait() && window.MIP_SHELL_OPTION.allowTransition) {
    // enable transition
    if (options.newPage) {
      if (options.isForward) {
        forwardTransitionAndCreate(shell, options)
      } else {
        backwardTransitionAndCreate(shell, options)
      }
    } else {
      if (options.isForward) {
        forwardTransition(shell, options)
      } else {
        backwardTransition(shell, options)
      }
    }
  } else {
    // disable transition
    if (options.newPage) {
      skipTransitionAndCreate(shell, options)
    } else {
      skipTransition(shell, options)
    }
  }
}

/**
 * Forward transition and create new iframe
 *
 * @param {Object} shell shell instance
 * @param {Object} options
 * @param {string} options.targetPageId targetPageId
 * @param {Object} options.targetPageMeta pageMeta of target page
 * @param {string} options.sourcePageId sourcePageId
 * @param {Object} options.sourcePageMeta pageMeta of source page
 * @param {boolean} options.newPage whether a new iframe should be created (true)
 * @param {boolean} options.isForward whether transition direction is forward (true)
 * @param {Function} options.onComplete complete callback
 */
function forwardTransitionAndCreate (shell, options) {
  let {sourcePageId, targetPageId, targetPageMeta, onComplete} = options
  let loading = getLoading(targetPageMeta, {transitionContainsHeader: shell.transitionContainsHeader})
  loading.classList.add('slide-enter', 'slide-enter-active')
  css(loading, 'display', 'block')

  let headerLogoTitle
  let fadeHeader
  if (!shell.transitionContainsHeader) {
    headerLogoTitle = document.querySelector('.mip-shell-header-wrapper .mip-shell-header-logo-title')
    headerLogoTitle && headerLogoTitle.classList.add('fade-out')
    fadeHeader = getFadeHeader(targetPageMeta)
    fadeHeader.classList.add('fade-enter', 'fade-enter-active')
    css(fadeHeader, 'display', 'block')
  }

  whenTransitionEnds(loading, 'transition', () => {
    loading.classList.remove('slide-enter-to', 'slide-enter-active')
    if (!shell.transitionContainsHeader) {
      fadeHeader.classList.remove('fade-enter-to', 'fade-enter-active')
    }

    hideAllIFrames()
    fixRootPageScroll(shell, {sourcePageId, targetPageId})
    onComplete && onComplete()

    let iframe = getIFrame(targetPageId)
    css(iframe, 'z-index', activeZIndex++)

    shell.afterSwitchPage(options)
  })

  nextFrame(() => {
    loading.classList.add('slide-enter-to')
    loading.classList.remove('slide-enter')
    if (!shell.transitionContainsHeader) {
      fadeHeader.classList.add('fade-enter-to')
      fadeHeader.classList.remove('fade-enter')
    }
  })
}

/**
 * Backward transition and create new iframe
 *
 * @param {Object} shell shell instance
 * @param {Object} options
 * @param {string} options.targetPageId targetPageId
 * @param {Object} options.targetPageMeta pageMeta of target page
 * @param {string} options.sourcePageId sourcePageId
 * @param {Object} options.sourcePageMeta pageMeta of source page
 * @param {boolean} options.newPage whether a new iframe should be created (true)
 * @param {boolean} options.isForward whether transition direction is forward (false)
 * @param {Function} options.onComplete complete callback
 */
function backwardTransitionAndCreate (shell, options) {
  let {
    targetPageId,
    targetPageMeta,
    sourcePageId,
    sourcePageMeta,
    onComplete
  } = options
  // Goto root page, resume scroll position (Only appears in backward)
  let rootPageScrollPosition = 0
  fixRootPageScroll(shell, {targetPageId})
  if (targetPageId === window.MIP.viewer.page.pageId) {
    rootPageScrollPosition = shell.rootPageScrollPosition
  }

  let iframe = getIFrame(sourcePageId)
  // If source page is root page, skip transition
  if (!iframe) {
    document.documentElement.classList.add('mip-no-scroll')
    window.MIP.viewer.page.getElementsInRootPage().forEach(e => e.classList.add('hide'))

    onComplete && onComplete()

    let targetIFrame = getIFrame(targetPageId)
    if (targetIFrame) {
      activeZIndex -= 2
      css(targetIFrame, 'z-index', activeZIndex++)
    }

    shell.afterSwitchPage(options)
    return
  }

  // Moving out only needs header, not loading body
  let loading = getLoading(sourcePageMeta, {
    onlyHeader: true,
    transitionContainsHeader: shell.transitionContainsHeader
  })
  let headerLogoTitle
  let fadeHeader

  if (shell.transitionContainsHeader) {
    css(loading, 'display', 'block')
  } else {
    headerLogoTitle = document.querySelector('.mip-shell-header-wrapper .mip-shell-header-logo-title')
    headerLogoTitle && headerLogoTitle.classList.add('fade-out')
    fadeHeader = getFadeHeader(targetPageMeta, sourcePageMeta)
    css(fadeHeader, 'display', 'block')
  }

  iframe.classList.add('slide-leave', 'slide-leave-active')
  if (shell.transitionContainsHeader) {
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
    if (shell.transitionContainsHeader) {
      loading.classList.remove('slide-leave-to', 'slide-leave-active')
      css(loading, 'display', 'none')
    } else {
      fadeHeader.classList.remove('fade-enter-to', 'fade-enter')
    }

    onComplete && onComplete()

    let targetIFrame = getIFrame(targetPageId)
    if (targetIFrame) {
      activeZIndex -= 2
      css(targetIFrame, 'z-index', activeZIndex++)
    }

    shell.afterSwitchPage(options)
  })

  nextFrame(() => {
    iframe.classList.add('slide-leave-to')
    iframe.classList.remove('slide-leave')
    if (shell.transitionContainsHeader) {
      loading.classList.add('slide-leave-to')
      loading.classList.remove('slide-leave')
    } else {
      fadeHeader.classList.add('fade-enter-to')
      fadeHeader.classList.remove('fade-enter')
    }
  })
}

/**
 * Forward transition
 *
 * @param {Object} shell shell instance
 * @param {Object} options
 * @param {string} options.targetPageId targetPageId
 * @param {Object} options.targetPageMeta pageMeta of target page
 * @param {string} options.sourcePageId sourcePageId
 * @param {Object} options.sourcePageMeta pageMeta of source page
 * @param {boolean} options.newPage whether a new iframe should be created (false)
 * @param {boolean} options.isForward whether transition direction is forward (true)
 * @param {Function} options.onComplete complete callback
 */
function forwardTransition (shell, options) {
  let {sourcePageId, targetPageId, targetPageMeta, onComplete} = options
  let iframe = getIFrame(targetPageId)
  let rootPageScrollPosition = 0
  if (sourcePageId === window.MIP.viewer.page.pageId) {
    rootPageScrollPosition = shell.rootPageScrollPosition
  }
  css(iframe, {
    display: 'block',
    opacity: 1,
    'z-index': activeZIndex++,
    top: rootPageScrollPosition + 'px'
  })
  iframe.classList.add('slide-enter', 'slide-enter-active')

  let headerLogoTitle
  let fadeHeader
  if (!shell.transitionContainsHeader) {
    headerLogoTitle = document.querySelector('.mip-shell-header-wrapper .mip-shell-header-logo-title')
    headerLogoTitle && headerLogoTitle.classList.add('fade-out')
    fadeHeader = getFadeHeader(targetPageMeta)
    fadeHeader.classList.add('fade-enter', 'fade-enter-active')
    css(fadeHeader, 'display', 'block')
  }

  whenTransitionEnds(iframe, 'transition', () => {
    iframe.classList.remove('slide-enter-to', 'slide-enter-active')
    if (!shell.transitionContainsHeader) {
      fadeHeader.classList.remove('fade-enter-to', 'fade-enter-active')
    }

    hideAllIFrames()
    fixRootPageScroll(shell, {sourcePageId, targetPageId})
    css(iframe, 'top', 0)
    onComplete && onComplete()

    shell.afterSwitchPage(options)
  })

  nextFrame(() => {
    iframe.classList.add('slide-enter-to')
    iframe.classList.remove('slide-enter')
    if (!shell.transitionContainsHeader) {
      fadeHeader.classList.add('fade-enter-to')
      fadeHeader.classList.remove('fade-enter')
    }
  })
}

/**
 * Backward transition
 *
 * @param {Object} shell shell instance
 * @param {Object} options
 * @param {string} options.targetPageId targetPageId
 * @param {Object} options.targetPageMeta pageMeta of target page
 * @param {string} options.sourcePageId sourcePageId
 * @param {Object} options.sourcePageMeta pageMeta of source page
 * @param {boolean} options.newPage whether a new iframe should be created (false)
 * @param {boolean} options.isForward whether transition direction is forward (true)
 * @param {Function} options.onComplete complete callback
 */
function backwardTransition (shell, options) {
  let {
    targetPageId,
    targetPageMeta,
    sourcePageId,
    sourcePageMeta,
    onComplete
  } = options

  let targetIFrame = getIFrame(targetPageId)
  if (targetIFrame) {
    activeZIndex -= 2
    css(targetIFrame, {
      opacity: 1,
      display: 'block',
      'z-index': activeZIndex++
    })
  }

  // Goto root page, resume scroll position (Only appears in backward)
  let rootPageScrollPosition = 0
  fixRootPageScroll(shell, {targetPageId})
  if (targetPageId === window.MIP.viewer.page.pageId) {
    rootPageScrollPosition = shell.rootPageScrollPosition
  }

  let iframe = getIFrame(sourcePageId)
  // If source page is root page, skip transition
  if (!iframe) {
    document.documentElement.classList.add('mip-no-scroll')
    window.MIP.viewer.page.getElementsInRootPage().forEach(e => e.classList.add('hide'))

    onComplete && onComplete()
    shell.afterSwitchPage(options)
    return
  }

  // Moving out only needs header, not loading body
  let loading = getLoading(sourcePageMeta, {
    onlyHeader: true,
    transitionContainsHeader: shell.transitionContainsHeader
  })
  let headerLogoTitle
  let fadeHeader

  if (shell.transitionContainsHeader) {
    css(loading, 'display', 'block')
  } else {
    headerLogoTitle = document.querySelector('.mip-shell-header-wrapper .mip-shell-header-logo-title')
    headerLogoTitle && headerLogoTitle.classList.add('fade-out')
    fadeHeader = getFadeHeader(targetPageMeta, sourcePageMeta)
    css(fadeHeader, 'display', 'block')
  }

  iframe.classList.add('slide-leave', 'slide-leave-active')
  if (shell.transitionContainsHeader) {
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
    if (shell.transitionContainsHeader) {
      loading.classList.remove('slide-leave-to', 'slide-leave-active')
      css(loading, 'display', 'none')
    } else {
      fadeHeader.classList.remove('fade-enter-to', 'fade-enter')
    }

    onComplete && onComplete()
    shell.afterSwitchPage(options)
  })

  nextFrame(() => {
    iframe.classList.add('slide-leave-to')
    iframe.classList.remove('slide-leave')
    if (shell.transitionContainsHeader) {
      loading.classList.add('slide-leave-to')
      loading.classList.remove('slide-leave')
    } else {
      fadeHeader.classList.add('fade-enter-to')
      fadeHeader.classList.remove('fade-enter')
    }
  })
}

/**
 * Skip transition and create new iframe
 *
 * @param {Object} shell shell instance
 * @param {Object} options
 * @param {string} options.targetPageId targetPageId
 * @param {Object} options.targetPageMeta pageMeta of target page
 * @param {string} options.sourcePageId sourcePageId
 * @param {Object} options.sourcePageMeta pageMeta of source page
 * @param {boolean} options.newPage whether a new iframe should be created (false)
 * @param {boolean} options.isForward whether transition direction is forward (true)
 * @param {Function} options.onComplete complete callback
 */
function skipTransitionAndCreate (shell, options) {
  let {sourcePageId, targetPageId, onComplete} = options

  hideAllIFrames()
  fixRootPageScroll(shell, {sourcePageId, targetPageId})
  onComplete && onComplete()

  let iframe = getIFrame(targetPageId)
  css(iframe, 'z-index', activeZIndex++)

  shell.afterSwitchPage(options)
}

/**
 * Skip transition
 *
 * @param {Object} shell shell instance
 * @param {Object} options
 * @param {string} options.targetPageId targetPageId
 * @param {Object} options.targetPageMeta pageMeta of target page
 * @param {string} options.sourcePageId sourcePageId
 * @param {Object} options.sourcePageMeta pageMeta of source page
 * @param {boolean} options.newPage whether a new iframe should be created (false)
 * @param {boolean} options.isForward whether transition direction is forward (true)
 * @param {Function} options.onComplete complete callback
 */
function skipTransition (shell, options) {
  // Currently act the same as skipTransitionAndCreate
  // This can be extended by sub-shell which executes different operations
  skipTransitionAndCreate(shell, options)
}


/**
 * Disable scrolling of root page when covered by an iframe
 * NOTE: it doesn't work in iOS, see `_lockBodyScroll()` in viewer.js
 */
function fixRootPageScroll (shell, {sourcePageId, targetPageId} = {}) {
  let page = window.MIP.viewer.page
  if (sourcePageId === page.pageId) {
    document.documentElement.classList.add('mip-no-scroll')
    page.getElementsInRootPage().forEach(e => e.classList.add('hide'))
  }
  if (targetPageId === page.pageId) {
    document.documentElement.classList.remove('mip-no-scroll')
    page.getElementsInRootPage().forEach(e => e.classList.remove('hide'))
    shell.restoreScrollPosition()
  }
}
