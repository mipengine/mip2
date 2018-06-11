/**
 * @file global-var
 * @author liwenqian
 * @desc global variable rules
 */

const detect = require('mip-sandbox/lib/unsafe-detect')
const utils = require('../utils')

module.exports = {
  name: 'allowed-global-var',
  exec (file, reporter) {
    const script = utils.parseComponent(file.content).script
    if (!script) {
      return
    }
    
    const results = detect(script.content)
    results.forEach((result) => {
      reporter.error(file.path, '禁止的全局变量 `' + result.name + '`.', result.loc.start.line, result.loc.start.column)
    })
  }
}
