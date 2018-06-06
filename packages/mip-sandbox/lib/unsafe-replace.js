/**
 * @file unsafe-replace.js
 * @author clark-t (clarktanglei@163.com)
 */

var escodegen = require('escodegen')
var detect = require('./global-detect')
var KEYWORDS = require('./safe-keywords')

var WINDOW_SAFE_KEYWORDS = KEYWORDS.WINDOW_ORIGINAL_KEYWORDS
  .concat(KEYWORDS.RESERVED_KEYWORDS)

module.exports = function (code, options) {
  var ast = detect(
    code,
    function (node) {
      if (detect.is(node, 'ThisExpression')) {
        this.skip()
        return callExpression(sandboxExpression('this'), [thisExpression()])
      }

      if (WINDOW_SAFE_KEYWORDS.indexOf(node.name) === -1) {
        this.skip()
        return sandboxExpression(node.name)
      }
    },
    'replace'
  )

  return escodegen.generate(ast, options)
}

function sandboxExpression (name) {
  return {
    type: 'MemberExpression',
    computed: false,
    object: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'MIP'
      },
      property: {
        type: 'Identifier',
        name: 'sandbox'
      }
    },
    property: {
      type: 'Identifier',
      name: name
    }
  }
}

function callExpression (call, args) {
  return {
    type: 'CallExpression',
    callee: call,
    arguments: args
  }
}

function thisExpression () {
  return {
    type: 'ThisExpression'
  }
}
