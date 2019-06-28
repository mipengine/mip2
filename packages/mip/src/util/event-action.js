/**
 * @file event-action.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */

// import * as fn from './fn'
import dom from './dom/dom'
// import {LAYOUT, getLayoutClass} from '../layout'
// import log from './log'
// import {handleScrollTo} from '../page/util/ease-scroll'
import parser from './parser/index'

const EVENT_FN_STORE = {}

function parse (str) {
  if (!EVENT_FN_STORE[str]) {
    let fn = parser.transform(str)
    if (fn) {
      EVENT_FN_STORE[str] = fn
    }
  }
  return EVENT_FN_STORE[str]
}


/**
 * MIP does not support external JavaScript, so we provide EventAction to trigger events between elements.
 * TODO: refactor
 *
 * @class
 */
class EventAction {

  constructor() {
    this.attr = 'on'
    // this.globalTargets = {}
    // this.installAction()
  }

  /**
   * Install global action. such as on=tap:MIP.setData
   */
  // installAction () {
  //   this.addGlobalTarget('MIP', this.handleMIPTarget)
  // }

  /**
   * Handle global action
   *
   * @param {Object} action event action
   */
  // handleMIPTarget ({handler, arg, target, event}) {
  //   /* istanbul ignore next */
  //   if (!handler) {
  //     return
  //   }

  //   switch (handler) {
  //     case 'setData':
  //       MIP.setData(...arg)  
  //       break
  //     case '$set':
  //       MIP.$set(...arg)
  //       break
  //     case 'scrollTo':
  //       MIP.scrollTo(...arg)
  //       break
  //     case 'goBack':
  //       MIP.goBack()
  //       break
  //     case 'navigateTo':
  //       MIP.navigateTo(...arg)
  //       break
  //     case 'closeOrNavigateTo':
  //       MIP.closeOrNavigateTo(...arg)
  //       break
  //     case 'print':
  //       window.print()
  //       break
  //     default:
  //       throw new Error(`Can not find handler "${handler}" from MIP.`)
  //   }
  // }

  /**
   * Add global target in order to event
   *
   * @param {string} name name
   * @param {Function} handler handler
   */
  // addGlobalTarget (name, handler) {
  //   /* istanbul ignore next */
  //   if (!name) {
  //     return
  //   }
  //   this.globalTargets[name] = handler
  // }

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
