/**
 * @file custom-element-plugin.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path')
const WrapperPlugin = require('wrapper-webpack-plugin')

function isComponentFile (filename) {
  return /(mip-[\w-]+)\/\1\.js$/.test(filename)
}

function customElementHeader (filename) {
  if (!isComponentFile(filename)) {
    return ''
  }
  let basename = path.basename(filename, path.extname(filename))
  // 支持 mip 核心异步加载
  return `
  (window.MIP = window.MIP || []).push({
    name: '${basename}',
    func: function() {
      var __mip_component__ = `
}

function customElementFooter (filename) {
  if (!isComponentFile(filename)) {
    return ''
  }
  let basename = path.basename(filename, path.extname(filename))
  // 允许开发者手动调用 registerElement 和 registerService
  return `
      if (__mip_component__.__esModule) {
        __mip_component__ = __mip_component__.default;
      }
      if (__mip_component__) {
        MIP.registerElement('${basename}', __mip_component__);
      }
    }
  });`
}

module.exports = function (options) {
  return new WrapperPlugin({
    header: customElementHeader,
    footer: customElementFooter
  })
}
