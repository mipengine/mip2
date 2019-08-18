/**
 * @file dom-watcher.js
 * @author clark-t (clarktanglei@163.com)
 */

import { isElementNode } from '../../util/dom/dom'
import {
  traverse
} from '../../util/fn'

import {
  isBindingAttr
} from './binding'

class DOMWatcher {
  constructor () {
    this.doms = []
    this.watchers = []
  }

  watch (watcher) {
    this.watchers.push(watcher)
  }

  add (doms) {
    for (let dom of doms) {
      this.doms.push(dom)
    }
  }

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

  query (root = document.documentElement) {
    let bindings = queryBindings(root)
    return diffBindingDOMs(this.doms, bindings)
  }

  update ({add: domList}) {
    let add = []

    for (let dom of domList) {

    }

    // let addList = changed && changed.add || [root]
    // let removedList changed && changed.removed || []


    if (changed) {

      // changed = {
      //   add: changed.add.map(createBindingNode).filter(removeNull),
      //   removed: changed.removed.map(node => createBindingNodeWrapper(node))
      // }
      // console.log('---- updated ----')
      // console.log(changed)
      // changed = this.query(root)
    } else {
      let newChange = this.query(root)
    }
    let {add, removed} = changed

    this.remove(removed)
    this.add(add)

    for (let watcher of this.watchers) {
      watcher(changed, this.doms)
    }
  }
}

function removeNull (val) {
  return val != null
}

function createBindingNode (node) {
  if (!isElementNode(node)) {
    return
  }
  let attrs = queryBindingAttrs(node)
  if (attrs) {
    return createBindingNodeWrapper(node, attrs)
  }
}

function createBindingNodeWrapper (node, attrs) {
  let wrapper = { node, attrs }
  if (attrs) {
    wrapper.keys = Object.keys(attrs)
  }
  return wrapper
}

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

