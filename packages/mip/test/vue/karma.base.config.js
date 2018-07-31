var alias = require('../../build/alias')
var webpack = require('webpack')

const path = require('path')
const resolve = p => path.resolve(__dirname, '../../', p)

alias.vue = resolve('src/vue/platforms/web/entry-runtime-with-compiler')

var webpackConfig = {
  resolve: {
    alias: alias
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
        TRANSITION_DURATION: 50,
        TRANSITION_BUFFER: 10
      }
    })
  ],
  devtool: '#inline-source-map'
}

// shared config for all unit tests
module.exports = {
  frameworks: ['jasmine'],
  files: [
    './index.js'
  ],
  preprocessors: {
    './index.js': ['webpack', 'sourcemap']
  },
  webpack: webpackConfig,
  webpackMiddleware: {
    noInfo: true
  },
  plugins: [
    'karma-jasmine',
    'karma-mocha-reporter',
    'karma-sourcemap-loader',
    'karma-webpack'
  ]
}
