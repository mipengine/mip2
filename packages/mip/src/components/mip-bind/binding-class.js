/**
 * @file binding-class.js
 * @author clark-t (clarktanglei@163.com)
 */

import {getType} from '../../util/fn'

export const attr = 'm-bind:class'

/**
 * 处理绑定 class 的节点
 *
 * @param {HTMLElement} node 节点
 * @param {string} key 'class'，参数占位用
 * @param {string|Object|Array|null} newVal 新值
 * @param {Object|undefined} oldVal 旧值
 * @return {string|null} 格式化新值
 */
export function bindingClass (node, key, newVal, oldVal) {
  let change

  // 将旧的 class 全部置为待移除状态
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

  // 将新的 class 全部置为待添加状态
  let formatNewVal = formatClass(newVal)

  // merge
  Object.assign(change, formatNewVal)

  for (let className of Object.keys(change)) {
    node.classList.toggle(className, change[className])
  }
  return formatNewVal
}

/**
 * 格式化 class 结果
 * 目前 class 属性绑定与 vue 类似，支持字符串、Object、Array 等结果，需要归一化成 Object
 * 如：m-bind:class="[abc, 'd-' + 1, {a: true, b: false}]"
 *
 * @param {string|Object|Array|undefined} value class 绑定的计算结果
 * @return {Object} 格式化 class 结果
 */
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

