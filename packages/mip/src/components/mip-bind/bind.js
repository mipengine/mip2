/**
 * @file bind.js
 * @author clark-t (clarktanglei@163.com)
 * @description 在现有 MIP-bind 的模式下，mip-data 只能通过唯一的 MIP.setData
 * 进行数据修改,所以完全可以通过每次调用 MIP.setData
 * 的时候进行新旧数据比对，然后触发各种事件事件监听、数据绑定等等就可以了
 */
import { parse } from '../../util/event-action/parser'

import {
  getType,
  traverse,
  isEmptyObject
} from '../../util/fn'

import {
  isElementNode
} from '../../util/dom/dom'

import log from '../../util/log'

const logger = log('MIP-Bind')

const MIP_DATA = {}
const MIP_DATA_PROMISES = []
const MIP_DATA_WATCHES = {}
let bindingElements = []
const vendorNames = ['Webkit', 'Moz', 'ms']
const emptyStyle = document.createElement('div').style

export default function () {
  // let win = window
  // @TODO deprecated
  window.m = MIP_DATA
  window.mipDataPromises = MIP_DATA_PROMISES
  initGlobalData()

  MIP.setData = setData
  MIP.$set = setData
  MIP.getData = getData
  MIP.watch = watchData
  MIP.$update = updateIframeData

  bindingElements = getBindingElements(document.documentElement)
  addInputListener(bindingElements)

  let globalData = getGlobalData()
  MIP.setData(globalData)
}

function getBindingElements (root) {
  let results = []
  traverse(root, node => {
    if (!isElementNode(node)) {
      return
    }
    let attrs = getBindingAttributes(node)
    attrs && results.push({node, attrs, keys: Object.keys(attrs) })
    if (node.children) {
      return Array.from(node.children)
    }
  })
  return results
}

function getBindingAttributes (node) {
  let attrs
  for (let i = 0; i < node.attributes.length; i++) {
    if (!isBindingAttribute(attr.name)) {
      continue
    }
    attrs = attrs || {}
    attrs[attr.name] = {expr: attr.value}
  }
  return attrs
}

function applyBindingAttributes ({node, attrs, keys }) {
  for (let key of keys) {
    let { expr, value: oldVal } = attrs[key]

    let fn
    try {
      fn = parse(expr, 'ConditionalExpression')
    } catch (e) {
      // console.error(e)
      continue
    }

    let newVal
    try {
      newVal = fn({data: MIP_DATA})
    } catch (e) {}

    switch (key) {
      case 'm-bind:class':
        newVal = bindClass(node, newVal, oldVal)
        break
      case 'm-bind:style':
        newVal = bindStyle(node, newVal, oldVal)
        break
      case 'm-text':
        newVal = bindText(node, newVal, oldVal)
        break
      // case 'm-bind:value':
        // value = bindValue(node, value, oldValue)
        // break
      default:
        newVal = bindAttribute(node, key, newVal, oldVal)
        break
    }
    attrs[key].value = newVal
  }
}

function addInputListener (nodeInfos) {
  const key = 'm-bind:value'

  const FORM_ELEMENTS = [
    'input',
    'textarea',
    'select'
  ]

  for (let info of nodeInfos) {
    let {node, attrs} = info
    if (!FORM_ELEMENTS.includes(node.tagName)) {
      continue
    }

    let expression = attrs[key] && attrs[key].expr

    if (!expression) {
      continue
    }

    const properties = expression.split('.')

    node.addEventListener('input', e => {
      let obj = createSetDataObject(properties, e.target.value)
      setData(obj)
    })
  }
}

function createSetDataObject (keys, value) {
  let obj = value
  for (let i = keys.length - 1; i > -1; i--) {
    obj = {[keys[i]]: obj}
  }
  return obj
}

function bindClass (node, newVal, oldVal) {
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

  if (typeof value === 'string') {
    return value.trim()
      .split(/\s+/)
      .reduce((result, className) => {
        result[className] = true
        return result
      }, {})
  }

  if (Array.isArray(value)) {
    return value.reduce(
      (result, item) => Object.assign(result, formatClass(item)),
      {}
    )
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

function bindStyle (node, value, oldValue) {
  let newValue = formatStyle(value)
  for (let prop of Object.keys(newValue)) {
    let val = newValue[prop]
    if (!oldValue || oldValue[prop] !== val) {
      node.style[prop] = val
    }
  }
  return newValue
}

function formatStyle (value) {
  if (Array.isArray(value)) {
    return value.reduce((result, item) => {
      return Object.assign(result, formatStyle(item))
    }, {})
  }
  if (instance(value) === '[object Object]') {
    let styles = {}
    for(let prop of Object.keys(value)) {
      let normalizedProp = normalize(prop).replace(/[A-Z]/g, match => '-' + match.toLowerCase())
      if (!normalizedProp) {
        continue
      }
      let val = value[prop]
      if (Array.isArray(val)) {
        let div = document.createElement('div')
        for (let i = 0, len = val.length; i < len; i++) {
          div.style[normalizedProp] = val[i]
        }
        styles[normalizedProp] = div.style[normalizedProp]
      } else {
        styles[normalizedProp] = val
      }
    }
    return styles
  }
  return {}
}

/**
 * autoprefixer
 * @param {string} prop css prop needed to be prefixed
 */
function normalize (prop) {
  prop = camelize(prop)
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }

  const capName = prop.charAt(0).toUpperCase() + prop.slice(1)
  for (let i = 0; i < vendorNames.length; i++) {
    const name = vendorNames[i] + capName
    if (name in emptyStyle) {
      return name
    }
  }
  return ''
}

function bindText (node, value, oldValue) {
  if (value == null) {
    value = ''
  }
  if (value !== oldValue) {
    node.textContent = value
  }
  return value
}

const BOOLEAN_ATTRS = [
  'checked',
  'selected',
  'autofocus',
  'controls',
  'disabled',
  'hidden',
  'multiple',
  'readonly'
]

function bindAttribute (node, key, value, oldValue) {
  let [prefix, attr] = key.split(':')
  if (prefix !== 'm-bind') {
    return
  }
  let prop = typeof value === 'object' ? JSON.stringify(value) : value
  if (prop === oldValue) {
    return prop
  }
  if (prop === '' || prop === undefined) {
    node.removeAttribute(attr)
  } else {
    node.setAttribute(attr, prop)
  }
  if (attr === 'value') {
    node[attr] = prop
  } else if (BOOLEAN_ATTRS.indexOf(attr) > -1) {
    node[attr] = !!prop
  }

  return prop
}

function setData (data) {
  let {global, page} = classifyGlobalData(data)
  let changes = merge(MIP_DATA, page)
  notifyDataChange(changes)
  updateGlobalData(global)
}
// function isElementNode (node) {
//   return node.nodeType === 1
// }


function getData (key, data = MIP_DATA) {
  let keys = key.split('.')
  let result = data
  for (let k of keys) {
    if (result == null) {
      return undefined
    }
    result = result[k]
  }
  return result
}

// function getData (key) {
//   try {
//     let fn = parse(key, 'MemberExpression')
//     return fn({data: MIP_DATA})
//   } catch (e) {

//     return getDataFallback(key, MIP_DATA)
//   }
// }

function watchData (expr, callback) {
  MIP_DATA_WATCHES[expr] = MIP_DATA_WATCHES[target] || []
  MIP_DATA_WATCHES[expr].push(callback)
}

