/**
 * @file event-action.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */

import * as fn from './fn'
import dom from './dom/dom'
import {LAYOUT, getLayoutClass} from '../layout'
import log from './log'
import {handleScrollTo} from '../page/util/ease-scroll'
import parser from './parser/index'

const logger = log('Event-Action')

const EVENT_ACTION_STORE = {}

function parse (str) {
  if (!EVENT_ACTION_STORE[str]) {
    let fn = parser.transform(str)
    if (fn) {
      EVENT_ACTION_STORE[str] = fn
    }
  }
  return EVENT_ACTION_STORE[str]
}

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

function getAutofocusElement (el) {
  if (el.hasAttribute('autofocus')) {
    return el
  }
  return el.querySelector('[autofocus]')
}

function toggle (el, opt) {
  if (opt === undefined) {
    el.classList.toggle('mip-hide')
    return
  }
  el.classList.toggle('mip-hide', !opt)
}

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
    this.globalMethodHandlers = {}

    this.installAction()
  }

  /**
   * Install global action. such as on=tap:MIP.setData
   */
  installAction () {
    this.addGlobalTarget('MIP', this.handleMIPTarget)
    this.addGlobalMethodHandler('show', this.handleShow.bind(this))
    this.addGlobalMethodHandler('hide', this.handleHide.bind(this))
    this.addGlobalMethodHandler('toggle', this.handleToggle.bind(this))
    this.addGlobalMethodHandler('scrollTo', this.handleScrollTo.bind(this))
    this.addGlobalMethodHandler('focus', this.handleFocus.bind(this))
    this.addGlobalMethodHandler('toggleClass', this.handleToggleClass.bind(this))
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
    let data = fn.call(Object.assign(proxy, action))

    if (action.handler === 'setData') {
      MIP.setData(data)
    } else if (action.handler === '$set') {
      MIP.$set(data)
    } else if (action.handler === 'scrollTo') {
      MIP.scrollTo(data)
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
   * 显示元素，如果元素或其子元素有 autofocus 属性，focus 到该元素
   *
   * @param {Object} action action
   * @param {HTMLElement} target 目标元素
   */
  handleShow (action, target) {
    if (target.classList.contains(getLayoutClass(LAYOUT.NODISPLAY))) {
      logger.warn('layout=nodisplay 的元素不能被动态显示')
      return
    }
    const autofocusEl = getAutofocusElement(target)
    toggle(target, true)
    if (autofocusEl) {
      this.handleFocus(action, autofocusEl)
    }
  }

  /**
   * 隐藏元素
   *
   * @param {Object} action action
   * @param {HTMLElement} target 目标元素
   */
  handleHide (action, target) {
    toggle(target, false)
  }

  /**
   * 显示/隐藏元素
   *
   * @param {Object} action action
   * @param {HTMLElement} target 目标元素
   */
  handleToggle (action, target) {
    toggle(target)
  }

  /**
   * 滚动到目标元素
   *
   * @param {Object} action action
   * @param {HTMLElement} target 目标元素
   */
  handleScrollTo (action, target) {
    let data = {}
    try {
      data = (new Function(`{return ${action.arg}}`))()
    } catch (e) {
      logger.warn('scrollTo 参数有误')
    }
    handleScrollTo(target, data)
  }

  /**
   * 添加/删除元素 class
   *
   * @param {Object} action action
   * @param {HTMLElement} target 目标元素
   */
  handleToggleClass (action, target) {
    let data = {}
    try {
      data = (new Function(`{return ${action.arg}}`))()
    } catch (e) {
      logger.warn('toggleClass 参数有误')
      return
    }
    const className = data['class']
    const {force} = data
    if (!className || typeof className !== 'string') {
      logger.warn('class 不能为空且必须是 string 类型')
      return
    }
    if (force !== undefined) {
      if (typeof force !== 'boolean') {
        logger.warn('force 必须是 boolean 类型')
      }
      target.classList.toggle(className, force)
      return
    }
    target.classList.toggle(className)
  }

  /**
   * focus 元素
   *
   * @param {Object} action action
   * @param {HTMLElement} target 目标元素
   */
  handleFocus (action, target) {
    target.focus()
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

  addGlobalMethodHandler (name, handler) {
    /* istanbul ignore next */
    if (!name) {
      return
    }
    this.globalMethodHandlers[name] = handler
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
    // let attr
    let attrSelector = '[' + this.attr + ']'
    let params = {
      event: nativeEvent,
      eventName: type,
      MIP: this.globalTargets.MIP

    }

    do {
      let attr = target.getAttribute(this.attr)
      if (attr) {
        const action = parse(attr)
        action(params)
        target = target.parentElement
        if (!target) {
          return
        }
      }
      target = dom.closest(target, attrSelector)
    } while (target)
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

      // const globalMethod = this.globalMethodHandlers[action.handler]
      // if (target && globalMethod) {
      //   globalMethod(action, target)
      //   continue
      // }

      if (dom.isMIPElement(target)) {
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
        let act = str.substring(pos, i).trim()
        act && actions.push(act)
        pos = i
      }
    }

    if (pstack.length) {
      throw new SyntaxError(`Can not match ${pstack[pstack.length - 1]} in statement: 'on=${str}'`)
    }

    let act = str.slice(pos).trim()
    act && actions.push(act)

    let result = []
    for (let i = 0, len = actions.length; i < len; i++) {
      let action = actions[i].replace(/\n/g, '')
      let matchedResult = action.match(PARSE_REG)
      if (matchedResult && matchedResult[1] === type) {
        let id = matchedResult[2]
        let handler = matchedResult[3]
        let arg = matchedResult[4]
        // 暂不对 MIP.setData 的参数作处理
        if (id !== 'MIP' && arg && arg.indexOf('event.') !== -1) {
          arg = this.handleArguments(arg, event)
        }
        result.push({
          type,
          id,
          handler,
          arg,
          event
        })
      }
    }
    return result
  }

  split (str, seperator) {
    if (typeof str !== 'string' || typeof seperator !== 'string') {
      return []
    }
    let isQuote = char => char === '"' || char === '\'' || char === '`'
    const open = {
      '{': '}',
      '(': ')',
      '[': ']'
    }
    const close = {
      '}': '{',
      ')': '(',
      ']': '['
    }

    let pos = 0
    let result = []
    let plist = []
    for (let i = 0, slen = str.length; i < slen; i++) {
      let peek = plist[plist.length - 1]
      let char = str[i]

      if (open[char] && !isQuote(peek)) {
        plist.push(char)
      } else if (close[char]) {
        let index = plist.lastIndexOf(close[char])
        if (index !== -1) {
          plist.splice(index, plist.length - index)
        }
      } else if (isQuote(char) && str[i - 1] !== '\\') {
        if (peek === char) {
          plist.pop()
        } else {
          plist.push(char)
        }
      } else if (char === seperator && !plist.length) {
        let part = str.substring(pos, i).trim()
        result.push(part)
        pos = i + 1
      }
    }

    let part = str.slice(pos).trim()
    result.push(part)
    return result
  }

  /**
   * Replace the event dot references in arg string with their values
   *
   * @param {string} arg arguments string
   * @param {Event} event event
   * @return {string} new arg
   */
  handleArguments (arg, event) {
    if (!arg) {
      return
    }
    const data = {event}

    let getEventValue = (expr) => {
      let value = expr.split('.').reduce((value, part) => (part && value) ? value[part] : undefined, data)
      return this.convertToString(value)
    }

    // arg is object-like string, match and replace the value part
    // if (/^\s*{.*}\s*$/.test(arg)) {
    //   return arg.replace(EVENT_ARG_REG_FOR_OBJECT, (matched, colon, value, attr, tail) => colon + getEventValue(value) + tail)
    // }

    let args = this.split(arg, ',')
    return args.map(item => item.trim().replace(EVENT_ARG_REG, getEventValue)).join(',')
  }

  convertToString (value) {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    if (typeof value === 'string') {
      return `"${value}"`
    }
    return value + ''
  }
}

export default EventAction
