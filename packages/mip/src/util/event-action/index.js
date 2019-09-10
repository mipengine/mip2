/**
 * @file event-action.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */

import dom from '../dom/dom'
import {parse} from './parser'

/**
 * Key list of picking options.
 * @const
 * @inner
 * @type {Array}
 */
// const OPTION_KEYS = ['executeEventAction', 'parse', 'checkTarget', 'getTarget', 'attr']


/**
 * MIP does not support external JavaScript, so we provide EventAction to trigger events between elements.
 * TODO: refactor
 *
 * @class
 */
export default class EventAction {

  constructor () {
    this.attr = 'on'
  }

  /**
   * Execute the event-action.
   *
   * @param {string} type The event's type
   * @param {HTMLElement} target The source element of native event.
   * @param {Event} nativeEvent The native event.
   */
  execute (type, target, nativeEvent) {
    if (!target) {
      return
    }
    let attr
    let attrSelector = '[' + this.attr + ']'

    do {
      attr = target.getAttribute(this.attr)
      if (attr) {
        const fn = parse(attr)
        fn({
          event: nativeEvent,
          eventName: type,
          target: target
        })
        target = target.parentElement
        /* istanbul ignore if */
        if (!target) {
          return
        }
      }
      target = dom.closest(target, attrSelector)
    } while (target)
  }
}


