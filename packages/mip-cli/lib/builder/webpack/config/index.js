/**
 * @file config.js
 * @author clark-t (clarktanglei@163.com)
 */

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const styleLoaders = require('./style-loaders')
const CustomElementPlugin = require('./custom-element-plugin')
const babelLoader = require('./babel')
const path = require('path')
const webpack = require('webpack')
const mipExternal = require('mip-components-webpack-helpers/lib/external')
const {resolveModule} = require('../../../utils/helper')
const getTSLoader = require('./ts-loader')

module.exports = function (options) {
  let config = {
    entry: options.entry,
    output: {
      path: options.outputPath,
      filename: '[name].js',
      chunkFilename: '[name].[hash].js',
      publicPath: options.asset.replace(/\/$/, '') + '/'
    },
    mode: options.env === 'development' ? 'development' : 'production',
    context: options.context,
    devtool: options.env === 'development' ? 'inline-source-map' : false,
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: require.resolve('vue-loader'),
              options: {
                productionMode: options.env !== 'development',
                compiler: require('vue-template-compiler/build')
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: options.ignore && /(^|,)sandbox(,|$)/.test(options.ignore)
            ? [
              babelLoader(options),
              require.resolve('./child-component-loader')
            ]
            : [
              require.resolve('./sandbox-loader'),
              babelLoader(options),
              require.resolve('./child-component-loader')
            ]
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: getTSLoader(options.ignore && /(^|,)sandbox(,|$)/.test(options.ignore), options)
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          use: [{
            loader: require.resolve('url-loader'),
            options: {
              limit: 1000,
              name: 'img/[name]-[hash].[ext]'
            }
          }]
        },
        {
          test: /\.(otf|ttf|eot|svg|woff2?)(\?[a-z0-9=&.]+)?$/,
          use: [{
            loader: require.resolve('url-loader'),
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
      mipExternal(__dirname)
    ],
    resolve: {
      extensions: ['.js', '.json', '.vue', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(options.context),
        'core-js': resolveModule('core-js')
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new CustomElementPlugin(options),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.env)
      })
    ]
  }

  return config
}
