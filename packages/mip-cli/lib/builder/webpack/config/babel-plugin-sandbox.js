/**
 * @file babel-plugin-sandbox.js
 * @author clark-t (clarktanglei@163.com)
 */

const globals = require('globals')

const SANDBOX_PREFIX = 'MIP.sandbox'
// const SANDBOX_WINDOW = `${SANDBOX_PREFIX}.window`
// const SANDBOX_DOCUMENT = `${SANDBOX_PREFIX}.document`

const RESERVED_KEYWORDS = Array.from(new Set([
  Object.keys(globals.commonjs),
  Object.keys(globals.amd),
  ['arguments', 'undefined', 'Infinity', 'NaN'],
  ['MIP']
]))

// 变量的定义有以下几种
// 1. 全局变量 如 window.xxx -> xxx
// 2. import
//    2.1 import x from 'xxx'
//    3.2 import {x, y} from 'xxx'
//    3.3 import * as x from 'xxx'
// 3. var / let / const
//    3.1 正常的 var a = xxx
//    3.2 解构赋值 {a: {b: c: {}}}
//    3.3 扩展运算符 {x, y, ...z} [a, b, ...[c]]
// 4. function
// 5. class
// 6. function arguments (默认值是否会有影响)
//    6.1 正常参数 function (a) {}
//    6.2 function () {}
//    6.3 function (a = 1) {}
//    6.4 function (...args) {}
//    6.5 function ({a: b: {c}}) {}
//    6.6 (a) => {}
//    6.7 a => a.haha()

module.exports = function ({types: t}) {
  return {
    visitor: {
      Identifier (path, state) {
        let nodeName = path.node.name
        if (nodeName == null) {
          return
        }
        // 判断是否为函数定义
        if (t.isFunctionDeclaration(path.parent, {id: path.node})) {
          return
        }

        if (t.isFunctionExpression(path.parent, {id: path.node})) {
          return
        }

        if (t.isFunctionDeclaration(path.parent) &&
          path.parent.params.indexOf(path.node) > -1
        ) {
          return
        }

        if (t.isArrowFunctionExpression(path.parent) &&
          path.parent.params.indexOf(path.node) > -1
        ) {
          return
        }
        // 判断是否为类定义
        if (t.isClassDeclaration(path.parent, {id: path.node})) {
          return
        }
        // 判断是否为类方法定义
        if (t.isClassMethod(path.parent, {key: path.node})) {
          return
        }
        // 判断是否为对象属性定义
        // 是否为解构赋值的 key
        if (t.isProperty(path.parent, {key: path.node})) {
          return
        }

        // 对象解构赋值
        if (t.isProperty(path.parent, {value: path.node}) &&
          t.isObjectPattern(path.parentPath.parent) &&
          path.parentPath.parent.properties.indexOf(path.parent) > -1
        ) {
          return
        }

        // 数组解构赋值
        if (t.isArrayPattern(path.parent) &&
          path.parent.elements.indexOf(path.node) > -1
        ) {
          return
        }

        // 扩展运算符
        if (t.isRestElement(path.parent, {argument: path.node})) {
          return
        }

        // 判断是否为 var / let / const 定义
        if (t.isVariableDeclarator(path.parent, {id: path.node})) {
          return
        }

        if (t.isMemberExpression(path.parent, {property: path.node})) {
          return
        }

        // 判断是否为 import 语句
        if (path.findParent(path => path.isImportDeclaration())) {
          return
        }

        if (t.isAssignmentPattern(path.parent, {left: path.node})) {
          return
        }

        if (RESERVED_KEYWORDS.indexOf(nodeName) > -1) {
          return
        }

        if (path.scope.hasBinding(nodeName, true)) {
          return
        }

        path.replaceWithSourceString(`${SANDBOX_PREFIX}.${nodeName}`)
        path.skip()
      },
      ThisExpression (path, state) {
        path.replaceWithSourceString(`${SANDBOX_PREFIX}.this(this)`)
        path.skip()
      }
    }
  }
}
