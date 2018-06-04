/**
 * @file custom-element-plugin.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path')
const WrapperPlugin = require('wrapper-webpack-plugin')

const customElementHeader = `(function () {
    var __mip_component__ = `

function customElementFooter (filename) {
  let basename = path.basename(filename, path.extname(filename))
  return `
        MIP.registerVueCustomElement(
            '${basename}',
            __mip_component__.default ? __mip_component__.default : __mip_component__
        );
    })();`
}

module.exports = function () {
  return new WrapperPlugin({
    header: customElementHeader,
    footer: customElementFooter
  })
}
