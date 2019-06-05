/**
 * @file 安装 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import { Arguments } from './interface'

export function add (name: string, options: Arguments) {
  console.log('---- invoke add ----')
  console.log('args:')
  console.log(name)
  console.log('options:')
  console.log(options)

  

}
