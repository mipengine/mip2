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

  return `(function () {
    var __mip_component__ = `
}

function customElementFooter (filename) {
  if (!isComponentFile(filename)) {
    return ''
  }

  let basename = path.basename(filename, path.extname(filename))
  // 这个插件里的 filename 是 output 的 filename 所以没办法通过判断后缀的方式去调用 registerCustomElement 或者 registerVueCustomElement
  return `
        __mip_component__ = __mip_component__.default || __mip_component__;
        MIP[typeof __mip_component__ === 'function' ? 'registerCustomElement' : 'registerVueCustomElement'](
            '${basename}',
            __mip_component__
        );
    })();`
}

module.exports = function () {
  return new WrapperPlugin({
    header: customElementHeader,
    footer: customElementFooter
  })
}
