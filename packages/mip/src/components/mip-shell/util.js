/**
 * @file MIP Shell utils
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css'
import {
  whenTransitionEnds,
  nextFrame
} from '../../page/util/dom'

/**
 * convert pattern to regexp
 * @param {string} pattern pattern string
 * @return {Regexp} regexp
 */
export function convertPatternToRegexp (pattern) {
  if (pattern === '*') {
    return /.*/
  }
  return new RegExp(pattern)
}

// =================== DOM related ===================
/* istanbul ignore next */
function renderMoreButton ({name, text, link} = {}) {
  if (!name || !text) {
    return
  }

  return `
    <div class="mip-shell-button" mip-header-btn data-button-name="${name}">
      ${link ? `<a mip-link href="${link}">${text}</a>` : text}
    </div>
  `
}

/**
 * Create wrapper for more button in header
 *
 * @param {Array<Object>} buttonGroup configures for buttonGroup
 * @param {Object} options options
 * @param {boolean} options.update If this is an update operation
 */
export /* istanbul ignore next */ function createMoreButtonWrapper (buttonGroup, options = {}) {
  if (!Array.isArray(buttonGroup)) {
    buttonGroup = []
  }

  let renderButtonWrapper = (buttonWrapper) => {
    let buttonGroupHTMLArray = []
    buttonGroup.forEach(button => {
      let tmp = renderMoreButton(button)
      tmp && buttonGroupHTMLArray.push(tmp)
    })

    css(buttonWrapper, 'height', 48 * buttonGroupHTMLArray.length)
    buttonWrapper.innerHTML = buttonGroupHTMLArray.join('')
  }
  let mask
  let buttonWrapper

  if (options.update) {
    mask = document.querySelector('.mip-shell-more-button-mask')
    buttonWrapper = document.querySelector('.mip-shell-more-button-wrapper')
    renderButtonWrapper(buttonWrapper)
  } else {
    mask = document.createElement('mip-fixed')
    mask.classList.add('mip-shell-more-button-mask')
    document.body.appendChild(mask)

    buttonWrapper = document.createElement('mip-fixed')
    buttonWrapper.classList.add('mip-shell-more-button-wrapper')
    renderButtonWrapper(buttonWrapper)
    document.body.appendChild(buttonWrapper)
  }

  return {mask, buttonWrapper}
}

/**
 * Create page mask to cover header
 * Mainly used in dialog within iframes
 */
export /* istanbul ignore next */ function createPageMask () {
  let mask = document.createElement('mip-fixed')
  mask.classList.add('mip-shell-header-mask')
  document.body.appendChild(mask)

  return mask
}

/**
 * Toggle something
 *
 * @param {HTMLElement} element
 * @param {boolean} toggle
 * @param {Object} options
 * @param {boolean} options.skipTransition Show result without transition
 * @param {boolean} options.transitionName Transition name. Defaults to 'fade'
 */
export /* istanbul ignore next */ function toggleInner (element, toggle, {skipTransition, transitionName = 'fade'} = {}) {
  if (skipTransition) {
    css(element, 'display', toggle ? 'block' : 'none')
    return
  }
  let display = element.style.display
  if ((toggle && display === 'block') ||
    (!toggle && display === 'none')) {
    return
  }

  let direction = toggle ? 'enter' : 'leave'
  element.classList.add(`${transitionName}-${direction}`, `${transitionName}-${direction}-active`)
  css(element, 'display', 'block')
  // trigger layout
  /* eslint-disable no-unused-expressions */
  element.offsetWidth
  /* eslint-enable no-unused-expressions */

  whenTransitionEnds(element, 'transition', () => {
    element.classList.remove(`${transitionName}-${direction}-to`, `${transitionName}-${direction}-active`)
    css(element, 'display', toggle ? 'block' : 'none')
  })

  nextFrame(() => {
    element.classList.add(`${transitionName}-${direction}-to`)
    element.classList.remove(`${transitionName}-${direction}`)
  })
}
