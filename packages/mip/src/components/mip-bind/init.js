/**
 * @file mip-bind init
 * @author clark-t (clarktanglei@163.com)
 * @description 在现有 MIP-bind 的模式下，mip-data 只能通过唯一的 MIP.setData
 * 进行数据修改,所以完全可以通过每次调用 MIP.setData
 * 的时候进行新旧数据比对，然后触发各种事件事件监听、数据绑定等等就可以了
 */

import {isElementNode} from '../../util/dom/dom'
import {traverse, throttle, noop} from '../../util/fn'
import {
  createSetDataObject
} from './util'
import DataStore from './data-store'
import {
  applyBinding,
  isBindingAttr
} from './binding'
import log from '../../util/log'

const logger = log('MIP-bind')

export default function () {
  let bindingDOMs = []

  const store = new DataStore()
  const getData = store.get.bind(store)
  const setData = store.set.bind(store)
  const $set = data => {
    let bindings = queryBindings(document.documentElement)
    let {add} = diffBindingDOMs(bindingDOMs, bindings)

    if (bindingDOMs.length > 0 && add.length > 0) {
      logger.warn(`请勿在动态创建的节点上使用 m-bind`)
    }
    addInputListener(add, store)
    for (let item of add) {
      bindingDOMs.push(item)
    }
    MIP.setData(data)
  }
  const watch = store.watcher.watch.bind(store.watcher)

  def(MIP, 'setData', () => setData)
  def(MIP, '$set', () => $set)
  def(MIP, 'getData', () => getData)
  def(MIP, 'watch', () => watch)

  // MIP.setData = store.set.bind(store)
  // MIP.getData = store.get.bind(store)
  // MIP.watch = store.watcher.watch.bind(store.watcher)

  // @deprecated
  window.mipDataPromises = []
  window.m = store.data
  // 兼容原有逻辑
  // MIP.$set = MIP.setData
  MIP.$update = store.global.broadcast.bind(store.global)

  store.watcher.watch(() => {
    for (let info of bindingDOMs) {
      try {
        applyBinding(info, store.data)
      } catch (e) /* istanbul ignore next */ {
        logger.error(e)
      }
    }
  })

  MIP.$set(store.global.data)
}

function def (obj, name, getter, setter) {
  Object.defineProperty(obj, name, {
    get: getter,
    set: typeof setter === 'function' ? setter : noop,
    enumerable: true,
    configurable: false
  })
}

function queryBindings (root) {
  let results = []
  traverse(root, node => {
    /* istanbul ignore if */
    if (!isElementNode(node)) {
      return
    }
    let attrs = queryBindingAttrs(node)
    attrs && results.push({node, attrs, keys: Object.keys(attrs) })
    if (node.children) {
      return Array.from(node.children)
    }
  })
  return results
}

function queryBindingAttrs (node) {
  let attrs
  for (let i = 0; i < node.attributes.length; i++) {
    let attr = node.attributes[i]
    if (!isBindingAttr(attr.name)) {
      continue
    }
    attrs = attrs || {}
    attrs[attr.name] = {expr: attr.value}
  }
  return attrs
}

function diffBindingDOMs (storeList, newList) {
  let output = {
    // removed: [],
    add: []
  }

  const storeLength = storeList.length

  for (let item of newList) {
    let i
    for (i = 0; i < storeLength; i++) {
      if (item.node === storeList[i].node) {
        break
      }
    }

    if (i === storeLength) {
      output.add.push(item)
    }
  }

  return output
}

function addInputListener (nodeInfos, store) {
  const key = 'm-bind:value'

  const FORM_ELEMENTS = [
    'INPUT',
    'TEXTAREA',
    'SELECT'
  ]

  for (let info of nodeInfos) {
    let {node, attrs} = info
    if (FORM_ELEMENTS.indexOf(node.tagName) === -1) {
    // if (!FORM_ELEMENTS.includes(node.tagName)) {
      continue
    }

    let expression = attrs[key] && attrs[key].expr

    if (!expression) {
      continue
    }

    const properties = expression.split('.')
    const inputThrottle = throttle(function (e) {
      let obj = createSetDataObject(properties, e.target.value)
      store.set(obj)
    }, 100)
    node.addEventListener('input', inputThrottle)
  }
}

// function addBindingListener (nodeInfos, store) {
//   }

