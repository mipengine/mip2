/**
 * @file sandbox.js
 * @author clark-t (clarktanglei@163.com)
 */

// only use in browser env

var keywords = require('./keywords')
var defUtils = require('./utils/def')

var sandbox = {}

defUtils.defs(sandbox, keywords.WINDOW_ORIGINAL)
defUtils.def(sandbox, 'window', sandbox)

var sandboxDocument = {}

defUtils.defs(sandboxDocument, keywords.DOCUMENT_ORIGINAL, {host: document, setter: true})
defUtils.def(sandbox, 'document', sandboxDocument)
defUtils.def(sandbox, 'MIP', window.MIP)

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
 * @return {Object} safe this
 */
defUtils.def(sandbox, 'this', function (that) {
  return that === window ? sandbox : that === document ? sandbox.document : that
})

module.exports = sandbox
