/**
 * @file DOM 相关的方法
 * @author wangyisheng@baidu.com (wangyisheng)
 */
/* istanbul ignore file */

import css from '../../util/dom/css'
import {
  whenTransitionEnds,
  nextFrame,
  setHeaderColor,
  BACK_BUTTON_SVG
} from '../../page/util/dom'
import event from '../../util/dom/event'
import {supportsPassive} from '../../page/util/feature-detect'

const MORE_BUTTON_SVG = [
  '<svg t="1530857985972" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3393"',
    'xmlns:xlink="http://www.w3.org/1999/xlink">',
    '<path d="M128 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3394" fill="currentColor"></path>',
    '<path d="M512 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3395" fill="currentColor"></path>',
    '<path d="M896 512m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" p-id="3396" fill="currentColor"></path>',
  '</svg>'
].join('')
const CLOSE_BUTTON_SVG = [
  '<svg t="1530857971603" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2953"',
    'xmlns:xlink="http://www.w3.org/1999/xlink">',
    '<path  fill="currentColor" d="M586.026667 533.248l208.789333-208.576c9.856-8.874667 15.488-21.248 15.850667-34.858667a53.717333 53.717333 0 0 0-15.829334-39.146666 48.042667 48.042667 0 0 0-36.224-15.872c-14.165333 0-27.584 5.632-37.802666 15.850666L512 459.221333l-208.789333-208.576a48.042667 48.042667 0 0 0-36.245334-15.850666c-14.144 0-27.562667 5.632-37.781333 15.850666A48.085333 48.085333 0 0 0 213.333333 285.504a53.717333 53.717333 0 0 0 15.850667 39.168l208.789333 208.576-208.576 208.853333a48.085333 48.085333 0 0 0-15.850666 34.88 53.717333 53.717333 0 0 0 15.850666 39.146667c9.194667 10.24 22.058667 15.872 36.224 15.872 14.144 0 27.562667-5.632 37.802667-15.850667L512 607.274667l208.597333 208.853333c9.216 10.24 22.08 15.872 36.224 15.872s27.584-5.632 37.802667-15.850667c9.856-8.874667 15.488-21.269333 15.850667-34.88a53.717333 53.717333 0 0 0-15.850667-39.146666l-208.597333-208.853334z"',
      'p-id="2954"></path>',
  '</svg>'
].join('')
const MIP_SHELL_HEADER = 'mip-shell-header'
const MIP_SHELL_HEADER_BUTTON_GROUP = MIP_SHELL_HEADER + '-button-group'
const MIP_SHELL_HEADER_BUTTON_GROUP_STANDALONE = MIP_SHELL_HEADER_BUTTON_GROUP + '-standalone'
const MIP_HEADER_BTN = 'mip-header-btn'
const DATA_BUTTON_NAME = 'data-button-name'

function getSVGWrapper(type, standalone) {
  if (standalone) {
    return [
      `<div class="${MIP_SHELL_HEADER_BUTTON_GROUP_STANDALONE}" ${MIP_HEADER_BTN} ${DATA_BUTTON_NAME}="${type}">`,
        type === 'more' ? MORE_BUTTON_SVG : CLOSE_BUTTON_SVG,
      '</div>'
    ].join('')
  }

  return [
    `<div class="button ${type}" ${MIP_HEADER_BTN} ${DATA_BUTTON_NAME}="${type}">`,
      type === 'more' ? MORE_BUTTON_SVG : CLOSE_BUTTON_SVG,
    '</div>'
  ].join('')
}

function renderMoreButton ({name, text, link} = {}) {
  if (!name || !text) {
    return
  }

  return [
    `<div class="mip-shell-button" mip-header-btn data-button-name="${name}">`,
      `${link ? `<a mip-link href="${link}">${text}</a>` : text}`,
    '</div>'
  ].join('')
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

  let mask = document.querySelector('.mip-shell-more-button-mask')
  let buttonWrapper = document.querySelector('.mip-shell-more-button-wrapper')

  if (!mask && !buttonWrapper) {
    mask = document.createElement('mip-fixed')
    mask.classList.add('mip-shell-more-button-mask')
    document.body.appendChild(mask)

    buttonWrapper = document.createElement('mip-fixed')
    buttonWrapper.classList.add('mip-shell-more-button-wrapper')
    renderButtonWrapper(buttonWrapper)
    document.body.appendChild(buttonWrapper)
  } else {
    renderButtonWrapper(buttonWrapper)
  }

  return {mask, buttonWrapper}
}

/**
 * Create page mask to cover header
 * Mainly used in dialog within iframes
 */
export function createPageMask () {
  let mask = document.createElement('mip-fixed')
  mask.classList.add(MIP_SHELL_HEADER + '-mask')
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
export function toggleInner (element, toggle, {skipTransition, transitionName = 'fade'} = {}) {
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

/**
 * Render shell header
 *
 * @param {Object} shell MIP shell instance
 * @param {HTMLElement} container container of shell header
 */
export function renderHeader (shell, container) {
  let pageMeta = shell.currentPageMeta
  let {
    buttonGroup,
    title = '',
    logo,
    color = '#000000',
    borderColor,
    backgroundColor = '#ffffff'
  } = pageMeta.header

  if (shell.priorTitle && !shell.alwaysUseTitleInShellConfig) {
    title = pageMeta.header.title = shell.priorTitle
  }
  let showBackIcon = !pageMeta.view.isIndex

  // 为了代码体积考虑，拼接 HTML 代码看起来比较复杂
  let headerHTML = ''
  if (showBackIcon) {
    headerHTML += [
      `<a href="javascript:void(0)" class="back-button" ${MIP_HEADER_BTN} ${DATA_BUTTON_NAME}="back">`,
        BACK_BUTTON_SVG,
      '</a>'
    ].join('')
  }
  headerHTML += [
    `<div class="${MIP_SHELL_HEADER}-logo-title">`,
      `${logo ? `<img class="${MIP_SHELL_HEADER}-logo" src="${logo}">` : ''}`,
      `<span class="${MIP_SHELL_HEADER}-title">${title}</span>`,
    '</div>'
  ].join('')

  let moreFlag = Array.isArray(buttonGroup) && buttonGroup.length > 0
  let closeFlag = !window.MIP.standalone && shell.showHeaderCloseButton()

  if (moreFlag && closeFlag) {
    // more & close
    headerHTML += [
      `<div class="${MIP_SHELL_HEADER_BUTTON_GROUP}">`,
        getSVGWrapper('more'),
        '<div class="split"></div>',
        getSVGWrapper('close'),
      '</div>'
    ].join('')
  } else if (moreFlag && !closeFlag) {
    // only more
    headerHTML += getSVGWrapper('more', true)
  } else if (!moreFlag && closeFlag) {
    // only close
    headerHTML += getSVGWrapper('close', true)
  }

  container.innerHTML = headerHTML

  // Set color & borderColor & backgroundColor
  setHeaderColor(container, container, color, backgroundColor, borderColor)
}

export function bindHeaderEvents (shell) {
  // Delegate header
  shell.headerEventHandler = event.delegate(shell.$el, '[mip-header-btn]', 'click', function (e) {
    let buttonName = this.dataset.buttonName
    shell.handleClickHeaderButton(buttonName)
  })

  // Delegate dropdown button
  shell.buttonEventHandler = event.delegate(shell.$buttonWrapper, '[mip-header-btn]', 'click', function (e) {
    let buttonName = this.dataset.buttonName
    shell.handleClickHeaderButton(buttonName)

    // Fix buttonGroup with 'link' config
    let children = this.children && this.children[0]
    if (children && children.tagName.toLowerCase() === 'a' && children.hasAttribute('mip-link')) {
      shell.toggleDropdown(false)
    }
  })

  let fadeHeader = document.querySelector('#mip-page-fade-header-wrapper')
  if (fadeHeader) {
    shell.fadeHeaderEventHandler = event.delegate(fadeHeader, '[mip-header-btn]', 'click', function (e) {
      if (this.dataset.buttonName === 'back') {
        window.MIP_SHELL_OPTION.allowTransition = true
        window.MIP_SHELL_OPTION.isForward = false
        window.MIP.viewer.page.back()
      }
    })
  }

  if (shell.$buttonMask) {
    shell.$buttonMask.addEventListener('click', () => shell.toggleDropdown(false))
    shell.$buttonMask.addEventListener('touchmove',
      e => e.preventDefault(),
      supportsPassive ? {passive: false} : false)
  }
}

export function unbindHeaderEvents (shell) {
  if (shell.headerEventHandler) {
    shell.headerEventHandler()
    shell.headerEventHandler = undefined
  }

  if (shell.buttonEventHandler) {
    shell.buttonEventHandler()
    shell.buttonEventHandler = undefined
  }

  if (shell.fadeHeaderEventHandler) {
    shell.fadeHeaderEventHandler()
    shell.fadeHeaderEventHandler = undefined
  }
}
