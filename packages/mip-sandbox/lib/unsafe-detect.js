/**
 * @file unsafe-detect.js
 * @author clark-t (clarktanglei@163.com)
 */

var detect = require('./global-detect')
var keywords = require('./keywords')
var is = require('./utils/is')

var WINDOW_SAFE_KEYWORDS = keywords.WINDOW_ORIGINAL
  .concat(keywords.RESERVED)
  .concat(keywords.WINDOW_CUSTOM)

module.exports = function (code) {
  var unsafeList = []

  detect(code, function (node, parent, ast) {
    if (is(node, 'ThisExpression')) {
      return
    }

    if (WINDOW_SAFE_KEYWORDS.indexOf(node.name) === -1) {
      unsafeList.push(node)
    }
  })
  return unsafeList
}
