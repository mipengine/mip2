/**
 * @file 校验器
 * @author liwenqian@baidu.com
 */

const fs = require('fs-extra')
const path = require('path')
const Reporter = require('./reporter')
const walker = require('./walker')
const config = require('./config')
const whitelist = require('./rules/component-npm-whitelist')

function createRuleProcess (rule) {
  return require('./rules/' + rule)
}

exports.validate = async function (dirPath, opts) {
  const reporter = new Reporter()
  await walker.walk(dirPath, async pathname => {
    const fileName = path.basename(pathname)
    const fileType = path.extname(pathname).substring(1)
    const rules = config[fileType]
    if (!rules) {
      return
    }

    for (let index = 0; index < rules.length; index++) {
      const ruleProcess = createRuleProcess(rules[index])
      const content = await fs.readFile(pathname, 'utf-8')
      const options = {
        name: fileName,
        path: pathname,
        content: content
      }

      try {
        await ruleProcess.exec(options, reporter)
      } catch (e) {
        reporter.error('', e.message)
      }
    }
  }, opts)
  return reporter.getReport()
}

/**
 * 校验当前的项目 npm 是否合法
 *
 * @param {string} dir 当前待校验项目的根路径
 */
exports.whitelist = async function (dir = process.cwd()) {
  const reporter = new Reporter()
  await whitelist.validate(dir, reporter)
  return reporter.getReport()
}
