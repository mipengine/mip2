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

// const logger = log('Event-Action')

/**
 * Regular for parsing params.
 * @const
 * @inner
 * @type {RegExp}
 */
const PARSE_REG = /^(\w+):\s*([\w-]+)\.([\w-$]+)(?:\((.+)\))?$/

/**
 * Regular for parsing event arguments.
 * @const
 * @inner
 * @type {RegExp}
 */
const EVENT_ARG_REG = /^event(\.[a-zA-Z_][\w_]*)+$/g
// const EVENT_ARG_REG_FOR_OBJECT = /(:\s*)(event(\.[a-zA-Z]\w+)+)(\s*[,}])/g

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

  constructor() {
    // constructor (opt) {
    // opt && fn.extend(this, fn.pick(opt, OPTION_KEYS))
    this.attr = 'on'
    this.globalTargets = {}
    this.fns = {}

    this.installAction()
  }

  /**
   * Install global action. such as on=tap:MIP.setData
   */
  installAction () {
    this.addGlobalTarget('MIP', this.handleMIPTarget)
  }

  /**
   * Handle global action
   *
   * @param {Object} action event action
   */
  handleMIPTarget (action) {
    /* istanbul ignore next */
    if (!action) {
      return
    }

    let target = action.event && action.event.target ? action.event.target : {}

    // const allowedGlobals = (
    //   'Infinity,undefined,NaN,isFinite,isNaN,' +
    //   'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    //   'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    //   'm' // MIP global data
    // ).split(',')

    // let hasProxy = typeof Proxy !== 'undefined'
    // let proxy = hasProxy ? new Proxy({
    //   DOM: target
    // }, {
    //   has (target, key) {
    //     let allowed = allowedGlobals.indexOf(key) >= 0
    //     return target[key] || !allowed
    //   }
    // }) : {}

    // let fn = new Function('DOM', `with(this){return ${action.arg}}`) // eslint-disable-line
    // let data = fn.call(Object.assign(proxy, action))

    if (action.handler === 'setData') {
      MIP.setData(...action.args)
    } else if (action.handler === '$set') {
      MIP.$set(data)
    } else if (action.handler === 'scrollTo') {
      MIP.scrollTo(...action.args)
    } else if (action.handler === 'goBack') {
      MIP.goBack()
    } else if (action.handler === 'navigateTo') {
      MIP.navigateTo(data)
    } else if (action.handler === 'closeOrNavigateTo') {
      MIP.closeOrNavigateTo(data)
    } else if (action.handler === 'print') {
      window.print()
    } else {
      throw new Error(`Can not find handler "${action.handler}" from MIP.`)
    }
  }

  /**
   * Add global target in order to event
   *
   * @param {string} name name
   * @param {Function} handler handler
   */
  addGlobalTarget (name, handler) {
    /* istanbul ignore next */
    if (!name) {
      return
    }
    this.globalTargets[name] = handler
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
        // this._execute(this.parse(attr, type, nativeEvent))
        let fn = this.fns[attr]
        if (!fn) {
          fn = parser.transform(attr)
          this.fns[attr] = fn
        }
        fn({event: nativeEvent, eventName: type, MIP: this.globalTargets.MIP})
        target = target.parentElement
        if (!target) {
          return
        }
      }
      target = dom.closest(target, attrSelector)
    } while (target)
  }

  /**
   * Excute the 'executeEventAction' of a MIPElement.
   *
   * @param {Object} action action
   * @param {MIPElement} target target
   */
  executeEventAction (action, target) {
    target.executeEventAction && target.executeEventAction(action)
  }
}

export default EventAction
