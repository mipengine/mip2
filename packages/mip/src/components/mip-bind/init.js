/**
 * @file mip-bind init
 * @author clark-t (clarktanglei@163.com)
 * @description 在现有 MIP-bind 的模式下，mip-data 只能通过唯一的 MIP.setData
 * 进行数据修改,所以完全可以通过每次调用 MIP.setData
 * 的时候进行新旧数据比对，然后触发各种事件事件监听、数据绑定等等就可以了
 */

import {isElementNode} from '../../util/dom/dom'
import {traverse} from '../../util/fn'
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
  const store = new DataStore()

  MIP.setData = store.set.bind(store)
  MIP.getData = store.get.bind(store)
  MIP.watch = store.watcher.watch.bind(store.watcher)

  // @deprecated
  window.mipDataPromises = {}
  window.m = store.data
  MIP.$set = MIP.setData
  MIP.$update = store.global.broadcast.bind(store.global)

  let bindings = queryBindings(document.documentElement)
  // @TODO 新增对节点元素的监听
  addInputListener(bindings, store)
  addBindingListener(bindings, store)

  MIP.setData(store.global.data)
}

function queryBindings (root) {
  let results = []
  traverse(root, node => {
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

function addInputListener (nodeInfos, store) {
  const key = 'm-bind:value'

  const FORM_ELEMENTS = [
    'INPUT',
    'TEXTAREA',
    'SELECT'
  ]

  for (let info of nodeInfos) {
    let {node, attrs} = info
console.log(node.tagName)
    if (!FORM_ELEMENTS.includes(node.tagName)) {
      continue
    }

    let expression = attrs[key] && attrs[key].expr

    if (!expression) {
      continue
    }

    const properties = expression.split('.')
console.log('---- in here --- ?')
    node.addEventListener('input', e => {
      let obj = createSetDataObject(properties, e.target.value)
      store.set(obj)
    })
  }
}

function addBindingListener (nodeInfos, store) {
  store.watcher.watch(() => {
    for (let info of nodeInfos) {
      try {
        applyBinding(info, store.data)
      } catch (e) {
        logger.error(e)
      }
    }
  })
}

