import { getPluginPackages, installOrUpdatePlugin, resolvePluginName } from './utils/plugin'
import { logger } from 'mip-cli-utils'

interface Option {
  registry: string;
}

export function update (pluginNames: string[], options: Option) {
  let { registry } = options
  let pluginTask: string[]

  if (!pluginNames.length) {
    // 没有具体指定，默认全部更新已安装插件
    pluginTask = getPluginPackages()
    if (!pluginTask.length) {
      logger.info('没有找到插件，您可以使用 mip2 install <packageName> 进行安装')
      return
    }
  } else {
    // 只安装具体指定的 plugins
    // 如果不是输入 plugin 全名，拼成全名
    pluginTask = pluginNames.map(resolvePluginName)
  }

  installOrUpdatePlugin('install', pluginTask.map(plugin => `${plugin}@latest`), registry)
}
