/**
 * @file MIP 校验
 * @author liwenqian
 */

const cli = require('./cli')
const fs = require('fs-extra')
const path = require('path')
const Validator = require('mip-validator')
const compValidator = require('mip-component-validator')
const pageValidator = new Validator()

module.exports = async function validate (config) {
  const baseDir = path.resolve(process.cwd(), config.baseDir || '')
  const filePath = path.join(baseDir, config.filePath)

  if (!await fs.exists(filePath)) {
    cli.error('path not exist')
  }

  let result = {}
  if (config.options.page) {
    let content = await fs.readFile(filePath, 'utf-8')
    result.type = 'page'
    result.errors = pageValidator.validate(content)
  } else if (config.options.component) {
    result = await compValidator.validate(filePath, {ignore: [/node_modules/, /dist/]})
    result.type = 'component'
  } else {
    result = await compValidator.whitelist(filePath)
  }

  report(result, filePath)
}

function report (data, filePath) {
  switch (data.type) {
    case 'page':
      cli.info('页面校验结果：')
      break
    case 'component':
      cli.info('组件校验结果：')
      break
    case 'whitelist':
      cli.info('npm 白名单校验结果：')
  }

  if (!data.errors || !data.errors.length || data.status === 0) {
    cli.info('validate success', cli.chalk.green(filePath))
    return
  }

  let currentFile = ''
  data.errors.map(error => {
    if (currentFile !== error.file) {
      currentFile = error.file
      cli.info('validate error', cli.chalk.green(error.file || filePath))
    }
    cli.error('line', error.line + ',', 'col', error.col + ':', error.message)
  })

  process.exit(1)
  // throw new Error('validate fail')
}
