/**
 * @file component-externals.js
 * @author clark-t (clarktanglei@163.com)
 */

const {pathFormat} = require('../../../utils/helper')
const path = require('path')
const prefix = '__mipComponentsWebpackHelpers__'

module.exports = function (context, request, callback) {
  let req = pathFormat(path.resolve(context, request))

  if (/css-loader\/lib\/css-base/.test(req)) {
    return callback(null, `root ${prefix}['css-loader/lib/css-base']`)
  }

  if (/vue-loader\/lib\/runtime\/componentNormalizer/.test(req)) {
    return callback(null, `root ${prefix}['vue-loader/lib/runtime/componentNormalizer']`)
  }

  if (/vue-style-loader\/lib\/addStylesClient/.test(req)) {
    return callback(null, `root ${prefix}['vue-style-loader/lib/addStylesClient']`)
  }

  if (/vue-style-loader\/lib\/listToStyles/.test(req)) {
    return callback(null, `root ${prefix}['vue-style-loader/lib/listToStyles']`)
  }

  callback()
}
