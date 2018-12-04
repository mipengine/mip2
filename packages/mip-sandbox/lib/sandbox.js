/**
 * @file sandbox.js
 * @author clark-t (clarktanglei@163.com)
 * @description 做旧版本的兼容处理
 */

// only use in browser env

var gen = require('./sandbox-generate')
module.exports = gen()
