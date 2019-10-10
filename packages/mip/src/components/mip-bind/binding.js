
/**
 * @file binding.js
 * @author clark-t (clarktanglei@163.com)
 * @description 在现有 MIP-bind 的模式下，mip-data 只能通过唯一的 MIP.setData
 * 进行数据修改,所以完全可以通过每次调用 MIP.setData
 * 的时候进行新旧数据比对，然后触发各种事件事件监听、数据绑定等等就可以了
 */

import {parse} from '../../util/event-action/parser'
import {attr as classAttr, bindingClass} from './binding-class'
import {attr as styleAttr, bindingStyle} from './binding-style'
import {attr as textAttr, bindingText} from './binding-text'
import {isBindingAttr as isDefaultBindingAttr, bindingAttr} from './binding-attr'

const bindings = {
  [classAttr]: bindingClass,
  [styleAttr]: bindingStyle,
  [textAttr]: bindingText
}

const bindingAttrs = Object.keys(bindings)

/**
 * 判断是否为绑定属性
 *
 * @param {string} attr 绑定属性名
 * @return {boolean} 判断结果
 */
export function isBindingAttr (attr) {
  return bindingAttrs.indexOf(attr) > -1 || isDefaultBindingAttr(attr)
  // return bindingAttrs.includes(attr) || isDefaultBindingAttr(attr)
}

/**
 * 通过属性名获取对应的绑定属性处理方法
 *
 * @param {string} key 属性名
 * @return {Function} 绑定属性处理方法
 */
function getBinding (key) {
  return bindings[key] || bindingAttr
}

/**
 * 对定义了绑定属性的节点进行绑定表达式计算并触发属性更新
 *
 * @param {HTMLElement} node 节点
 * @param {Object} attrs 绑定的属性键值
 * @param {Array.<string>} keys 绑定的属性列表，即 Object.keys(attrs)
 */
export function applyBinding ({node, attrs, keys}, data) {
  for (let key of keys) {
    let {expr, value: oldVal} = attrs[key]

    // 解析绑定表达式
    let fn
    try {
      fn = parse(expr, 'Conditional')
    } catch (e) {
      continue
    }

    // 计算表达式新值
    let newVal
    try {
      newVal = fn({data})
    } catch (e) {}

    // 调用各类属性绑定的处理方法进行属性修改，
    // 并存储格式化后的新值
    let binding = getBinding(key)
    attrs[key].value = binding(node, key, newVal, oldVal)
  }
}
