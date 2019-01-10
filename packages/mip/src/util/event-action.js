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

const EVENT_ARG_REG = /event\.[\w.]*/g

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

    let fn = new Function('DOM', `with(this){return ${action.rawArg}}`) // eslint-disable-line
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
    let actions = this.split(str, ' ', ':')

    let result = []
    for (let i = 0, len = actions.length; i < len; i++) {
      let action = actions[i].replace(/\n/g, '')
      let matchedResult = action.match(PARSE_REG)
      if (matchedResult && matchedResult[1] === type) {
        let {rawArg, parsedArgs} = this.processArg(matchedResult[4], event)
        result.push({
          type: matchedResult[1],
          id: matchedResult[2],
          handler: matchedResult[3],
          rawArg,
          parsedArgs,
          event
        })
      }
    }
    return result
  }

  /**
   * Replace the event dot references in arg string with their values
   * and split the arg by ','
   *
   * @param {string} arg arguments string
   * @param {Event} event event
   * @return {Object} arg object, legacy:
   * @example original arg is: 'event.size, 10', the result is:
   * {
   *    "rawArg": '20, 10'
   *    "parsedArgs": [20, '10']
   * }
   */
  processArg (arg, event) {
    let arr = this.split(arg, ',')
    let parsedArgs = []
    const data = {event}
    let argArr = arr.map((item) => {
      let isEventArg = false
      item = item.replace(EVENT_ARG_REG, expr => {
        // dereference the event dot expression, such as 'event.field1'
        let value = expr.split('.').reduce((value, part) => part && value ? value[part] : undefined, data)
        isEventArg = true
        parsedArgs.push(value)
        return this.convertToString(value)
      })

      // if (item.indexOf('event.') !== -1) {
      //   // dereference the event dot expression, such as 'event.field1'
      //   let value = item.split('.').reduce((value, part) => part && value ? value[part] : undefined, data)

      //   parsedArgs.push(value)
      //   return this.convertToString(value)
      // }
      if (!isEventArg) {
        parsedArgs.push(item)
      }
      return item
    })
    return {
      rawArg: argArr.join(','),
      parsedArgs
    }
  }

  /**
   * Special spliter. It will split the string just by those that are not surrounded by paired signs or not behind the option
   *
   * @param {string} str
   * @param {string} seperator
   * @param {string} option
   */
  split (str, seperator, option) {
    if (typeof str !== 'string' || typeof seperator !== 'string') {
      return []
    }
    let isQuote = char => char === '"' || char === '\''
    // let open = '{[(<'
    // let close = '}])>'
    const open = {
      '{': '}',
      '(': ')',
      '[': ']',
      '<': '>'
    }
    const close = {
      '}': '{',
      ')': '(',
      ']': '[',
      '>': '<'
    }

    let pos = 0
    let result = []
    let pstack = []
    for (let i = 0, slen = str.length; i < slen; i++) {
      let peek = pstack[pstack.length - 1]
      let char = str[i]

      if (open[char] && !isQuote(peek)) {
        pstack.push(char)
      } else if (close[char] && peek === close[char]) {
        pstack.pop()
      } else if (isQuote(char) && str[i - 1] !== '\\') {
        if (peek === char) {
          pstack.pop()
        } else {
          pstack.push(char)
        }
      } else if (option && char === option && !pstack.length) {
        pstack.push(char)
      } else if (option && peek === option && str[i + 1] !== seperator) {
        pstack.pop()
      } else if (char === seperator && !pstack.length) {
        let part = str.substring(pos, i).trim(' ')
        part && result.push(part)
        pos = i + 1
      }
    }

    if (pstack.length) {
      throw new SyntaxError(`Can not match ${pstack[pstack.length - 1]} in statement: '${str}'`)
    }
    let part = str.substring(pos, str.length).trim(' ')
    part && result.push(part)
    return result
  }

  convertToString (value) {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return value + ''
  }
}

export default EventAction
