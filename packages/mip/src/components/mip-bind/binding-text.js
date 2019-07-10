/**
 * @file binding-text.js
 * @author clark-t (clarktanglei@163.com)
 */

export const attr = 'm-text'

export function bindingText (node, key, value, oldValue) {
  if (value == null) {
    value = ''
  }
  if (value !== oldValue) {
    node.textContent = value
  }
  return value
}

