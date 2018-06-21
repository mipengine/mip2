const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  mip: resolve('src/index.js'),
  vue: resolve('src/vue/platforms/web/entry-runtime'),
  compiler: resolve('src/vue/compiler'),
  core: resolve('src/vue/core'),
  shared: resolve('src/vue/shared'),
  web: resolve('src/vue/platforms/web'),
  sfc: resolve('src/vue/sfc'),
  deps: resolve('deps')
}
