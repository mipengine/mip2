/**
 * @file sandbox-generate.js
 * @author clark-t (clarktanglei@163.com)
 */

// only use in browser env

var gen = require('./keywords-generate')
var def = require('./utils/def')

module.exports = function (mip) {
  var keywords = gen()
  var descriptor = def(mip, keywords.SANDBOX.name, keywords.SANDBOX)

  if (mip) {
    return
  }

  var sandbox = descriptor.get()
  return sandbox
}
