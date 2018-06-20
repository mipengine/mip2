/**
 * @file MIP Shell utils
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css'
import {
  whenTransitionEnds,
  nextFrame
} from '../../page/util/dom'

export function convertPatternToRegexp (pattern) {
  if (pattern === '*') {
    return /.*/
  }
  return new RegExp(pattern)
}

// =================== DOM related ===================

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
export function createMoreButtonWrapper (buttonGroup, options = {}) {
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
    mask = document.createElement('div')
    mask.classList.add('mip-shell-more-button-mask')
    document.body.appendChild(mask)

    buttonWrapper = document.createElement('div')
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
export function createPageMask () {
  let mask = document.createElement('div')
  mask.classList.add('mip-shell-header-mask')
  document.body.appendChild(mask)

  return mask
}

export function toggleInner (element, toggle, skipTransition) {
  if (skipTransition) {
    css(element, 'display', toggle ? 'block' : 'none')
    return
  }

  let direction = toggle ? 'enter' : 'leave'
  element.classList.add(`fade-${direction}`, `fade-${direction}-active`)
  css(element, 'display', 'block')
  // trigger layout
  /* eslint-disable no-unused-expressions */
  element.offsetWidth
  /* eslint-enable no-unused-expressions */

  whenTransitionEnds(element, 'transition', () => {
    element.classList.remove(`fade-${direction}-to`, `fade-${direction}-active`)
    css(element, 'display', toggle ? 'block' : 'none')
  })

  nextFrame(() => {
    element.classList.add(`fade-${direction}-to`)
    element.classList.remove(`fade-${direction}`)
  })
}
