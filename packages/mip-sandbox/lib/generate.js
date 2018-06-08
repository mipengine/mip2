/**
 * @file unsafe-replace.js
 * @author clark-t (clarktanglei@163.com)
 */

var escodegen = require('../deps/escodegen')
var replace = require('./unsafe-replace')

module.exports = function (code, options) {
  var ast = replace(code)
  return escodegen.generate(ast, options)
}
