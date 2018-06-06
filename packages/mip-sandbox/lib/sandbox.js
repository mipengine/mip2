/**
 * @file sandbox.js
 * @author clark-t (clarktanglei@163.com)
 */

// only use in browser env

var keywords = require('./safe-keywords')
var defUtils = require('./utils/def')
var safeThis = require('./utils/safe-this')

var WINDOW_ORIGINAL_KEYWORDS = keywords.WINDOW_ORIGINAL_KEYWORDS
var DOCUMENT_ORIGINAL_KEYWORDS = keywords.DOCUMENT_ORIGINAL_KEYWORDS

var def = defUtils.def
var defs = defUtils.defs

var sandbox = {}

defs(sandbox, WINDOW_ORIGINAL_KEYWORDS)
def(sandbox, 'window', sandbox)

var sandboxDocument = {}

defs(sandboxDocument, DOCUMENT_ORIGINAL_KEYWORDS, {host: document, setter: true})
def(sandbox, 'document', sandboxDocument)
def(sandbox, 'MIP', window.MIP)
def(sandbox, 'this', safeThis(sandbox))

module.exports = sandbox
