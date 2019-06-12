/**
 * @file mip2-plugin-build
 * @author clark-t (clarktanglei@163.com)
 */

import { add } from './add'
import { Plugin } from 'mip-cli-utils'

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
      optional: true,
      description: '添加组件类型为 Vue 组件'
    },
    {
      name: 'force',
      shortName: 'f',
      optional: true,
      description: '是否覆盖'
    }
  ],
  run (params) {
    add(params)
  }
}

export default plugin
