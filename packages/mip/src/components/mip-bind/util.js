/**
 * @file util.js
 * @author clark-t (clarktanglei@163.com)
 */

import {traverse, getType, noop} from '../../util/fn'

export function def (obj, name, getter) {
  Object.defineProperty(obj, name, {
    get: () => getter,
    set: noop,
    // set: typeof setter === 'function' ? setter : noop,
    enumerable: true,
    configurable: false
  })
}

export function merge (oldVal, newVal, replace = true) {
  let change = []

  let root = { oldVal, newVal, key: '' }
  traverse(root, ({ oldVal: oldObj, newVal: newObj, key: parentKey }) => {
    let children = []

    for (let k of Object.keys(newObj)) {
      let oldVal = oldObj[k]
      let newVal = newObj[k]

      // 对象完全一样就没有 diff 了，
      // 所以 object 等情况的数据需要 object.assign
      if (newVal === oldVal) {
        continue
      }

      let key = parentKey === '' ? k : `${parentKey}.${k}`

      let newType = getType(newVal)
      if (newType === '[object Object]' && newType === getType(oldVal)) {
        children.push({ oldVal, newVal, key })
        continue
      }

      if (replace || oldVal === undefined) {
        change.push({ expr: key, oldVal, newVal })
        oldObj[k] = newObj[k]
      }
    }

    return children
  })

  return change
}

export function createSetDataObject (keys, value) {
  let obj = value
  for (let i = keys.length - 1; i > -1; i--) {
    obj = {[keys[i]]: obj}
  }
  return obj
}

export function getProperty (data, expr) {
  let properties = expr.split('.')
  let result = data
  for (let property of properties) {
    if (result == null) {
      return undefined
    }
    result = result[property]
  }
  return result
}

export function timeout (time, shouldResolve = false) {
  return new Promise((resolve, reject) => {
    let message = 'timeout'
    setTimeout(() => {
      shouldResolve
        ? resolve(message)
        : reject(new Error(message))
    }, time)
  })
}

