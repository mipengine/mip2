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
  entry: resolve('index.js'),
  resolve: {
    alias: {}
  }
})
