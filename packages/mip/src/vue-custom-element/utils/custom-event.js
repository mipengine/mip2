/**
 * @file custom-event.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

/* global CustomEvent */

export default function customEvent (eventName, detail) {
  const params = {bubbles: false, cancelable: false, detail}
  let event
  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(eventName, params)
  } else {
    event = document.createEvent('CustomEvent')
    event.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail)
  }

  return event
}

export function customEmit (element, eventName, ...args) {
  const event = customEvent(eventName, [...args])
  element.dispatchEvent(event)
}
