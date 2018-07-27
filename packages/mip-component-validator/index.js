/**
 * @file MIP 组件校验工具
 * @author liwenqian(liwenqian@baidu.com)
 */
const validator = require('./src/validator')

exports.validate = function (path, options) {
  return validator.validate(path, options)
}

exports.whitelist = function (path) {
  return validator.whitelist(path)
}
