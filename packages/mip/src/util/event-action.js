/**
 * @file event-action.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */

import fn from './fn'
import dom from './dom/dom'

/* global MIP */

/**
 * Regular for parsing params.
 * @const
 * @inner
 * @type {RegExp}
 */
const PARSE_REG = /^(\w+):\s*([\w-]+)\.([\w-$]+)(?:\((.+)\))?$/

/**
 * Regular for checking elements.
 * @const
 * @inner
 * @type {RegExp}
 */
const CHECK_REG = /^mip-/

/**
 * Key list of picking options.
 * @const
 * @inner
 * @type {Array}
 */
const OPTION_KEYS = ['executeEventAction', 'parse', 'checkTarget', 'getTarget', 'attr']

/**
 * MIP does not support external JavaScript, so we provide EventAction to trigger events between elements.
 * TODO: refactor
 *
 * @class
 */
class EventAction {
  constructor (opt) {
    opt && fn.extend(this, fn.pick(opt, OPTION_KEYS))
    this.attr = 'on'
    this.globalTargets = {}

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

    const allowedGlobals = (
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
      'm' // MIP global data
    ).split(',')

    let hasProxy = typeof Proxy !== 'undefined'
    let proxy = hasProxy ? new Proxy({
      DOM: target
    }, {
      has (target, key) {
        let allowed = allowedGlobals.indexOf(key) >= 0
        return target[key] || !allowed
      }
    }) : {}

    let fn = new Function('DOM', `with(this){return ${action.arg}}`) // eslint-disable-line
    let data = fn.call(proxy)

    if (action.handler === 'setData') {
      MIP.setData(data)
    } else if (action.handler === '$set') {
      MIP.$set(data)
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
        this._execute(this.parse(attr, type, nativeEvent))
        target = target.parentElement
        if (!target) {
          return
        }
      }
      target = dom.closest(target, attrSelector)
    } while (target)
  }

  /**
   * Ensure the target element is a MIPElement
   *
   * @param {HTMLElement} target target
   * @return {boolean}
   */
  checkTarget (target) {
    return target && target.tagName && CHECK_REG.test(target.tagName.toLowerCase())
  }

  /**
   * Get the target element by ID
   *
   * @param {string} id id
   * @return {HTMLElement}
   */
  getTarget (id) {
    return document.getElementById(id)
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

  /**
   * Excute the parsed actions.
   *
   * @private
   * @param {Array.<Object>} actions event action
   */
  _execute (actions) {
    for (let i = 0, len = actions.length; i < len; i++) {
      let action = actions[i]
      let globalTarget = this.globalTargets[action.id]
      if (globalTarget) {
        globalTarget(action)
        continue
      }
      let target = this.getTarget(action.id)
      if (this.checkTarget(target)) {
        this.executeEventAction(action, target)
        // setTimeout(() => this.executeEventAction(action, target))
      }
    }
  }

  parse (str, type, event) {
    if (typeof str !== 'string') {
      return []
    }

    let isQuote = char => char === '"' || char === '\''
    let isSpace = char => char === ' '
    let isColon = char => char === ':'

    let pos = 0
    let actions = []
    let pstack = []
    for (let i = 0, slen = str.length; i < slen; i++) {
      let peek = pstack[pstack.length - 1]
      let char = str[i]

      if (char === '(' && !isQuote(peek)) {
        pstack.push(char)
      } else if (char === ')' && peek === '(') {
        pstack.pop()
      } else if (isQuote(char) && str[i - 1] !== '\\') {
        if (peek === char) {
          pstack.pop()
        } else {
          pstack.push(char)
        }
      } else if (isColon(char) && !pstack.length) {
        pstack.push(char)
      } else if (isColon(peek) && !isSpace(str[i + 1])) {
        pstack.pop()
      } else if (isSpace(char) && !pstack.length) {
        let act = str.substring(pos, i).trim(' ')
        act && actions.push(act)
        pos = i
      }
    }

    if (pstack.length) {
      throw new SyntaxError(`Can not match ${pstack[pstack.length - 1]} in statement: 'on=${str}'`)
    }

    let act = str.substring(pos, str.length).trim(' ')
    act && actions.push(act)

    let result = []
    for (let i = 0, len = actions.length; i < len; i++) {
      let action = actions[i].replace(/\n/g, '')
      let matchedResult = action.match(PARSE_REG)
      if (matchedResult && matchedResult[1] === type) {
        result.push({
          type: matchedResult[1],
          id: matchedResult[2],
          handler: matchedResult[3],
          arg: matchedResult[4],
          event: event
        })
      }
    }
    return result
  }
}

export default EventAction
