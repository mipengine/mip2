/**
 * @file sandbox.js
 * @author clark-t (clarktanglei@163.com)
 */

// only use in browser env

var keywords = require('./safe-keywords')
var defUtils = require('./utils/def')
var safeThis = require('./utils/safe-this')

var sandbox = {}

defUtils.defs(sandbox, keywords.WINDOW_ORIGINAL)
defUtils.def(sandbox, 'window', sandbox)

var sandboxDocument = {}

defUtils.defs(sandboxDocument, keywords.DOCUMENT_ORIGINAL, {host: document, setter: true})
defUtils.def(sandbox, 'document', sandboxDocument)
defUtils.def(sandbox, 'MIP', window.MIP)
defUtils.def(sandbox, 'this', safeThis(sandbox))

module.exports = sandbox
