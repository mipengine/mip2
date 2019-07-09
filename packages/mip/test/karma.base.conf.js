const webpack = require('webpack')
const alias = require('../build/alias')
const version = process.env.VERSION || require('../package.json').version

class AllowMutateEsmExportsPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('AllowMutateEsmExports', (compilation) => {
      compilation.mainTemplate.hooks.requireExtensions.tap('AllowMutateEsmExports', source =>
        source.replace(
          'Object.defineProperty(exports, name, { enumerable: true, get: getter })',
          'Object.defineProperty(exports, name, { configurable: true, enumerable: true, get: getter })'
        )
      )
    })
  }
}

const webpackConfig = {
  mode: 'development',
  resolve: {
    alias
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'istanbul-instrumenter-loader',
        options: {
          esModules: true
        }
      },
      enforce: 'post',
      exclude: /node_modules|deps|test|src\/vue\/|\.spec\.js$/
    }, {
      test: /\.(css|less)$/,
      use: [
        {
          loader: 'style-loader',
          options: {
            insertAt: 'top'
          }
        },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1
          }
        },
        'less-loader'
      ]
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: ('fonts/[name].[hash:7].[ext]')
      }
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      '__VERSION__': JSON.stringify(version.toString())
    }),
    new AllowMutateEsmExportsPlugin()
  ],
  devtool: '#inline-source-map'
}

// let browsers = ['Chrome']
// // trvis env
// if (process.env.TRAVIS) {
//   browsers = ['Chrome_travis_ci']
// }
let browsers = ['ChromeDebugging']

module.exports = {
  files: [
    'index.js'
  ],

  frameworks: ['mocha', 'chai-sinon', 'chai'],

  preprocessors: {
    'index.js': ['webpack']
  },

  reporters: ['mocha', 'coverage'],
  coverageReporter: {
    reporters: [{
      type: 'lcov',
      dir: '../coverage',
      subdir: '.'
    },
    {
      type: 'text-summary',
      dir: '../coverage',
      subdir: '.'
    }
    ]
  },
  webpackMiddleware: {
    logLevel: 'silent'
  },

  webpack: webpackConfig,

  plugins: [
    'karma-webpack',
    'karma-mocha',
    'karma-chai',
    'karma-mocha-reporter',
    'karma-sourcemap-loader',
    'karma-chai-sinon',
    'karma-coverage',
    'karma-chrome-launcher'
  ],
  browsers: browsers,
  // custom launchers
  customLaunchers: {
    // Chrome_travis_ci: {
    //   base: 'Chrome',
    //   flags: ['--no-sandbox']
    // }
    ChromeDebugging: {
      base: 'Chrome',
      flags: [ '--remote-debugging-port=9333' ]
    }
  },
  concurrency: Infinity
}
