/**
 * @file binding-style.js
 * @author clark-t (clarktanglei@163.com)
 */
import {
  prefixProperty,
  styleToObject,
  objectToStyle
} from '../../util/dom/css'

import {
  isPlainObjectEqual,
  complement,
  getType
} from '../../util/fn'

export const attr = 'm-bind:style'

export function bindingStyle (node, key, val, oldVal) {
  oldVal = oldVal || {}
  let newVal = formatStyle(val)
  if (isPlainObjectEqual(oldVal, newVal)) {
    return newVal
  }
  let current = styleToObject(node.getAttribute('style'))
  current = complement(current, Object.keys(oldVal))
  Object.assign(current, newVal)
  node.setAttribute('style', objectToStyle(current))

  return newVal
}

function formatStyle (value) {
  if (value == null) {
    return {}
  }

  if (Array.isArray(value)) {
    return value.reduce((result, item) => {
      return Object.assign(result, formatStyle(item))
    }, {})
  }

  if (getType(value) !== '[object Object]') {
    return {}
  }

  let styles = {}
  for(let prop of Object.keys(value)) {
    let prefixProp = prefixProperty(prop)
    if (prefixProp) {
      styles[prefixProp] = value[prop]
    }
  }
  return styles
}

