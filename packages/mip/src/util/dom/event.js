/**
 * @file event
 * @author sekiyika(pengxing@baidu.com)
 */

import dom from './dom'

function delegate (element, selector, event, handler, capture) {
  capture = !!capture
  function eventHandler (event) {
    let target = event.target
    let parent = dom.closestTo(target, selector, this)
    if (parent) {
      handler.call(parent, event)
    }
  }
  element.addEventListener(event, eventHandler, capture)
  return () => {
    element.removeEventListener(event, eventHandler)
    /* eslint-disable */
    eventHandler = element = handler = null;
    /* eslint-enable */
  }
}

/**
 * Object for getting event's type.
 *
 * @inner
 * @type {Object}
 */
let specialEvents = {}
specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

/**
 * Create a event object to dispatch
 *
 * @param {string} type Event name
 * @param {?Object} data Custom data
 * @return {Event}
 */
function createEvent (type, data) {
  let event = document.createEvent(specialEvents[type] || 'Event')
  event.initEvent(type, true, true)
  data && (event.data = data)
  return event
}

function listen (element, eventType, listener, options) {
  element.addEventListener(eventType, listener, options)
  return () => element.removeEventListener(eventType, listener)
}

/**
 * Listens for the specified event on the element and removes the listener
 * as soon as event has been received.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} optEvtListenerOpts
 * @return {!UnlistenDef}
 */
function listenOnce (element, eventType, listener, optEvtListenerOpts) {
  let unlisten = listen(element, eventType, event => {
    unlisten()
    listener(event)
  }, optEvtListenerOpts)
  return unlisten
}

/**
 * Whether the specified element/window has been loaded already.
 * @param {!Element|!Window} eleOrWindow
 * @return {boolean}
 */
function isLoaded (eleOrWindow) {
  return !!(eleOrWindow.complete || eleOrWindow.readyState === 'complete' ||
    // If the passed in thing is a Window, infer loaded state from
    (eleOrWindow.document && eleOrWindow.document.readyState === 'complete'))
}

/**
 * Returns a promise that will resolve or fail based on the eleOrWindow's 'load'
 * and 'error' events. Optionally this method takes a timeout, which will reject
 * the promise if the resource has not loaded by then.
 * @param {T} eleOrWindow Supports both Elements and as a special case Windows.
 * @return {!Promise<T>}
 * @template T
 */
function loadPromise (eleOrWindow) {
  if (isLoaded(eleOrWindow)) {
    return Promise.resolve(eleOrWindow)
  }

  let loadingPromise = new Promise((resolve, reject) => {
    // Listen once since IE 5/6/7 fire the onload event continuously for
    // animated GIFs.
    let {tagName} = eleOrWindow
    if (tagName === 'AUDIO' || tagName === 'VIDEO') {
      listenOnce(eleOrWindow, 'loadstart', resolve)
    } else {
      listenOnce(eleOrWindow, 'load', resolve)
    }
    // For elements, unlisten on error (don't for Windows).
    if (tagName) {
      listenOnce(eleOrWindow, 'error', reject)
    }
  })

  return loadingPromise
}

export default {
  delegate,
  create: createEvent,
  loadPromise,
  listenOnce,
  listen
}
