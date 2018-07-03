/**
 * @file rollup alias config
 * @author mj(zoumiaojiang@gmail.com)
 */

const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  src: resolve('src'),
  mip: resolve('src/index.js'),
  vue: resolve('src/vue/platforms/web/entry-runtime'),
  compiler: resolve('src/vue/compiler'),
  core: resolve('src/vue/core'),
  shared: resolve('src/vue/shared'),
  web: resolve('src/vue/platforms/web'),
  sfc: resolve('src/vue/sfc'),
  'deps': resolve('deps'),
  'script-loader!deps': resolve('deps'),
  'script-loader!document-register-element': resolve('node_modules/document-register-element')
}
