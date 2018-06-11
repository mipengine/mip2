/**
 * @file keys.js
 * @author clark-t (clarktanglei@163.com)
 */

module.exports = function (node) {
  return node.map(function (child) {
    if (typeof child === 'string') {
      return child
    }
    return child.name
  })
}
