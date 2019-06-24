/**
 * @file mip2-plugin-build
 * @author clark-t (clarktanglei@163.com)
 */

import { add } from './add'
import { Plugin, logger } from 'mip-cli-utils'
import fs from 'fs'
import path from 'path'

const plugin: Plugin = {
  name: 'add',
  description: '新增 mip 组件',
  args: [
    {
      name: 'compName',
      optional: false
    }
  ],
  options: [
    {
      name: 'vue',
      shortName: 'v',
      description: '添加组件类型为 Vue 组件'
    },
    {
      name: 'force',
      shortName: 'f',
      description: '是否覆盖'
    }
  ],
  run (params) {
    let compName = params.args.compName as string
    if (!compName.match(/^mip-[\w-]+$/)) {
      logger.warn('组件名称不规范！请输入形如 mip-xxx 的名称')
      return
    }
    if (!fs.existsSync(path.resolve('components'))) {
      logger.warn('请在项目根目录执行 mip2 add 命令')
      return
    }
    add(params)
  },
  help: [
    '',
    '  Examples:',
    '    # 新增 mip 组件',
    '    $ mip2 add mip-demo',
    '    # 新增 mip 组件，强制覆盖同名组件',
    '    $ mip2 add mip-demo -f'
  ].join('\n')
}

export default plugin
