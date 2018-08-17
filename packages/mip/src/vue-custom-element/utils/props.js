/**
 * @file props.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

import {camelize, hyphenate, isArray, isFunction} from './helpers'
import jsonParse from '../../util/json-parse'

/**
 * 从 vue 组件定义的 prop 中获取类型，如果没有定义类型，默认返回 String
 * @param {Object|Function} prop prop 规则定义
 * @return {Function} 数据类型
 * @see https://vuejs.org/v2/guide/components-props.html#Prop-Casing-camelCase-vs-kebab-case
 */
function getPropType (prop) {
  if (isFunction(prop)) {
    return prop
  }

  if (isArray(prop)) {
    return prop[0]
  }

  if (prop && typeof prop === 'object' && prop.type) {
    return isArray(prop.type) ? prop.type[0] : prop.type
  }

  return String
}

/**
 * 根据 component props 指定类型对 attribute 进行数据类型转换
 *
 * @param {string} value attribute value
 * @param {Function} type 基本数据类型 String/Number/Boolean/Array/Object
 */
export function convertAttributeValue (value, type) {
  if (type === Boolean) {
    return value !== 'false'
  }

  if (type === Number) {
    return parseFloat(value, 10)
  }

  if (type === String) {
    return value
  }

  if (type === Array || type === Object) {
    try {
      return jsonParse(value)
    } catch (e) {
      console.warn(value + ' attribute content should be a valid JSON string!')
    }
  }

  return value
}

/**
 * 解析 vue 组件的 props
 *
 * @see https://vuejs.org/v2/guide/components-props.html#Prop-Casing-camelCase-vs-kebab-case
 * @param {Object} component definition
 * @param {Object} props extract props
 */
function extractProps (def, propTypes) {
  if (isArray(def.props)) {
    def.props.forEach(prop => {
      let camelizeName = camelize(prop)
      if (!propTypes[camelizeName]) {
        propTypes[camelizeName] = getPropType(def.props[prop])
      }
    })
  } else if (typeof def.props === 'object') {
    for (let prop in def.props) {
      let camelizeName = camelize(prop)
      if (!propTypes[camelizeName]) {
        propTypes[camelizeName] = getPropType(def.props[prop])
      }
    }
  }

  if (def.extends && def.extends.props) {
    extractProps(def.extends, propTypes)
  }

  if (def.mixins) {
    def.mixins.forEach(mixin => extractProps(mixin, propTypes))
  }

  return propTypes
}

// Extract props from component definition, no matter if it's array or object
export function getProps (def = {}) {
  let props = {
    camelCase: [],
    hyphenate: [],
    types: {}
  }

  let propTypes = extractProps(def, {})

  props.camelCase = Object.keys(propTypes)
  props.hyphenate = Object.keys(propTypes).map(key => hyphenate(key))
  props.types = propTypes

  return props
}

// In root Vue instance we should initialize props as 'propsData'.
export function getPropsData (element, componentDefinition, props) {
  let propsData = componentDefinition.propsData || {}
  let dataElement = element.querySelector('script[type*=json]')

  // if there is a script data in custom element
  if (dataElement) {
    let scriptData
    try {
      scriptData = jsonParse(dataElement.innerHTML) || {}
    } catch (err) {
      console.warn(dataElement, 'Content should be a valid JSON string!')
      scriptData = {}
    }

    propsData = Object.assign({}, propsData, scriptData)
  }

  // 从 dom 上获取 props data
  props.hyphenate.forEach((name, index) => {
    let propCamelCase = props.camelCase[index]
    let attrValue = element.getAttribute(name)

    if (element.attrValues && name in element.attrValues) {
      propsData[propCamelCase] = element.attrValues[name].val
      // delete 该属性，避免干扰正常的修改 attribute 值触发 props 改变
      delete element.attrValues[name]
    } else if (attrValue !== null) {
      propsData[propCamelCase] = convertAttributeValue(attrValue, props.types[propCamelCase])
    }
  })

  return propsData
}
