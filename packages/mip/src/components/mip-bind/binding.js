
/**
 * @file binding.js
 * @author clark-t (clarktanglei@163.com)
 * @description 在现有 MIP-bind 的模式下，mip-data 只能通过唯一的 MIP.setData
 * 进行数据修改,所以完全可以通过每次调用 MIP.setData
 * 的时候进行新旧数据比对，然后触发各种事件事件监听、数据绑定等等就可以了
 */
import { parse } from '../../util/event-action/parser'
import { attr as classAttr, bindingClass } from './binding-class'
// import { attr as styleAttr, bindingStyle } from './binding-style'
import { attr as textAttr, bindingText } from './binding-text'
import { isBindingAttr as isDefaultBindingAttr, bindingAttr } from './binding-attr'

// import log from '../../util/log'

// const logger = log('MIP-Bind')
const bindings = {
  [classAttr]: bindingClass,
  // [styleAttr]: bindingStyle,
  [textAttr]: bindingText
}

const bindingAttrs = Object.keys(bindings)

function getBinding (key) {
  return bindings[key] || bindingAttr
}

export function applyBinding ({node, attrs, keys }, data) {
  for (let key of keys) {
    let { expr, value: oldVal } = attrs[key]

    let parser
    try {
      parser = parse(expr, 'ConditionalExpression')
    } catch (e) {
      // console.error(e)
      continue
    }

    let newVal
    try {
      newVal = parser({ data })
    } catch (e) {}

    let binding = getBinding(key)
    attrs[key].value = binding(node, key, newVal, oldVal)
  }
}

export function isBindingAttr (attr) {
  return bindingAttrs.includes(attr) || isDefaultBindingAttr(attr)
}

