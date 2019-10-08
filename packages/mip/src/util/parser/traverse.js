/**
 * @file traverse.js
 * @author clark-t (clarktanglei@163.com)
 */
import {ScopeManager} from './scope'

function traverse (visitor, node, parent) {
  let innerArgs
  let scopeManager = new ScopeManager()

  const path = {
    node: node,
    parent: parent,
    traverse: (child, parent) => {
      let fn = traverse(
        visitor,
        child,
        parent || node
      )

      return () => fn(innerArgs, scopeManager)
    },
    scopeManager
  }

  let fn = visitor[node.type](path)

  return (args = {}, manager) => {
    innerArgs = args
    scopeManager.setParent(manager)
    return fn(args)
  }
}

export default traverse

