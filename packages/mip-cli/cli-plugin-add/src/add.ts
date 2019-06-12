/**
 * @file add mip component
 * @author tracy (qiushidev@gmail.com)
 */

// import { Arguments } from './interface'
import path from 'path'
import fs from 'fs-extra'
import { downloadRepo, generate } from './utils/template'
import globPify from './utils/helper'
import { promisify } from 'util'
import { logger, Params } from 'mip-cli-utils'

const templateDir = 'template/components/mip-example'

export function add (config: Params) {
  const args = config.args
  const options = config.options
  if (!args.compName) {
    logger.error('缺少组件名称参数，请按 `mip2 add [组件名]` 的格式重新输入')
    return
  }
  if (fs.existsSync(path.resolve('components', args.compName)) && !options.force) {
    logger.warn('组件:' + args.compName + ' 已存在，您可以使用 --force 参数强制覆盖')
    return
  }

  let isVue = options.vue
  let compClassName = 'MIP' + args.compName.slice(3).replace(/-\w/g, str => str.slice(1).toUpperCase())

  async function replaceComponentName () {
    let files = await globPify('**/*.*', {
      cwd: path.resolve('components', args.compName),
      realpath: true
    })

    let readFile = promisify<string, string, string>(fs.readFile)
    await Promise.all(files.map(async filename => {
      let content = await readFile(filename, 'utf-8')
      content = content.replace(/mip-example/g, args.compName).replace(/MIPExample/g, compClassName)
      await fs.writeFile(filename, content, 'utf-8')
    }))
    let rename = promisify<string, string>(fs.rename)
    await Promise.all(
      files.filter(filename => /mip-example\.(js|vue)$/.test(filename))
        .map(async filename => {
          await rename(filename, filename.replace(/mip-example\.(vue|js)/, args.compName + '.$1'))
        })
    )
  }

  downloadRepo(isVue, () => {
    generate(templateDir, args.compName, isVue, async (err: Error | null) => {
      if (err) {
        logger.error('Failed to add component: ' + err.message.trim())
        return
      }

      await replaceComponentName()
      logger.info('Add component: ' + config.args.compName + ' successfully!')
    })
  })
}
