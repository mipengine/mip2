/**
 * @file binding-class.js
 * @author clark-t (clarktanglei@163.com)
 */

import {getType} from '../../util/fn'

export const attr = 'm-bind:class'

export function bindingClass (node, key, newVal, oldVal) {
  let change
  if (oldVal == null) {
    change = {}
  } else {
    change = Object.keys(oldVal)
      .filter(key => oldVal[key])
      .reduce((result, className) => {
        result[className] = false
        return result
      }, {})
  }

  let formatNewVal = formatClass(newVal)
  Object.assign(change, formatNewVal)

  for (let className of Object.keys(change)) {
    node.classList.toggle(className, change[className])
  }
  return formatNewVal
}

function formatClass (value) {
  if (value == null) {
    return {}
  }

  if (Array.isArray(value)) {
    return value.reduce(
      (result, item) => Object.assign(result, formatClass(item)),
      {}
    )
  }

  if (typeof value === 'string') {
    value = value.trim()
    return value &&
      value.split(/\s+/)
        .reduce((result, className) => {
          result[className] = true
          return result
        }, {}) || {}
  }

  if (getType(value) === '[object Object]') {
    return Object.keys(value)
      .reduce((result, key) => {
        result[key] = !!value[key]
        return result
      }, {})
  }

  return {}
}

