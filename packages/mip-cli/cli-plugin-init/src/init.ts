/**
 * @file 初始化mip项目命令
 * @author tracy(qiushidev@gmail.com)
 */

import { Arguments } from '../../cli/src/interface'
import * as cli from '../../cli-utils/src/logger'
import { downloadRepo, generate } from '../../cli-utils/src/template'

const templateDir = 'template'

export function init (args: Arguments) {
  console.log('---- invoke init ----')
  console.log('args:')
  console.log(args)

  downloadRepo(false, () => {
    generate(templateDir, '', false, (err: Error | null) => {
      if (err) {
        cli.error('Failed to generate project: ' + err.message.trim())
        return
      }
      cli.info('generate MIP project successfully!')
    })
  })
}
