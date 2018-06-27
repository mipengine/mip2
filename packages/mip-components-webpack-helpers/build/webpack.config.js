/**
 * @file webpack 基础配置
 * @author mj(zoumiaojiang@gmail.com)
 */

const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  mode: 'production',
  entry: resolve('index.js'),
  output: {
    path: resolve('dist'),
    filename: 'mip-components-webpack-helpers.js',
    // library: '__mipComponentsWebpackHelpers__',
    libraryTarget: 'umd'
    // umdNamedDefine: true
    // chunkFilename: '[id].chunk.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  // Expose __dirname to allow automatically setting basename.
  context: __dirname,
  node: {
    __dirname: true
  },

  plugins: [
    new UglifyJsPlugin()
    // new BundleAnalyzerPlugin()
  ]
}
