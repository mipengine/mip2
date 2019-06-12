/**
 * @file mip2-plugin-build
 * @author clark-t (clarktanglei@163.com)
 */

import { init } from './init'
import { Plugin } from 'mip-cli-utils'

const plugin: Plugin = {
  name: 'add',
  description: '新增 mip 组件',
  options: [
    {
      name: 'vue',
      shortName: 'v',
      description: '添加组件类型为 Vue 组件'
    },
    {
      name: 'force',
      shortName: '-f',
      description: '是否覆盖'
    }
  ],
  run (_arg) {
    init()
  }
}

export default plugin
