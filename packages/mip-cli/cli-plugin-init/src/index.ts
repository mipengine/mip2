/**
 * @file mip2-plugin-build
 * @author clark-t (clarktanglei@163.com)
 */

import { init } from './init'
import { Plugin } from 'mip-cli-utils'

const plugin: Plugin = {
  name: 'init',
  description: '初始化 MIP 2.0 项目',
  args: [],
  options: [],
  run () {
    init()
  }
}

export default plugin
