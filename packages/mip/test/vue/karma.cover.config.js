var base = require('./karma.base.config.js')

module.exports = function (config) {
  // base.webpack.module.rules.unshift({
  //   test: /\.js$/,
  //   use: {
  //     loader: 'istanbul-instrumenter-loader',
  //     options: {
  //       esModules: true
  //     }
  //   },
  //   enforce: 'post',
  //   exclude: /node_modules|deps|test|\.spec\.js$|html-parser\.js$|instance\/proxy\.js$|src\/sfc\/deindent\.js/
  // })

  var options = Object.assign(base, {
    browsers: ['Chrome'],
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      reporters: [
        { type: 'lcov', dir: '../coverage-vue', subdir: '.' },
        { type: 'text-summary', dir: '../coverage-vue', subdir: '.' }
      ]
    },
    singleRun: true,
    plugins: base.plugins.concat([
      'karma-coverage',
      'karma-chrome-launcher'
    ])
  })

  // add babel-plugin-istanbul for code instrumentation
  options.webpack.module.rules[0].options = {
    plugins: [['istanbul', {
      exclude: [
        'test/',
        'src/compiler/parser/html-parser.js',
        'src/core/instance/proxy.js',
        'src/sfc/deindent.js'
      ]
    }]]
  }

  config.set(options)
}
