/**
 * @file unsafe-detect.js
 * @author clark-t (clarktanglei@163.com)
 */

var detect = require('./global-detect')
var is = require('./utils/is')

module.exports = function (code, keywords) {
  var unsafeList = []
  keywords = keywords || []

  detect(code, function (node, parent, ast) {
    if (is(node, 'ThisExpression')) {
      return
    }

    if (keywords.indexOf(node.name) === -1) {
      unsafeList.push(node)
    }
  })
  return unsafeList
}
