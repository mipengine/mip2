/**
 * @file flatten.js
 * @author clark-t (clarktanglei@163.com)
 */

module.exports = function (arr) {
  return Array.prototype.concat.apply([], arr)
}
