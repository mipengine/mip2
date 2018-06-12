/**
 * @file keys.js
 * @author clark-t (clarktanglei@163.com)
 */

module.exports = function (node, reserved) {
  if (!reserved) {
    return node.map(function (child) {
      if (typeof child === 'string') {
        return child
      }
      return child.name
    })
  }

  return node.filter(function (child) {
    return typeof child === 'string'
  })
}
