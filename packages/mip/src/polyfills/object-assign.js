/**
 * @file Object.assign polyfill
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict'

/**
 * Object.assign
 *
 * @see https://github.com/rubennorte/es6-object-assign

 * @param {!Object} target target object
 * @return {!Object}
 */
export function assign (target) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object')
  }

  var to = Object(target)
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i]
    if (nextSource === undefined || nextSource === null) {
      continue
    }

    var keysArray = Object.keys(Object(nextSource))
    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex]
      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey)
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey]
      }
    }
  }
  return to
}

/**
 * Sets the Object.assign polyfill if it does not exist.
 *
 * @param {!Window} win window
 */
export function install (win) {
  win.Object.assign = win.Object.assign || assign
}
