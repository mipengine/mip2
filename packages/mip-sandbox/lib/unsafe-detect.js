/**
 * @file unsafe-detect.js
 * @author clark-t (clarktanglei@163.com)
 */

var detect = require('./global-detect')
var KEYWORDS = require('./safe-keywords')

var WINDOW_SAFE_KEYWORDS = KEYWORDS.WINDOW_ORIGINAL_KEYWORDS
  .concat(KEYWORDS.RESERVED_KEYWORDS)
  .concat(KEYWORDS.WINDOW_CUSTOM_KEYWORDS)

module.exports = function (code) {
  var unsafeList = []
  detect(code, function (node, parent, ast) {
    if (detect.is(node, 'ThisExpression')) {
      return
    }

    if (WINDOW_SAFE_KEYWORDS.indexOf(node.name) === -1) {
      unsafeList.push(node)
    }
  })

  if (unsafeList.length) {
    return unsafeList
  }
}
