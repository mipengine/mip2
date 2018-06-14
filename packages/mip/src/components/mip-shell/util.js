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
 * @param {Object} options
 * @param {Array<Object>} options.buttonGroup configures for buttonGroup. This will be ignored when xiongzhang = true
 * @param {boolean} options.xiongzhang enables xiongzhanghao or not
 */
export function createMoreButtonWrapper (buttonGroup) {
  if (!Array.isArray(buttonGroup)) {
    return
  }

  let mask = document.createElement('div')
  mask.classList.add('mip-shell-more-button-mask')
  document.body.appendChild(mask)

  let buttonWrapper = document.createElement('div')
  buttonWrapper.classList.add('mip-shell-more-button-wrapper')

  let buttonGroupHTMLArray = []
  buttonGroup.forEach(button => {
    let tmp = renderMoreButton(button)
    tmp && buttonGroupHTMLArray.push(tmp)
  })

  css(buttonWrapper, 'height', 48 * buttonGroupHTMLArray.length)
  buttonWrapper.innerHTML = buttonGroupHTMLArray.join('')
  document.body.appendChild(buttonWrapper)

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
