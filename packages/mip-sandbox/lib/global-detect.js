/**
 * @file global-detect.js
 * @author clark-t (clarktanglei@163.com)
 */

var mark = require('./global-mark')
var estraverse = require('estraverse')
var is = require('./utils/is')

module.exports = function (code, fn, type) {
  var ast = mark(code)

  estraverse[type || 'traverse'](ast, {
    enter: function (node, parent) {
      if (is(node, 'ThisExpression')) {
        return fn.call(this, node, parent, ast)
      }

      if (!is(node, 'Identifier')) {
        return
      }

      if (node.isVar || node.isIgnore) {
        return
      }

      if (hasBinding(node.name, this)) {
        return
      }

      return fn.call(this, node, parent, ast)
    },
    fallback: 'iteration'
  })

  return ast
}

function hasBinding (name, context) {
  var parents = context.parents()
  for (var i = parents.length - 1; i > -1; i--) {
    if (parents[i].vars && parents[i].vars.indexOf(name) > -1) {
      return true
    }
  }

  return false
}
