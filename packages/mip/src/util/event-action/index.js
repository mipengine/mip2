/**
 * @file event-action.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */

// import * as fn from './fn'
import dom from '../dom/dom'
// import {LAYOUT, getLayoutClass} from '../layout'
// import log from './log'
// import {handleScrollTo} from '../page/util/ease-scroll'
import {parse} from './parser'

// const logger = log('Event-Action')

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
class EventAction {

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
          // MIP: this.globalTargets.MIP,
          target: target
        })
        target = target.parentElement
        if (!target) {
          return
        }
      }
      target = dom.closest(target, attrSelector)
    } while (target)
  }
}

export default EventAction
