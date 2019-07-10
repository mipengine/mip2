import fs from 'fs-extra'
import path from 'path'
import { logger, chalk, Params } from 'mip-cli-utils'
import Validator from 'mip-validator'
import compValidator from 'mip-component-validator'

const pageValidator = new Validator()

type Report = compValidator.Report
type WarnOrError = compValidator.WarnOrError

function report (data: Report, filePath: string) {
  switch (data.type) {
    case 'page':
      logger.info('页面校验结果：')
      break
    case 'component':
      logger.info('组件校验结果：')
      break
    case 'whitelist':
      logger.info('npm 白名单校验结果：')
  }

  if (!data.errors || !data.errors.length || data.status === 0) {
    logger.info('validate success', chalk.green(filePath))
    return
  }

  let currentFile: string | undefined = ''
  data.errors.map((error: WarnOrError) => {
    if (currentFile !== error.file) {
      currentFile = error.file
      logger.info('validate error', chalk.green(error.file || filePath))
    }
    logger.error('line', error.line + ',', 'col', error.col + ':', error.message)
  })

  process.exit(1)
  // throw new Error('validate fail')
}

export default async function (config: Params) {
  const baseDir = path.resolve(process.cwd(), '')
  const filePath = path.join(baseDir, config.args.filePath as string)

  if (!await fs.pathExists(filePath)) {
    logger.error('path not exist')
  }

  let result: Report = {}
  if (config.options.page) {
    let content = await fs.readFile(filePath, 'utf-8')
    result.type = 'page'
    result.errors = pageValidator.validate(content)
  } else if (config.options.component) {
    result = await compValidator.validate(filePath, { ignore: [/node_modules/, /dist/] })
    result.type = 'component'
  } else {
    result = await compValidator.whitelist(filePath)
  }

  report(result, filePath)
}
