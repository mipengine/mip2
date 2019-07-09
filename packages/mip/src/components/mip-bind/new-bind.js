/**
 * @file bind.js
 * @author clark-t (clarktanglei@163.com)
 * @description 在现有 MIP-bind 的模式下，mip-data 只能通过唯一的 MIP.setData
 * 进行数据修改,所以完全可以通过每次调用 MIP.setData
 * 的时候进行新旧数据比对，然后触发各种事件事件监听、数据绑定等等就可以了
 */
import platform from '../../util/platform'
import {parse} from '../../util/event-action/parser'
import log from '../../util/log'

const logger = log('MIP-Bind')

const MIP_DATA = {}
const MIP_DATA_CHANGES = []
const MIP_DATA_PROMISES = []
const MIP_DATA_WATCHES = {}
let bindingElements = []

export default function () {
  // let win = window
  // @TODO deprecated
  window.m = MIP_DATA
  window.mipDataPromises = MIP_DATA_PROMISES
  if (isSelfParent()) {
    window.g = {}
  }

  MIP.setData = setData
  MIP.$set = setData
  MIP.getData = getData
  MIP.watch = watchData
  MIP.$update = updateIframeData

  bindingElements = getBindingElements([document.documentElement])
  let globalData = getGlobalData()
  MIP.setData(globalData)
}

function getBindingElements (roots) {
  let results = []
  let stacks = roots
  while (stacks.length) {
    let node = stacks.pop()
    if (!isElementNode(node)) {
      continue
    }
    let bindingAttrs
    for (let i = 0; i < node.attributes.length; i++) {
      let attr = node.attributes[i]
      if (!isBindingAttribute(attr.name)) {
        continue
      }
      bindingAttrs = bindingAttrs || {}
      bindingAttrs[attr.name] = [attr.value, null]
    }
    if (bindingAttrs) {
      results.push([node, bindingAttrs])
    }
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        stacks.push(node.childNodes[i])
      }
    }
  }
  return results
}

function applyBindingAttributes (node, attrs) {
  for (let key of Object.keys(attrs)) {
    let [expression, oldValue] = attrs[key]
    let fn
    try {
      fn = parse(expression, 'ConditionalExpression')
    } catch (e) {
      console.error(e)
      continue
    }
    let value
    try {
      value = fn({data: MIP_DATA})
    } catch (e) {}

    switch (key) {
      case 'm-bind:class':
        value = bindClass(node, value, oldValue)
        break
      case 'm-bind:style':
        value = bindStyle(node, value, oldValue)
        break
      case 'm-text':
        value = bindText(node, value, oldValue)
        break
      case 'm-bind:value':
        // @TODO
        // case 'm-value':
        break
      default:
        value = bindAttribute(node, key, value, oldValue)
        break
    }
    attrs[key][1] = value
  }
}

function bindClass (node, value, oldValue) {
  let change
  if (oldValue == null) {
    change = {}
  } else {
    change = Object.keys(oldValue)
      .filter(key => oldValue[key])
      .reduce((result, className) => {
        result[className] = false
        return result
      }, {})
  }
  let newValue = formatClass(value)
  Object.assign(change, newValue)
  for (let className of Object.keys(change)) {
    node.classList.toggle(className, change[className])
  }
  return newValue
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
    return value.reduce((result, item) => {
      return Object.assign(result, formatClass(item))
    }, {})
  }

  if (instance(value) === '[object Object]') {
    return Object.keys(value)
      .reduce((result, key) => {
        result[key] = !!value[key]
        return result
      }, {})
  }

  return {}
}

function bindStyle (node, value, oldValue) {

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
  let {global, page} = classify(data)
  let changes = merge(MIP_DATA, page)
  notifyDataChange(changes)
  if (isValidObject(global)) {
    updateGlobalData(global)
  }
}

let dataChangePending = false

function notifyDataChange (changes) {
  // @TODO 利用变动信息对 bind 属性控制得更精细些
  if (!changes.length) {
    return
  }

  mergeChange(changes)

  if (!dataChangePending) {
    dataChangePending = true
    nextTick(flushChange)
  }
}

function mergeChange (changes) {
  // 合并修改
  for (let change of changes) {
    let i
    let max = MIP_DATA_CHANGES.length
    for (i = 0; i < max; i++) {
      let stored = MIP_DATA_CHANGES[i]
      if (change[0].indexOf(stored[0]) === 0) {
        break
      }
      if (stored[0].indexOf(change[0]) === 0) {
        MIP_DATA_CHANGES.splice(i, 1)
        MIP_DATA_CHANGES.push(change)
        break
      }
    }
    if (i === max) {
      MIP_DATA_CHANGES.push(change)
    }
  }
}

function flushChange () {
  dataChangePending = false
  flushBindingAttribues()
  flushDataWatching()
}

function flushBindingAttribues () {
  for (let node of bindingElements) {
    try {
      applyBindingAttributes(node[0], node[1])
    } catch (e) {
      logger.error(e)
    }
  }
}

function flushDataWatching () {
  let copies = MIP_DATA_CHANGES.slice()
  MIP_DATA_CHANGES.length = 0
  let watchKeys = Object.keys(MIP_DATA_WATCHES)
  for (let i = 0; i < copies.length; i++) {
    let change = copies[i]
    let [changeKey, oldValue] = change
    for (let j = 0; j < watchKeys.length; j++) {
      let watchKey = watchKeys[j]
      if (watchKey.indexOf(changeKey) !== 0) {
        continue
      }
      watchKeys.splice(j, 1)
      let callbacks = MIP_DATA_WATCHES[watchKey]
      let newVal = getData(watchKey)
      let oldVal
      if (watchKey === changeKey) {
        oldVal = oldValue
      } else {
        let restKey = watchKey.slice(changeKey.length + 1)
        oldVal = getData(restKey, oldValue)
      }
      for (let callback of callbacks) {
        try {
          callback(newVal, oldVal)
        } catch (e) {
          logger.error(e)
        }
      }
    }
  }

}

function isBindingAttribute (attr) {
  return attr.slice(0, 2) === 'm-'
}

function isElementNode (node) {
  return node.nodeType === 1
}


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

function watchData (target, callback) {
  MIP_DATA_WATCHES[target] = MIP_DATA_WATCHES[target] || []
  MIP_DATA_WATCHES[target].push(callback)
}

function updateIframeData (data, pageId) {
  let frames = win.document.getElementsByTagName('iframe')
  for (let i = 0; i < frames.length; i++) {
    let frame = frames[i]
    let framePageId = frame.getAttribute('data-page-id')
    if (frame.classList.contains('mip-page__iframe') &&
      framePageId &&
      pageId !== framePageId
    ) {
      let subwin = frame.contentWindow
      subwin && subwin.MIP && subwin.MIP.setData(data)
    }
  }
}

function instance (obj) {
  return Object.prototype.toString.call(obj)
}

function merge (oldVal, newVal, replace = true) {
  let change = []

  let stack = [[oldVal, newVal, '']]
  while (stack.length) {
    let [oldNode, newNode, parentKey] = stack.pop()
    let newKeys = Object.keys(newNode)
    for (let key of newKeys) {
      // 对象完全一样就没有 diff 了，
      // 所以 object 等情况的数据需要 object.assign
      if (newNode[key] === oldNode[key]) {
        continue
      }

      if (parentKey === '') {
        parentKey = key
      } else {
        parentKey = `${parentKey}.${key}`
      }

      let newInstance = instance(newNode[key])

      if (newInstance !== '[object Object]' ||
        newInstance != instance(oldNode[key])
      ) {
        if (replace || oldNode[key] === undefined) {
          change.push([parentKey, oldNode[key]])
          oldNode[key] = newNode[key]
        }
        continue
      }

      stack.push([oldNode[key], newNode[key], parentKey])
    }
  }
  return change
}

function classify (data) {
  return Object.keys(data).reduce((result, key) => {
      if (typeof data[key] === 'function') {
        throw 'setData method MUST NOT be Function: ${key}'
      }
      let realKey
      if (key[0] === '#') {
        realKey = key.substr(1)
        result.global[realKey] = data[key]
      } else {
        realKey = key
      }
      result.page[realKey] = data[key]
      return result
    },
    {global: {}, page: {}}
  )
}

/*
 * Tell if the page is rootPage - crossOrigin page is rootpage too
 * @param {Object} win window
 */
function isSelfParent () {
  let page = window.MIP.viewer.page
  return page.isRootPage || /* istanbul ignore next */ page.isCrossOrigin
}
/*
 * get the unique global data stored under rootpage
 * @param {Object} win window
 */
function getGlobalData () {
  return isSelfParent() ? window.g : /* istanbul ignore next */ window.parent.g
}

function updateGlobalData (data) {
  let parentWin
  let isParent = isSelfParent()
  if (!isParent) {
    parentWin = window.parent
  } else {
    parentWin = window
  }
  let pageId = win.location.href.replace(win.location.hash, '')
  nextTick(() => {
    !isParent && parentWin.MIP.setData(data)
    merge(parentWin.g, data)
    parentWin.MIP.$update(data, pageId)
  })
}

function isValidObject(obj) {
  return Object.keys(obj).length > 0
}

// https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js

let callbacks = []
const p = Promise.resolve()
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice()
  callbacks.length = 0
  for (let callback of copies) {
    callback()
  }
}

function noop () {}

const timerFunc = () => {
  p.then(flushCallbacks)
  platform.isIOS && setTimeout(noop)
}

function nextTick (callback) {
  callbacks.push(() => {
    try {
      callback()
    } catch (e) {
      console.error(e)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
}

