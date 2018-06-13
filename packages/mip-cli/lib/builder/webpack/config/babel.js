/**
 * @file babel-loader.js
 * @author clark-t (clarktanglei@163.com)
 */

const {resolveModule, pathFormat} = require('../../../utils/helper')
const path = require('path')
const prefix = 'MIP.componentHelpers'

module.exports = {
  babelLoader: {
    loader: resolveModule('babel-loader'),
    options: {
      babelrc: false,
      presets: [
        [
          resolveModule('babel-preset-env'),
          {
            modules: false,
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
            }
          }
        ],
        resolveModule('babel-preset-stage-2')
      ],
      plugins: [
        [
          require('babel-plugin-transform-runtime'),
          {
            helpers: true,
            polyfill: false,
            regenerator: true,
            moduleName: resolveModule('babel-runtime')
          }
        ]
      ]
    }
  },
  babelExternals (context, request, callback) {
    let req = pathFormat(path.resolve(context, request))

    if (/babel-runtime\/regenerator/.test(req)) {
      return callback(null, `root ${prefix}['babel-runtime/regenerator']`)
    }

    if (/babel-runtime\/helpers\//.test(req)) {
      let match = req.match(/(babel-runtime\/helpers\/.*)/)
      return callback(null, `root ${prefix}['${match[1]}']`)
    }

    callback()
  }
}
