/**
 * @file webpack prod 配置
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = merge.smart(baseConfig, {
  mode: 'production',
  entry: resolve('src/index.js'),
  output: {
    publicPath: '//c.mipcdn.com/static/v2/'
  },
  module: {
    rules: []
  },

  plugins: [
    new MiniCssExtractPlugin({filename: 'mip.css'}),
    new UglifyJsPlugin()
    // new BundleAnalyzerPlugin()
  ]
})
