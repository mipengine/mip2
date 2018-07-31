/**
 * @file EventEmitter
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable fecs-camelcase */

/**
 * For determining whether a string is splitted by space or not.
 *
 * @const
 * @inner
 * @type {RegExp}
 */
const MULTI_REG = /\s+/

class EventEmitter {
  /**
   * EventEmitter
   *
   * @constructor
   * @param {?Object} opt Options
   */
  constructor (opt) {
    if (opt) {
      opt.context && this.setEventContext(opt.context)

      opt.createEventCallback && (this._createEventCallback = opt.createEventCallback)
      opt.removeEventCallback && (this._removeEventCallback = opt.removeEventCallback)
      opt.bindEventCallback && (this._bindEventCallback = opt.bindEventCallback)
    }
  }

  /**
   * Mix EventEmitter's prototype into target object
   *
   * @static
   * @param {Object} obj destination obj
   * @return {Object}
   */
  static mixin (obj) {
    let whitelist = [
      'on', 'off', 'once', 'trigger', 'setEventContext',
      '_bindEventCallback', '_createEventCallback',
      '_getEvent', '_removeEventCallback'
    ]

    for (let i = 0, len = whitelist.length; i < len; i++) {
      let key = whitelist[i]
      if (obj[key]) {
        continue
      }

      obj[key] = EventEmitter.prototype[key]
    }

    return obj
  }

  /**
   * Add handler to events
   *
   * @param {string} name name
   * @param {Function} handler handler
   * @return {Object}
   */
  on (name, handler) {
    if (multiArgs(this, this.on, name, handler)) {
      return this
    }
    this._getEvent(name).push(handler)
    this._bindEventCallback(name, handler)
    return this
  }

  /**
   * Remove handler from events.
   *
   * @param {?string} name name
   * @param {?Function} handler handler
   * @return {?Object}
   */
  off (name, handler) {
    // If arguments` length is 0, remove all handlers.
    if (!name) {
      if (!handler) {
        this.off(Object.keys(this.__events).join(' '), handler)
      }
      return null
    }
    if (multiArgs(this, this.off, name, handler)) {
      return null
    }

    let list
    if (handler) {
      list = this._getEvent(name)
      let index = list.indexOf(handler)
      if (index > -1) {
        list.splice(index, 1)
      }
    }
    if (!handler || (list && list.length === 0)) {
      delete this.__events[name]
      this._removeEventCallback(name)
    }
    return name ? this.__events && this.__events[name] : null
  }

  /**
   * Add a one-off handler to events
   *
   * @param {string} name name
   * @param {Function} handler handler
   * @return {Function} the unbinder of the handler
   */
  once (name, handler) {
    let cb = handler.bind(this)
    let self = this
    cb.__once = true
    this.on(name, cb)
    return function () {
      self.off(name, cb)
      cb = self = null
    }
  }

  /**
   * Trigger events.
   *
   * @param {string} name name
   */
  trigger (name) {
    let args = Array.prototype.slice.call(arguments, 1)
    if (multiArgs(this, this.trigger, name, args)) {
      return
    }
    let list = this._getEvent(name)
    let context = this.__eventContext || this
    for (let i = 0; i < list.length; i++) {
      list[i].apply(context, args)
      if (list[i].__once) {
        list.splice(i, 1)
      }
    }
  }

  /**
   * Set the handlers' context
   *
   * @param {Function} context context
   */
  setEventContext (context) {
    this.__eventContext = context || this
  }

  /**
   * Get an event's handler list. If not exist, create it.
   *
   * @param {string} name name
   * @return {Array}
   */
  _getEvent (name) {
    if (!this.__events) {
      this.__events = {}
    }
    if (!this.__events[name]) {
      this.__events[name] = []
      this._createEventCallback(name, this.__events[name])
    }
    return this.__events[name]
  }

  /**
   * Called when an event is created.
   *
   * @param {string} name Event name
   * @param {Array.<Function>} handlers The bound handlers
   */
  _createEventCallback (name, handlers) {}

  /**
   * Called when an event is removed.
   *
   * @param {string} name Event name
   */
  _removeEventCallback (name) {}

  /**
   * Called when an event is binding.
   *
   * @param {string} name Event name
   * @param {Function} handler Event handler
   */
  _bindEventCallback (name, handler) {}
}

/**
 * If a string is splitted by space, convert string to array and
 * execute function N(n = Array.length) times with the args.
 * Return the result that the string is multiple or not.
 *
 * @param {Object} obj The execute context
 * @param {Function} fn The function to be runned
 * @param {string} name name
 * @param {Array} args args
 * @return {boolean}
 */
function multiArgs (obj, fn, name, args) {
  if (MULTI_REG.test(name)) {
    let nameList = name.split(MULTI_REG)
    let isApply = typeof args !== 'function'
    for (let i = 0; i < nameList.length; i++) {
      isApply
        ? fn.apply(obj, [nameList[i]].concat(args))
        : fn.call(obj, nameList[i], args)
    }
    return true
  }
  return false
}

export default EventEmitter
