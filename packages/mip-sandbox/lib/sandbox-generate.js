/**
 * @file sandbox-generate.js
 * @author clark-t (clarktanglei@163.com)
 */

// only use in browser env

var keywords = require('./keywords')
var def = require('./utils/def')

module.exports = function (mip) {
  var sandboxDescriptor = def(mip, keywords.SANDBOX.name, keywords.SANDBOX)

  if (mip) {
    return
  }

  var sandbox = sandboxDescriptor.get()
  return sandbox
}
