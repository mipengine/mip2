/**
 * @file fn
 * @author sekiyika(pengxing@baidu.com)
 */

/**
 * Throttle a function.
 *
 * @param {Function} fn fn
 * @param {number} delay The run time interval
 * @return {Function}
 */
function throttle (fn, delay) {
  let context
  let args
  let timerId
  let execTime = 0

  !delay && (delay = 10)

  function exec () {
    timerId = 0
    execTime = Date.now()
    fn.apply(context, args)
  }

  return function () {
    let delta = Date.now() - execTime
    context = this
    args = arguments
    clearTimeout(timerId)
    if (delta >= delay) {
      exec()
    } else {
      timerId = setTimeout(exec, delay - delta)
    }
  }
}

/**
 * Get all values of an object.
 *
 * @param {Object} obj obj
 * @return {Array}
 */
function values (obj) {
  let keys = Object.keys(obj)
  let length = keys.length
  let ret = []

  for (let i = 0; i < length; i++) {
    ret.push(obj[keys[i]])
  }

  return ret
}

/**
 * Return an object is a plain object or not.
 *
 * @param {Object} obj obj
 * @return {boolean}
 */
function isPlainObject (obj) {
  return !!obj && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype
}

/* eslint-disable fecs-camelcase */
/**
 * Extend an object to another object.
 *
 * @inner
 * @param {Object} target target
 * @param {Object} source source
 * @param {boolean} deep Extend deeply
 */
function _extend (target, source, deep) {
  for (let key in source) {
    if (deep) {
      if (isPlainObject(source[key])) {
        !isPlainObject(target[key]) && (target[key] = {})
      } else if (Array.isArray(source[key])) {
        !Array.isArray(target[key]) && (target[key] = [])
      } else {
        source[key] !== undefined && (target[key] = source[key])
        continue
      }
      _extend(target[key], source[key], deep)
    } else if (source[key] !== undefined) {
      target[key] = source[key]
    }
  }
}

/**
 * Extend some objects to an object.
 *
 * @param {Object} target target
 * @return {Object}
 */
function extend (target) {
  let hasDeep = typeof target === 'boolean'
  let deep = false
  if (hasDeep) {
    deep = target
    target = arguments[1]
  }
  for (let i = hasDeep ? 2 : 1; i < arguments.length; i++) {
    _extend(target, arguments[i], deep)
  }
  return target
}

/**
 * Pick some attributes from an object.
 *
 * @param {Object} obj obj
 * @return {Object}
 */
function pick (obj) {
  let keys = arguments[1]
  let result = {}
  if (!Array.isArray(keys)) {
    keys = Array.prototype.slice.call(arguments, 1)
  }
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * If varible is string type
 *
 * @param {string} string params string
 * @return {boolean} whehter varible is string
 */
function isString (string) {
  return Object.prototype.toString.call(string) === '[object String]'
}

/**
 * Empty a property
 *
 * @param {Object} obj object
 * @param {string} key key of object
 */
function del (obj, key) {
  if (!obj || !obj[key]) {
    return
  }
  try {
    delete obj[key]
  } catch (e) {
    obj[key] = undefined
  }
}

/**
 * if window has Touch event(is mobile) or not (is PC)
 *
 * @return {boolean} if window has Touch event(is mobile) or not (is PC)
 */
function hasTouch () {
  return ('ontouchstart' in window ||
    (window.navigator.maxTouchPoints !== undefined && window.navigator.maxTouchPoints > 0) ||
    window.DocumentTouch !== undefined)
}

/**
 * Whether pageUrl is mip cache url.
 *
 * @param {string} pageUrl - current page url.
 * @return {boolean} isCacheUrl.
 */
function isCacheUrl (pageUrl) {
  return /mipcache.bdstatic.com/.test(pageUrl) ||
    /^(\/\/|http:\/\/|https:\/\/)([A-Za-z0-9]{1,}-?){1,}.mipcdn.com\/(stati)?c\//.test(pageUrl)
}

export default {
  throttle,
  values,
  extend,
  pick,
  isPlainObject,
  isString,
  del,
  hasTouch,
  isCacheUrl
}
