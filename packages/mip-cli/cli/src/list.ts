import { getPluginPackages } from './utils/plugin'
import { logger } from 'mip-cli-utils'

export function list () {
  const plugins = getPluginPackages()

  if (!plugins.length) {
    logger.info('没有找到插件，您可以使用 mip2 install <packageName> 进行安装')
  }

  console.log()
  console.log('当前使用的插件:')
  console.log()

  plugins.forEach(plgn => console.log(plgn))

  console.log()
}
