/**
 * @file global-mark.js
 * @author clark-t (clarktanglei@163.com)
 */

var acorn = require('acorn-dynamic-import').default
// var esprima = require('esprima')
var estraverse = require('estraverse')
var is = require('./utils/is')

module.exports = function (code) {
  var ast
  if (typeof code === 'string') {
    ast = acorn.parse(code, {
      ecmaVersion: 8,
      sourceType: 'module',
      locations: true,
      plugins: {dynamicImport: true}
    })
  } else {
    ast = code
  }

  // var ast = esprima.parseModule(code, {
  //   range: true,
  //   loc: true
  // })

  if (!ast.sandboxFlag) {
    mark(ast)
    scope(ast)
    ast.sandboxFlag = true
  }

  return ast
}

function mark (ast) {
  // 作用域内变量定义 Identifier case
  // 1. import
  //    1. import a from 'xxx' 的 a
  //    2. import {a as b} from 'xxx' 的 b
  //    3. import * as c from 'xxx' 的 c
  // 2. var/let/const
  //    1. var a = 1 的 a
  //    2. var {a: b} = {a: 1} 中的 b
  //    3. var [a, b] 中的 a, b
  //    4. var [a, ...b] 中的 b
  //    5. var {a = 1} 中的 a
  // 3. FunctionDeclaration
  //    1. function a() {} 中的 a
  // 4. ClassDeclaration
  //    1. Class A extends B {} 中的 A
  // 5. Function params
  //    1. function a(args) {} 中的 args
  //    2. var a = function (args) {} 中的 args
  //    3. var b = (args) => {} 中的 args
  // 6. CatchClause
  //    1. try {} catch (e) {} 的 e
  //    2. 这个 e 有可能会以解构的形式去写

  // 无需关心的 Identifier case
  // 1. MemberExpression
  //    1. a.b.c 中的 b、c 但 a[b].c 中只有 c 不需要关心
  // 2. Property 包括解构赋值和普通的 Object 定义
  //    1. {a: b} 中的 a 但 {[a]: b} 中的 a 需要关心
  // 3. MethodDefinition
  //    1. class A {a() {}} 中的 a 但 class A {[a]() {}} 中的 a 需要关心
  // 4. FunctionExpression
  //    1. var a = function b() {} 中的 b 因为 b() 是无效的
  // 5. import
  //    1. import {a as b} from 'xxx' 中的 a

  // 变量提升
  // 1. var
  //    var a = 1 中的 a
  //    var {a: b} = {} 中的 b
  //    var [a, {b: {c: [d]}}, f = 1, ...e] = [] 中的 a d f e
  // 2. function
  //    function a() {} 中的 a

  estraverse.traverse(ast, {
    enter: function (node, parent) {
      // 标记变量声明
      if (is(node, /^Import\w*Specifier$/)) {
        if (node.local) {
          node.local.isVar = true
        }
        if (node.imported && is(node.imported, 'Identifier')) {
          node.imported.isIgnore = true
        }
      } else if (is(node, 'VariableDeclaration')) {
        if (node.kind === 'var') {
          node.declarations.forEach(elem => {
            elem.isLift = true
          })
        }
      } else if (is(node, 'VariableDeclarator')) {
        if (is(node.id, 'Identifier')) {
          node.id.isVar = true
        }

        node.id.isLift = node.isLift
      } else if (is(node, 'ObjectPattern')) {
        node.properties.forEach(function (elem) {
          if (is(elem.value, 'Identifier')) {
            elem.value.isVar = true
          }

          elem.value.isLift = node.isLift
        })
      } else if (is(node, 'ArrayPattern')) {
        node.elements.forEach(function (elem) {
          if (is(elem, 'Identifier')) {
            elem.isVar = true
          }

          elem.isLift = node.isLift
        })
      } else if (is(node, 'AssignmentPattern')) {
        node.left.isVar = true
        node.left.isLift = node.isLift
      } else if (is(node, 'RestElement')) {
        if (is(node.argument, 'Identifier')) {
          node.argument.isVar = true
        }
        node.argument.isLift = node.isLift
      } else if (is(node, /Function/)) {
        if (node.id) {
          if (node.type === 'FunctionDeclaration') {
            node.id.isVar = true
            node.id.isLift = true
          } else {
            // FunctionExpression 的 id 没用
            // var a = function b () {} 这个没法在最下面使用 b()
            node.id.isIgnore = true
          }

          node.id.isVar = true
        }

        node.params.forEach(function (elem) {
          if (is(elem, 'Identifier')) {
            elem.isVar = true
          }
        })
      } else if (is(node, 'ClassDeclaration')) {
        // 可能会存在匿名类的情况 export default class {} 此时 id 为 null
        if (node.id) {
          node.id.isVar = true
        }
      } else if (is(node, 'CatchClause')) {
        if (is(node.param, 'Identifier')) {
          node.param.isVar = true
        }
      } else if (is(node, 'MemberExpression')) {
        // a.b.c 的 b c 忽略
        if (is(node.property, 'Identifier') && !node.computed) {
          node.property.isIgnore = true
        }
      } else if (is(node, 'Property')) {
        if (is(node.key, 'Identifier') && !node.computed) {
          // 在 acorn 里面，类似 var a = {b} 的这种情况 property 的 key 跟 value 指向同一个 Identifier object 非常蛋疼
          if (node.shorthand) {
            node.key = clone(node.key)
            node.key.isIgnore = true
          }
          node.key.isIgnore = true
        }
      } else if (is(node, 'MethodDefinition') && !node.computed) {
        node.key.isIgnore = true
      } else if (is(node, 'Import')) {
        // import('a/b/c') 这种情况，在 sandbox 检测的时候只要当成普通的 function 就好，不然 estraverse 和 escodegen 都得报错
        node.type = 'Identifier'
        node.name = 'import'
        node.isIgnore = true
      } else if (is(node, 'ExportSpecifier')) {
        node.exported.isIgnore = true
        node.local.isIgnore = true
      }
    }
  })
}

function scope (ast, parentAst) {
  // 标记 scope case
  // 1. Program 是 top scope
  // 2. *Function* 其中 ArrowFunctionExpression 的 body 不一定带 BlockStatement
  //    1. FunctionDeclaration
  //    2. FunctionExpression
  //    3. ArrowFunctionExpression
  // 3. BlockStatement 只会影响 const/let
  // 4. ForStatement 只会影响 const/let

  parentAst = parentAst || []
  estraverse.traverse(ast, {
    enter: function (node) {
      if (node === ast) {
        return
      }

      if (is(node, /Function/) ||
        is(node, 'BlockStatement') ||
        is(node, 'ForStatement') ||
        is(node, 'CatchClause')
      ) {
        scope(node, parentAst.concat(ast))
        this.skip()
        return
      }

      if (!is(node, 'Identifier') ||
        !node.isVar
      ) {
        return
      }

      if (node.isLift && parentAst.length) {
        for (var i = parentAst.length - 1; i > -1; i--) {
          if (is(parentAst[i], 'Program') || is(parentAst[i], /Function/)) {
            parentAst[i].vars = parentAst[i].vars || []
            parentAst[i].vars.push(node.name)
            break
          }
        }
      } else {
        ast.vars = ast.vars || []
        ast.vars.push(node.name)
      }
    }
  })
}

function clone (node) {
  return Object.keys(node).reduce(function (obj, key) {
    obj[key] = node[key]
    return obj
  }, {})
}
