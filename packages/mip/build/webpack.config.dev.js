/**
 * @file webpack dev 配置
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = merge.smart(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    mip: resolve('src/index.js')
  },
  resolve: {
    alias: {
      vue: resolve('src/vue/platforms/web/entry-runtime-with-compiler')
    }
  }
})
