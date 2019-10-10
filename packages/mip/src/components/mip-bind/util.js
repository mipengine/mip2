/**
 * @file util.js
 * @author clark-t (clarktanglei@163.com)
 */

import {traverse, getType, noop} from '../../util/fn'

/**
 * 封装 Object.defineProperty
 *
 * @param {Object} obj 待定义属性对象
 * @param {string} name 属性名
 * @param {*} getter 属性值
 */
export function def (obj, name, getter) {
  Object.defineProperty(obj, name, {
    get: () => getter,
    // 写入不报错不执行
    set: noop,
    enumerable: true,
    configurable: false
  })
}

/**
 * 合并数据，将新值合并到旧对象上，当新旧属性值都为 Plain Object 时，再继续对这个 Object 做数据合并
 *
 * @param {Object} oldVal 旧值
 * @param {Object} newVal 新值
 * @param {boolean=} replace 当遇到相同属性名的值不相等的时候是否进行新值替换
 */
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

/**
 * 将 a.b.c = 1 变成 {a: {b: {c: 1}}}
 *
 * @param {Array.<string>} keys 属性名列表 a.b.c -> ['a', 'b', 'c']
 * @param {*} value 值
 */
export function createSetDataObject (keys, value) {
  let obj = value
  for (let i = keys.length - 1; i > -1; i--) {
    obj = {[keys[i]]: obj}
  }
  return obj
}

/**
 * 通过点运算表达式获取数据，当表达式对应的数据不存在时则返回 undefined
 *
 * @param {Object} data 数据源
 * @param {string} expr 点运算表达式
 * @reutn {*} 值
 */
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

/**
 * 将 setTimeout 用 Promise 进行包装
 *
 * @async
 * @param {number} time 超时时间，单位毫秒
 * @param {boolean} shouldResolve 超时时 Promise 执行 resolve 还是 reject
 * @return {Promise}
 */
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

