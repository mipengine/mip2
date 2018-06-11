/**
 * @file unsafe-replace.js
 * @author clark-t (clarktanglei@163.com)
 */

var escodegen = require('../deps/escodegen')
var replace = require('./unsafe-replace')

module.exports = function (code, keywords, options) {
  var ast = replace(code, keywords, options && options.prefix)
  return escodegen.generate(ast, options)
}
