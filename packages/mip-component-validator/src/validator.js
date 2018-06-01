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
  return new Promise(resolve => {
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
        ruleProcess.exec({
          name: fileName,
          path: pathname,
          content: content
        }, reporter)
      }
    })
    resolve(reporter.getReport())
  }, e => {
    console.log(e)
  })
}

function createRuleProcess (rule) {
  return require('./rules/' + rule)
}
