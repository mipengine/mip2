/**
 * @file safe-this.js
 * @author clark-t (clarktanglei@163.com)
 */

/**
 * this sandbox，避免诸如
 *
 * (function () {
 *   console.log(this)
 * }).call(undefined)
 *
 * this 指向 window
 *
 * @param {Object} sandbox 沙盒对象实现
 * @return {Function} 返回 safe this 的方法
 */
module.exports = function (sandbox) {
  return function (that) {
    return that === window ? sandbox : that === document ? sandbox.document : that
  }
}
