/**
 * @file Array.prototype.includes polyfill
 * @author sekiyika(pengxing@baidu.com)
 */

/**
 * Returns true if the element is in the array and false otherwise.
 *
 * @param {*} value value
 * @param {number=} fromIndex fromIndex
 * @return {boolean}
 * @this {Array}
 */
function includes (value, fromIndex = 0) {
  let len = this.length
  let i = fromIndex >= 0 ? fromIndex : Math.max(len + fromIndex, 0)

  for (; i < len; i++) {
    let other = this[i]
    // If value has been found OR (value is NaN AND other is NaN)
    /* eslint-disable no-self-compare */
    if (other === value || (value !== value && other !== other)) {
      return true
    }
  }
  return false
}

/**
 * Sets the Array.contains polyfill if it does not exist.
 *
 * @param {!Window} win window
 */
export function install (win) {
  if (!win.Array.prototype.includes) {
    win.Array.prototype.includes = includes
  }
}
