/**
 * @file 初始化mip项目命令
 * @author tracy(qiushidev@gmail.com)
 */

import { Arguments } from './interface'
import * as cli from './utils/cli'
import { downloadRepo, generate } from './utils/template'

const templateDir = 'template'

export function init (args: Arguments) {
  console.log('---- invoke init ----')
  console.log('args:')
  console.log(args)

  downloadRepo(false, () => {
    generate(templateDir, '', false, (err: Error) => {
      if (err) {
        cli.error('Failed to generate project: ' + err.message.trim())
        return
      }
      cli.info('generate MIP project successfully!')
    })
  })
}
