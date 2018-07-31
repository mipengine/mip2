/**
 * @file global-var
 * @author liwenqian
 * @desc global variable rules
 */

const babel = require('babel-core')
const detect = require('mip-sandbox/lib/unsafe-detect')
const keywords = require('mip-sandbox/lib/keywords')
const utils = require('../utils')

module.exports = {
  name: 'allowed-global-var',
  exec (file, reporter) {
    const script = utils.parseComponent(file.content).script
    if (!script) {
      return
    }
    const content = babel.transform(script.content, {
      presets: [
        require.resolve('babel-preset-stage-3')
      ]
    }).code
    const results = detect(content, keywords.WHITELIST)
    results.forEach((result) => {
      reporter.error(file.path, '禁止的全局变量 `' + result.name + '`.', result.loc.start.line, result.loc.start.column)
    })
  }
}
