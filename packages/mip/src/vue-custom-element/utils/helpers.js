/**
 * @file helpers.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-+(\w)/g
export const camelize = (str) => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')

export const isArray = Array.isArray
export const isFunction = fn => typeof fn === 'function'

/**
 * Hyphenate a camelCase string.
 */
export const hyphenate = str => str
  .replace(/[A-Z]/g, s => ('-' + s.toLowerCase()))
  .replace(/^-/, '')

  // Convert an Array - like object to a real Array.
export function toArray (list, start = 0) {
  let i = list.length - start
  const ret = new Array(i)
  while (i--) { // eslint-disable-line no-plusplus
    ret[i] = list[i + start]
  }
  return ret
}
