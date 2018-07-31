/**
 * @file shortcut for entering iframe and check
 * @author wangyisheng@baidu.com (wangyisheng)
 */
exports.command = function (url, callback) {
  let browser = this
  this.element('css selector', `iframe[data-page-id*="${url}"]`, function (frame) {
    // enter iframe[src='tree.html'] and check
    browser.frame({ ELEMENT: frame.value.ELEMENT }, () => {
      callback()
    })
  })

  this.frame(null)

  return this
}
