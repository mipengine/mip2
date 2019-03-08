/**
 * @file babel-loader.js
 * @author clark-t (clarktanglei@163.com)
 */

const {pathFormat, resolveModule} = require('../../../utils/helper')
const {babelExternalList} = require('mip-components-webpack-helpers/lib/data')
const buitinFeatures = require('@babel/preset-env/data/built-in-features')
const path = require('path')

module.exports = babelLoader (options = {}) {
  let config = {
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false,
            targets: [
              '> 1%',
              'last 2 versions',
              'not ie <= 8',
              'iOS > 7',
              'android >= 4.4'
            ],
            useBuiltIns: 'usage',
            exclude: babelExternalList
              .filter(str => /^core-js\/modules\/es\w\./.test(str))
              .map(str => str.slice(16, -3))
              .filter(str => !!buitinFeatures[str])
          }
        ]
      ],
      plugins: [
        [
          require('@babel/plugin-transform-runtime'),
          {
            corejs: false,
            helpers: true,
            regenerator: true,
            absoluteRuntime: resolveModule('@babel/runtime'),
            useESModules: true
          }
        ]
      ]
    }
  }

  if (typeof options.proxy === 'object' && Object.keys(options.proxy).length > 0) {
    config.options.plugins.push([
      require('./proxy-babel-plugin'),
      options.proxy
    ])
  }

  return config
}

