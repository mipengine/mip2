/**
 * @file traverse.js
 * @author clark-t (clarktanglei@163.com)
 */
import {ScopeManager} from './scope'

function traverse (visitor, node, parent, scopeManager) {
  let path = new Path(visitor, node, parent, scopeManager)
  let fn = visitor[node.type](path)
  return callback.bind(path)
  // return callback.bind(path)
  // return path.callback.bind(path)
  // let fn = visitor[node.type](path)

  // return (args = {}, manager) => {
    // path.args = args
    // path.scopeManager.setParent(manager)
  // }
  // let innerArgs
  // let scopeManager = new ScopeManager()

  // const path = {
  //   node: node,
  //   parent: parent,
  //   traverse: (child, parent) => {
  //     let fn = traverse({
  //       node: child,
  //       parent: parent || node,
  //       visitor: visitor
  //     })

  //     return () => fn(innerArgs, scopeManager)
  //   },
  //   scopeManager
  // }

  // let fn = visitor[node.type](path)

  // return (args = {}, manager) => {
  //   innerArgs = args
  //   scopeManager.setParent(manager)
  //   return fn(args)
  // }
}

function callback (args = {}) {
  this.args = args
  return this.fn(args)
}

class Path {
  constructor (visitor, node, parent, scopeManager) {
    this.node = node
    this.visitor = visitor
    this.parent = parent

    this.args = null
    this.scopeManager = new ScopeManager(scopeManager)
  }

  traverse (child, parent) {
    let childFn = traverse(
      this.visitor,
      child,
      parent || this.node,
      this.scopeManager
    )

    return () => childFn(this.args)
  }
}

export default traverse

