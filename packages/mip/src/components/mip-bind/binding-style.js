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

/**
 * 处理绑定 style 的节点
 *
 * @param {HTMLElement} node 节点
 * @param {string} key 'style'，参数占位用
 * @param {string|Object|Array|null} newVal 新值
 * @param {Object|undefined} oldVal 旧值
 * @return {string|null} 格式化新值
 */
export function bindingStyle (node, key, val, oldVal) {
  oldVal = oldVal || {}
  let newVal = formatStyle(val)
  if (isPlainObjectEqual(oldVal, newVal)) {
    return newVal
  }

  let current = styleToObject(node.getAttribute('style'))
  // 将旧值所增加的 style 全部移除
  current = complement(current, Object.keys(oldVal))
  // 再拼接上新值所增加的 style
  Object.assign(current, newVal)
  node.setAttribute('style', objectToStyle(current))

  return newVal
}

/**
 * 格式化 style 结果，全部统一成 Object
 *
 * @param {Object|Array} value style 的值
 * @return {Object} 格式化 style 结果
 */
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
  for (let prop of Object.keys(value)) {
    let prefixProp = prefixProperty(prop)
    if (prefixProp) {
      styles[prefixProp] = value[prop]
    }
  }
  return styles
}
