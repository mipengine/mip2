/**
 * @file util.js
 * @author sfe
 */

export function isObj (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export function objNotEmpty (obj) {
  return isObj(obj) && Object.keys(obj).length !== 0
}