/**
 * @file dom-watcher.js
 * @author clark-t (clarktanglei@163.com)
 */

// /**
//  * binding dom list
//  *
//  * @type {Array.<HTMLElement>}
//  */
// const doms = []

// export function getBindingDOMs () {
//   return doms
// }

class DOMWatcher {
  constructor () {
    this.doms = []
  }

  get () {
    return this.doms
  }

  add (doms) {

  }

  remove (doms) {

  }
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

export const instance = new DOMWatcher()

