/**
 * @file webpack 基础配置
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const version = process.env.VERSION || require('../package.json').version

const resolve = p => path.resolve(__dirname, '../', p)
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {

  output: {
    path: resolve('dist'),
    filename: 'mip.js',
    publicPath: '/dist/'
    // chunkFilename: '[id].chunk.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|fetch.js/,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(css|less)$/,
        use: [
          devMode
            ? {loader: 'style-loader', options: {insertAt: 'top'}}
            : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: devMode
              ? {importLoaders: 1}
              : {importLoaders: 1, minimize: true}
          },
          'less-loader'
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: ('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },

  resolve: {
    alias: {
      vue: resolve('src/vue/platforms/web/entry-runtime'),
      compiler: resolve('src/vue/compiler'),
      core: resolve('src/vue/core'),
      shared: resolve('src/vue/shared'),
      web: resolve('src/vue/platforms/web'),
      sfc: resolve('src/vue/sfc'),
      deps: resolve('deps')
    }
  },

  // Expose __dirname to allow automatically setting basename.
  context: __dirname,
  node: {
    __dirname: true
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      '__VERSION__': JSON.stringify(version.toString())
    })
  ]

}
