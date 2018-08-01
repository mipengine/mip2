/**
 * @file babel-loader.js
 * @author clark-t (clarktanglei@163.com)
 */

const {pathFormat, resolveModule} = require('../../../utils/helper')
const path = require('path')
const prefix = '__mipComponentsWebpackHelpers__'

module.exports = {
  babelLoader (options = {}) {
    let config = {
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        presets: [
          [
            require.resolve('babel-preset-env'),
            {
              modules: false,
              targets: {
                browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
              }
            }
          ],
          require.resolve('babel-preset-stage-2')
        ],
        plugins: [
          [
            require('babel-plugin-transform-runtime'),
            {
              helpers: true,
              polyfill: true,
              regenerator: true,
              moduleName: resolveModule('babel-runtime')
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
  },

  babelExternals (context, request, callback) {
    let req = pathFormat(path.resolve(context, request))

    if (!/babel-runtime/.test(req)) {
      return callback()
    }

    if (/babel-runtime\/regenerator/.test(req)) {
      return callback(null, `root ${prefix}['babel-runtime/regenerator']`)
    }

    if (/babel-runtime\/helpers\//.test(req)) {
      let match = req.match(/(babel-runtime\/helpers\/.*)/)
      return callback(null, `root ${prefix}['${match[1]}']`)
    }

    if (/babel-runtime\/core-js\/promise/.test(req)) {
      return callback(null, `root Promise`)
    }

    if (/babel-runtime\/core-js\/symbol([^/]|$)/.test(req)) {
      return callback(null, `root Symbol`)
    }

    if (/babel-runtime\/core-js\/set/.test(req)) {
      return callback(null, `root Set`)
    }

    if (/babel-runtime\/core-js\/array\/from/.test(req)) {
      return callback(null, `root Array.from`)
    }

    if (/babel-runtime\/core-js\/object\/assign/.test(req)) {
      return callback(null, `root Object.assign`)
    }

    if (/babel-runtime\/core-js\/object\/create/.test(req)) {
      return callback(null, `root Object.create`)
    }

    if (/babel-runtime\/core-js\/object\/freeze/.test(req)) {
      return callback(null, `root Object.freeze`)
    }

    if (/babel-runtime\/core-js\/object\/get-prototype-of/.test(req)) {
      return callback(null, `root Object.getPrototypeOf`)
    }

    callback()
  }
}
