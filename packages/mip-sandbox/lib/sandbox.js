/**
 * @file sandbox.js
 * @author clark-t (clarktanglei@163.com)
 */

// only use in browser env

var keywords = require('./keywords')
var defUtils = require('./utils/def')

var sandbox = defUtils.traverse(keywords.SANDBOX)

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

defUtils.def(sandbox, 'WHITELIST', keywords.WHITELIST)
defUtils.def(sandbox, 'WHITELIST_STRICT', keywords.WHITELIST_STRICT)
defUtils.def(sandbox, 'WHITELIST_RESERVED', keywords.WHITELIST_RESERVED)

defUtils.def(sandbox.strict, 'WHITELIST', keywords.WHITELIST)
defUtils.def(sandbox.strict, 'WHITELIST_STRICT', keywords.WHITELIST_STRICT)
defUtils.def(sandbox.strict, 'WHITELIST_RESERVED', keywords.WHITELIST_RESERVED)

module.exports = sandbox
