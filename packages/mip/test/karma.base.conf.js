const webpack = require('webpack')
const alias = require('../build/alias')
const version = process.env.VERSION || require('../package.json').version
const path = require('path')

class WebpackRequirePlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('MainTemplate', (compilation) => {
      compilation.mainTemplate.hooks.requireExtensions.tap('MainTemplate', () =>
        [
          '__webpack_require__.d = function (exported, name, get) {',
          '  Reflect.defineProperty(exported, name, {',
          '    configurable: true,',
          '    enumerable: true,',
          '    get',
          '  })',
          '}',
          '__webpack_require__.n = function (exported) {',
          '  return exported.a = exported',
          '}',
          '__webpack_require__.r = function () {}',
          '__webpack_require__.o = function (object, property) {',
          '  return Object.prototype.hasOwnProperty.call(object, property)',
          '};'
        ].join('\n')
      )
    })

    compiler.hooks.afterEmit.tap('ConsoleOutput', (compilation) => {
      let outputPath = compilation.getPath(compiler.outputPath)
      console.log('--- the output path is ---')
      console.log(outputPath)
      let filenames = compiler.outputFileSystem.readdirSync(outputPath)
      filenames.forEach(filename => {
        let file = compiler.outputFileSystem.readFileSync(path.resolve(outputPath, filename), 'utf-8')
        console.log('--------- ' + filename + ' ----------')
        console.log(file)
      })
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
    new WebpackRequirePlugin()
  ],
  devtool: false
}

let browsers = ['Chrome']
// trvis env
if (process.env.TRAVIS) {
  browsers = ['Chrome_travis_ci']
}

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
    Chrome_travis_ci: {
      base: 'Chrome',
      flags: ['--no-sandbox']
    }
  },
  concurrency: Infinity
}
