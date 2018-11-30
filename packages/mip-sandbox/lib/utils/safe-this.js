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
 * 上面的 this 指向 window
 *
 * @param {Object} that this
 * @return {Function} 返回 safe this 的方法
 */
module.exports = function safeThis (sandbox) {
  // safe this
  return function (that) {
    return that === window ? sandbox : that === document ? sandbox.document : that
  }
}
