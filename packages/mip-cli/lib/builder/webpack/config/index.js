/**
 * @file config.js
 * @author clark-t (clarktanglei@163.com)
 */

const VueLoaderPlugin = require('vue-loader/lib/plugin')
// const sandboxLoader = require('./sandbox-loader');
const styleLoaders = require('./style-loaders')
const CustomElementPlugin = require('./custom-element-plugin')
/* eslint-disable */
const {resolveModule} = require('../../../utils/helper');
/* eslint-enable */
const {babelLoader, babelExternals} = require('./babel')
const path = require('path')
const componentExternals = require('./component-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = function (options) {
  let config = {
    entry: options.entry,
    output: {
      path: options.outputPath,
      filename: '[name].js',
      chunkFilename: '[name].[hash].js',
      publicPath: options.asset.replace(/\/$/, '') + '/'
    },
    mode: options.mode,
    context: options.context,
    devtool: options.mode === 'development' ? 'inline-source-map' : false,
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: resolveModule('vue-loader'),
              options: {
                productionMode: options.mode === 'production'
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: options.ignore && /(^|,)sandbox(,|$)/.test(options.ignore)
            ? [
              babelLoader,
              path.resolve(__dirname, 'child-component-loader.js')
            ]
            : [
              path.resolve(__dirname, 'sandbox-loader.js'),
              babelLoader,
              path.resolve(__dirname, 'child-component-loader.js')
            ]
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          use: [{
            loader: resolveModule('url-loader'),
            options: {
              limit: 1000,
              name: 'img/[name]-[hash].[ext]'
            }
          }]
        },
        {
          test: /\.(otf|ttf|eot|svg|woff2?)(\?[a-z0-9=&.]+)?$/,
          use: [{
            loader: resolveModule('url-loader'),
            options: {
              limit: 1000,
              name: 'font/[name]-[hash].[ext]'
            }
          }]
        },
        ...styleLoaders
      ]
    },
    externals: [
      babelExternals,
      componentExternals
    ],
    // externals: Object.assign({}, babelExternals, externals),
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      alias: {
        '@': path.resolve(options.context)
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new CustomElementPlugin(options),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.mode)
      })
    ]
  }

  if (options.mode === 'development') {
    config.plugins.push(
      new CopyWebpackPlugin([
        {
          from: resolveModule('mip-components-webpack-helpers/dist/mip-components-webpack-helpers.js'),
          to: 'mip-components-webpack-helpers.js',
          toType: 'file'
        }
      ], {debug: 'error'})
    )
  }

  return config
}
