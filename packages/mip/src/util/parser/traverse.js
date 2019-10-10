/**
 * @file traverse.js
 * @author clark-t (clarktanglei@163.com)
 */

import {ScopeManager} from './scope'

/**
 * 按深度遍历的方式遍历 AST 节点生成 function
 *
 * @param {Object} visitor AST 节点处理描述对象
 * @param {ASTNode} node AST 节点
 * @param {ASTNode=} parent node 节点的父节点
 * @return {Function} 表达式 AST 转化得到的可执行函数
 */
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

