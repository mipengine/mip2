/**
 * @file karma.cover.conf.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

const base = require('./karma.base.conf')

module.exports = function (config) {
  config.set(Object.assign(base, {
    LogLevel: config.LOG_DISABLE,
    singleRun: true
  }))
}
