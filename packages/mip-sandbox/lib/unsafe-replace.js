/**
 * @file unsafe-replace.js
 * @author clark-t (clarktanglei@163.com)
 */

var detect = require('./global-detect')
var is = require('./utils/is')
var t = require('./utils/type')

function memberExpression (name) {
  var keys = name.split('.')
  var expression = t.identifier(keys[0])
  for (var i = 1; i < keys.length; i++) {
    expression = t.memberExpression(expression, t.identifier(keys[i]))
  }
  return expression
}

function safeThisExpression (prefix) {
  return t.callExpression(
    memberExpression(prefix + '.this'),
    [t.thisExpression()]
  )
}

module.exports = function (code, keywords, prefix) {
  keywords = keywords || []
  prefix = prefix || 'MIP.sandbox'

  return detect(
    code,
    function (node, parent) {
      if (is(node, 'ThisExpression')) {
        this.skip()
        return safeThisExpression(prefix)
      }

      if (keywords.indexOf(node.name) === -1) {
        this.skip()
        if (is(parent, 'Property', {shorthand: true})) {
          parent.shorthand = false
        }
        return memberExpression(prefix + '.' + node.name)
      }
    },
    'replace'
  )
}
