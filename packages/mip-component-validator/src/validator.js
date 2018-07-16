/**
 * @file 校验器
 * @author liwenqian@baidu.com
 */

const fs = require('fs')
const path = require('path')
const Reporter = require('./reporter')
const walker = require('./walker')
const config = require('./config')

exports.validate = function (dirPath, options) {
  const reporter = new Reporter()
  walker.walk(dirPath, pathname => {
    const fileName = path.basename(pathname)
    const fileType = path.extname(pathname).substring(1)
    const rules = config[fileType]
    if (!rules) {
      return
    }

    for (let index = 0; index < rules.length; index++) {
      const ruleProcess = createRuleProcess(rules[index])
      const content = fs.readFileSync(pathname, 'utf-8')
      const options = {
        name: fileName,
        path: pathname,
        content: content
      }

      try {
        ruleProcess.exec(options, reporter)
      } catch (e) {
        reporter.error('', e.message)
      }
    }
  })
  return reporter.getReport()
}

function createRuleProcess (rule) {
  return require('./rules/' + rule)
}
