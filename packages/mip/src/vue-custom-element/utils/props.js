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
 * @param {Array|Object} propsDef props collection
 * @param {Object} props extract props
 */
function extractProps (propsDef, props) {
  if (isArray(propsDef)) {
    propsDef.forEach(prop => {
      let camelCaseProp = camelize(prop)
      props.camelCase.indexOf(camelCaseProp) === -1 && props.camelCase.push(camelCaseProp)
      props.types[prop] = getPropType(propsDef[camelCaseProp])
    })
  } else if (propsDef && typeof propsDef === 'object') {
    for (let prop in propsDef) {
      let camelCaseProp = camelize(prop)
      props.camelCase.indexOf(camelCaseProp) === -1 && props.camelCase.push(camelCaseProp)
      props.types[prop] = getPropType(propsDef[camelCaseProp])
    }
  }
}

// Extract props from component definition, no matter if it's array or object
export function getProps (componentDefinition = {}) {
  let props = {
    camelCase: [],
    hyphenate: [],
    types: {}
  }

  if (componentDefinition.mixins) {
    componentDefinition.mixins.forEach(mixin => extractProps(mixin.props, props))
  }

  if (componentDefinition.extends && componentDefinition.extends.props) {
    extractProps(componentDefinition.extends.props, props)
  }

  extractProps(componentDefinition.props, props)

  props.camelCase.forEach(prop => props.hyphenate.push(hyphenate(prop)))

  return props
}

// If we get DOM node of element we could use it like this:
// document.querySelector('widget-vue1').prop1 < --get prop
// document.querySelector('widget-vue1').prop1 = 'new Value' < --set prop
export function reactiveProps (element, props) {
  // Handle param attributes
  props.camelCase.forEach((name, index) => {
    Object.defineProperty(element, name, {
      get () {
        if (element.customElement && element.customElement.vm) {
          return element.customElement.vm[name]
        }
      },
      set (value) {
        let vm = element.customElement && element.customElement.vm
        if (vm) {
          vm[name] = value
        }
      }
    })
  })
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

    if (attrValue !== null) {
      propsData[propCamelCase] = convertAttributeValue(attrValue, props.types[propCamelCase])
    } else if (propCamelCase in element) {
      propsData[propCamelCase] = element[propCamelCase]
    }
  })

  return propsData
}
