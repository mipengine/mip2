/**
 * @file mip2-plugin-build
 * @author clark-t (clarktanglei@163.com)
 */

import { Plugin } from 'mip-cli-utils'

const plugin: Plugin = {
  name: 'build',
  description: '组件编译插件',
  args: [
    {
      name: 'components',
      optional: true,
      rest: true
    }
  ],
  options: [
    {
      name: 'asset',
      shortName: 'a',
      description: '静态资源 publicPath',
      type: 'required'
    },
    {
      name: 'dir',
      shortName: 'd',
      description: '项目文件夹路径',
      type: 'required'
    },
    {
      name: 'output',
      shortName: 'o',
      description: '编译代码输出路径',
      type: 'required'
    },
    {
      name: 'clean',
      shortName: 'c',
      description: '构建前先清空输出目录'
    },
    {
      name: 'ignore',
      shortName: 'i',
      description: '忽略沙盒注入或校验，可选参数为 `-i sandbox`, `-i whitelist`, `-i sandbox,whitelist`; `-i` 默认等效于 `-i sandbox`; `-i all` 默认等效于 `-i sandbox,whitelist`',
      type: 'optional',
      fn (ignore: undefined | true | 'sandbox' | 'whitelist' | 'sandbox,whitelist' | 'all') {
        if (ignore == true) {
          return 'sandbox'
        }
        if (ignore === 'all') {
          return 'sandbox,whitelist'
        }
        return ignore
      }
    },
    {
      name: 'env',
      shortName: 'e',
      description: 'NODE_ENV 环境变量，默认为 `production`',
      defaultValue: 'production'
    }
  ],
  run (params) {

  }
}

export default plugin

