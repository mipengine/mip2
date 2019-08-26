/**
 * @file binding-attr.js
 * @author clark-t (clarktanglei@163.com)
 */

const prefix = 'm-bind:'
const prefixLen = prefix.length

export function isBindingAttr (key) {
  return key.length > prefixLen && key.slice(0, prefixLen) === prefix
}

const BOOLEAN_ATTRS = [
  'checked',
  'selected',
  'autofocus',
  'controls',
  'disabled',
  'hidden',
  'multiple',
  'readonly'
]

export function bindingAttr (node, key, value, oldValue) {
  /* istanbul ignore if */
  if (!isBindingAttr(key)) {
    return
  }

  let attr = key.slice(prefixLen)
  let prop = typeof value === 'object' ? JSON.stringify(value) : value
  if (prop === oldValue) {
    return prop
  }
  if (prop === '' || prop === undefined) {
    node.removeAttribute(attr)
  } else {
    node.setAttribute(attr, prop)
  }
  if (attr === 'value') {
    node[attr] = prop
  } else if (BOOLEAN_ATTRS.indexOf(attr) > -1) {
    node[attr] = !!prop
  }
  return prop
}

