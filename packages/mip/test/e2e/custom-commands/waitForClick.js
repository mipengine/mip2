/**
 * mock click in mobile
 * http://nightwatchjs.org/guide#extending
 * https://github.com/nightwatchjs/nightwatch/issues/1606#issuecomment-334428947
 * @param {string} selector
 * @param {number} ms
 */
exports.command = function (selector, ms = 2000) {
  this.execute(function (selector) {
    document.querySelector(selector).click()
    return true
  }, [selector])

  this.pause(ms)

  return this
}
