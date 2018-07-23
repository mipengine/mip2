/**
 * @file karma.cover.conf.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

const base = require('./karma.base.conf')

module.exports = function (config) {
  base.webpack.module.rules.unshift({
    test: /\.js$/,
    use: {
      loader: 'istanbul-instrumenter-loader',
      options: {
        esModules: true
      }
    },
    enforce: 'post',
    exclude: /node_modules|deps|test|src\/vue|\.spec\.js$/
  })

  config.set(Object.assign(base, {
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
      }]
    },
    LogLevel: config.LOG_DISABLE,
    webpackMiddleware: {
      logLevel: 'silent'
    },
    singleRun: true,
    plugins: base.plugins.concat([
      'karma-coverage',
      'karma-chrome-launcher'
    ])
  }))
}
