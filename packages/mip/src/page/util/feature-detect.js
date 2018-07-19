/**
 * Passive event listeners
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
let supportsPassiveFlag = false
try {
  let opts = Object.defineProperty({}, 'passive', {
    get: function () {
      supportsPassiveFlag = true
    }
  })
  window.addEventListener('testPassive', null, opts)
  window.removeEventListener('testPassive', null, opts)
} catch (e) {}
export const supportsPassive = supportsPassiveFlag

/**
 * transition & animation end event
 */
let transitionEndEventName = 'transitionend'
let animationEndEventName = 'animationend'

/* istanbul ignore next */
if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
  transitionEndEventName = 'webkitTransitionEnd'
}
/* istanbul ignore next */
if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
  animationEndEventName = 'webkitAnimationEnd'
}
export const transitionEndEvent = transitionEndEventName
export const animationEndEvent = animationEndEventName

/**
 * raf
 */
export const raf = window.requestAnimationFrame
  ? window.requestAnimationFrame.bind(window)
  : /* istanbul ignore next */setTimeout

export function isPortrait () {
  return window.innerHeight > window.innerWidth
}
