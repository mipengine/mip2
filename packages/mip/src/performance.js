/**
 * @file performance
 * @author sekiyika(pengxing@baidu.com)
 */

import util from './util/index'
import viewer from './viewer'

const EventEmitter = util.EventEmitter

/**
 * Store first-screen elements.
 * @inner
 */
let fsElements = []

/**
 * Locked flag of fsElements.
 * @inner
 */
let fsElementsLocked = false

/**
 * Start flag. This will be runned only once.
 * @inner
 */
let isStart = false

/**
 * Record time.
 * @inner
 */
let recorder = {}

/**
 * Event for updating timing.
 * @inner
 */
let performanceEvent = new EventEmitter()

/**
 * Add first-screen element.
 *
 * @param {HTMLElement} element html element
 */
function addFsElement (element) {
  if (!fsElementsLocked) {
    fsElements.push(element)
  }
}

/**
 * Remove element from fsElements.
 *
 * @param {HTMLElement} element html element
 */
function removeFsElement (element) {
  let index = fsElements.indexOf(element)
  if (index !== -1) {
    fsElements.splice(index, 1)
  }
}

/**
 * Get the timings.
 *
 * @return {Object}
 */
function getTiming () {
  let nativeTiming
  let performance = window.performance
  if (performance && performance.timing) {
    nativeTiming = performance.timing.toJSON
      ? performance.timing.toJSON()
      : util.fn.extend({}, performance.timing)
  } else {
    nativeTiming = {}
  }
  return util.fn.extend(nativeTiming, recorder)
}

/**
 * Record timing by name.
 *
 * @param {string} name Name of the timing.
 * @param {?number} timing timing
 */
function recordTiming (name, timing) {
  recorder[name] = parseInt(timing, 10) || Date.now()
  performanceEvent.trigger('update', getTiming())
}

/**
 * Try recording first-screen loaded.
 */
function tryRecordFirstScreen () {
  if (recorder.MIPFirstScreen) {
    return
  }
  fsElements.length === 0 && recordTiming('MIPFirstScreen')
}

/**
 * Record dom loaded timing.
 */
function domLoaded () {
  recordTiming('MIPDomContentLoaded')
  setTimeout(() => {
    fsElements = fsElements.filter(ele => ele.inViewport())
    // Lock the fsElements. No longer add fsElements.
    fsElementsLocked = true
    tryRecordFirstScreen()
  }, 10)
}

/**
 * First screen element loaded.
 *
 * @param {HTMLElement} element htmlElement
 */
function fsElementLoaded (element) {
  removeFsElement(element)
  tryRecordFirstScreen()
}

/**
 * Start.
 *
 * @param {number} startTiming The MIP start timing.
 */
function start (startTiming) {
  if (isStart) {
    return
  }
  isStart = true
  recordTiming('MIPStart', startTiming)
  viewer.on('show', showTiming => {
    recordTiming('MIPPageShow', showTiming)
  })

  if (document.readyState === 'complete') {
    domLoaded()
  } else {
    document.addEventListener('DOMContentLoaded', domLoaded, false)
  }
}

export default {
  start,
  addFsElement,
  fsElementLoaded,
  getTiming,
  recordTiming,
  on () {
    performanceEvent.on.apply(performanceEvent, arguments)
  }
}
