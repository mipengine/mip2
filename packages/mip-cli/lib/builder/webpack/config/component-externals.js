/**
 * @file component-externals.js
 * @author clark-t (clarktanglei@163.com)
 */

const {pathFormat} = require('../../../utils/helper')
const path = require('path')
const prefix = 'componentHelpers'

module.exports = function (context, request, callback) {
  let req = pathFormat(path.resolve(context, request))

  if (/css-loader\/lib\/css-base/.test(req)) {
    return callback(null, `root ${prefix}.cssBase`)
  }

  if (/vue-loader\/lib\/runtime\/componentNormalizer/.test(req)) {
    return callback(null, `root ${prefix}.componentNormalizer`)
  }

  if (/vue-style-loader\/lib\/addStylesClient/.test(req)) {
    return callback(null, `root ${prefix}.addStylesClient`)
  }

  if (/vue-style-loader\/lib\/listToStyles/.test(req)) {
    return callback(null, `root ${prefix}.listToStyles`)
  }

  callback()
}
