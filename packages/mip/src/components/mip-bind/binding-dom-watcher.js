/**
 * @file dom-watcher.js
 * @author clark-t (clarktanglei@163.com)
 */

import {isElementNode} from '../../util/dom/dom'
import {traverse} from '../../util/fn'

import {isBindingAttr} from './binding'

/**
 * HTML 节点描述
 *
 * @typedef {Object} BindingNodeWrapper
 * @property {HTMLElement} node
 * @property {Object=} attrs 属性键值对
 * @property {Array.<string>=} keys Object.keys(attrs)
 */

/**
 * HTML 节点监听类
 *
 * @class
 */
class DOMWatcher {
  constructor () {
    this.doms = []
    this.watchers = []
  }

  /**
   * 注册节点变化监听函数
   *
   * @param {Function} watcher 监听函数
   */
  watch (watcher) {
    this.watchers.push(watcher)
  }

  /**
   * 增加节点
   *
   * @param {Array.<BindingNodeWrapper>} doms 节点列表
   */
  add (doms) {
    for (let dom of doms) {
      this.doms.push(dom)
    }
  }

  /**
   * 删除节点
   *
   * @param {Array.<BindingNodeWrapper>} doms 节点列表
   */
  remove (doms) {
    let tmps = doms.slice()
    for (let i = this.doms.length - 1; i > -1; i--) {
      for (let j = tmps.length - 1; j > -1; j--) {
        if (this.doms[i].node === tmps[j].node) {
          this.doms.splice(i, 1)
          tmps.splice(j, 1)
          break
        }
      }
    }
  }

  /**
   * 更新节点信息
   *
   * @param {Array.<HTMLElement>} domList 节点列表
   */
  update ({add: domList}) {
    let bindings = []

    for (let dom of domList) {
      uniqueMerge(bindings, queryBindings(dom))
    }

    let changed = diffBindingDOMs(this.doms, bindings)

    this.remove(changed.removed)
    this.add(changed.add)

    for (let watcher of this.watchers) {
      watcher(changed, this.doms)
    }
  }
}

/**
 * 将新列表项合并到旧列表项中
 *
 * @param {Array.<BindingNodeWrapper>} oldList 旧列表项
 * @param {Array.<BindingNodeWrapper>} newList 新增列表项
 * @return {Array.<BindingNodeWrapper>} 合并好数据的旧列表项
 */
function uniqueMerge (oldList, newList) {
  for (let i = 0; i < newList.length; i++) {
    let len = oldList.length
    let j = 0
    for (j = 0; j < len; j++) {
      if (oldList[j].node === newList[i].node) {
        break
      }
    }
    if (j === len) {
      oldList.push(newList[i])
    }
  }
  return oldList
}

/**
 * 将 HTML 节点包装成 BindingNodeWrapper
 *
 * @param {HTMLElement} node 节点
 * @param {Object=} attrs 属性键值
 * @param {BindingNodeWrapper} 包装好的 BindingNodeWrapper
 */
function createBindingNodeWrapper (node, attrs) {
  let wrapper = {node, attrs}
  if (attrs) {
    wrapper.keys = Object.keys(attrs)
  }
  return wrapper
}

/**
 * 将标记了绑定属性的当前节点及其子节点遍历出来
 *
 * @param {HTMLElement} root 根节点
 * @return {Array.<BindingNodeWrapper>} 绑定节点列表
 */
function queryBindings (root) {
  let results = []
  traverse(root, node => {
    /* istanbul ignore if */
    if (!isElementNode(node)) {
      return
    }
    let attrs = queryBindingAttrs(node)
    attrs && results.push(createBindingNodeWrapper(node, attrs))
    if (node.children) {
      return Array.from(node.children)
    }
  })
  return results
}

/**
 * 查找并并获取当前节点的全部绑定属性和表达式
 *
 * @param {HTMLElement} node 节点
 * @return {Object} 绑定属性名和表达式的键值对
 */
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

/**
 * 比对出新增节点和删除节点
 *
 * @param {Array.<BindingNodeWrapper>} 存储的节点
 * @param {Array.<BindingNodeWrapper>} 新增节点
 * @return {Object} 节点的新增和删除信息 {removed: Array, add: Array}
 */
function diffBindingDOMs (storeList, newList) {
  let output = {
    removed: [],
    add: newList.slice()
  }

  for (let i = storeList.length - 1; i > -1; i--) {
    let stored = storeList[i]
    if (!document.contains(stored.node)) {
      output.removed.push(stored)
      continue
    }

    for (let j = output.add.length - 1; j > -1; j--) {
      if (stored.node === newList[j].node) {
        output.add.splice(j, 1)
        break
      }
    }
  }

  return output
}

export const instance = new DOMWatcher()

