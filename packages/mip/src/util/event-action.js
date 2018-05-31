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
const PARSE_REG = /^(\w+):([\w-]+)\.([\w-$]+)(?:\(([^\)]+)\))?$/

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
    switch (action.handler) {
      case 'setData':
        MIP.setData(action, 1)
        break
      case '$set':
        MIP.$set(action, 1)
        break
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
    for (let action of actions) {
      let globalTarget = this.globalTargets[action.id]
      if (globalTarget) {
        globalTarget(action)
        continue
      }
      let target = this.getTarget(action.id)
      if (this.checkTarget(target)) {
        this.executeEventAction(action, target)
      }
    }
  }

  parse (actionString, type, nativeEvent) {
    if (typeof actionString !== 'string') {
      return []
    }
    let actions = actionString.trim().split(' ')
    let result = []
    for (let action of actions) {
      let matchedResult = action.match(PARSE_REG)
      if (matchedResult && matchedResult[1] === type) {
        result.push({
          type: matchedResult[1],
          id: matchedResult[2],
          handler: matchedResult[3],
          arg: matchedResult[4],
          event: nativeEvent
        })
      }
    }
    return result
  }
}

export default EventAction
