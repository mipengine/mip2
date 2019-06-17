import { Plugin, Params } from 'mip-cli-utils'
import generateSw from './sw'

const plugin: Plugin = {
  name: 'sw',
  description: '生成 Service Worker 文件',
  options: [
    {
      name: 'config',
      shortName: 'c',
      type: 'required',
      description: 'mip-cli 配置文件路径'
    },
    {
      name: 'output',
      shortName: 'o',
      type: 'required',
      description: 'Service Worker 导出路径'
    }
  ],
  run (params: Params) {
    generateSw(params)
  }
}

export default plugin
