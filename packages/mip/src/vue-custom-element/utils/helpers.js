/**
 * @file helpers.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g
export const camelize = (str) => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /([^-])([A-Z])/g
export const hyphenate = str => str
  .replace(hyphenateRE, '$1-$2')
  .replace(hyphenateRE, '$1-$2')
  .toLowerCase()

// Convert an Array - like object to a real Array.
export function toArray (list, start = 0) {
  let i = list.length - start
  const ret = new Array(i)
  while (i--) { // eslint-disable-line no-plusplus
    ret[i] = list[i + start]
  }
  return ret
}

export function parseJSON (str) {
  str = str.replace(/[[{,]\s*((['"]?).*?\2)\s*:/g, function (item) {
    return item.replace(/[^{[,].*/g, function (a) {
      if (!/(['"]).*?\1/.test(a)) {
        return a.replace(/^\s*/, '"').replace(/:$/, '":')
      }
      return a.replace(/(').*\1/, function (b) {
        return b.replace(/"/g, '\\"').replace(/((^')|('$))/g, '"')
      })
    })
  })

  try {
    return JSON.parse(str)
  } catch (e) { throw e }
}
