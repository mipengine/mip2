/**
 * @file traverse.js
 * @author clark-t (clarktanglei@163.com)
 */

function traverse ({node, visitor, parent}) {
  let params

  const path = {
    node: node,
    parent: parent,
    traverse: (child, parent) => {
      let fn = traverse({
        node: child,
        parent: parent || node,
        visitor: visitor
      })

      return () => fn(...params)
    }
  }

  let fn = visitor[node.type](path)

  return (...args) => {
    params = args
    return fn(...args)
  }
}

export default traverse

