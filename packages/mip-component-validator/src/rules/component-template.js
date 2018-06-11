/**
 * @file component-template.js
 * @author liwenqian
 * @desc 组件模板规范
 */

const Validator = require('mip-validator')
const rules = require('./lib/rules-template.json')
const validator = new Validator(rules)

module.exports = {
  name: 'component-template',
  exec (file, reporter) {
    const errs = validator.validate(file.content)
    if (!errs) {
      return
    }
    errs.forEach(error => {
      reporter.error(file.path, error.message, error.line, error.col)
    })
  }
}
