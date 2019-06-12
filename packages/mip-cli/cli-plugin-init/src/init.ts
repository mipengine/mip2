/**
 * @file 初始化mip项目命令
 * @author tracy(qiushidev@gmail.com)
 */

import { logger } from 'mip-cli-utils'
import { downloadRepo, generate } from './utils/template'

const templateDir = 'template'

export function init () {
  downloadRepo(false, () => {
    generate(templateDir, '', false, (err: Error | null) => {
      if (err) {
        logger.error('Failed to generate project: ' + err.message.trim())
        return
      }
      logger.info('generate MIP project successfully!')
    })
  })
}
