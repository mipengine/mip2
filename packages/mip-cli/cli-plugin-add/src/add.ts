/**
 * @file add mip component
 * @author tracy (qiushidev@gmail.com)
 */

import path from 'path'
import fs from 'fs-extra'
import { downloadRepo, generate } from './utils/template'
import { logger, Params, globPify, pify } from 'mip-cli-utils'

const templateDir = 'template/components/mip-example'

export function add (config: Params) {
  const compName = config.args.compName as string
  const options = config.options
  if (!compName) {
    logger.error('缺少组件名称参数，请按 `mip2 add [组件名]` 的格式重新输入')
    return
  }
  if (fs.existsSync(path.resolve('components', compName)) && !options.force) {
    logger.warn('组件:' + compName + ' 已存在，您可以使用 --force 参数强制覆盖')
    return
  }

  let isVue = options.vue as boolean
  let compClassName = 'MIP' + compName.slice(3).replace(/-\w/g, str => str.slice(1).toUpperCase())

  async function replaceComponentName () {
    let files = await globPify('**/*.*', {
      cwd: path.resolve('components', compName),
      realpath: true
    })

    let readFile = pify(fs.readFile)
    await Promise.all(files.map(async filename => {
      let content = await readFile(filename, 'utf-8') as string
      content = content.replace(/mip-example/g, compName).replace(/MIPExample/g, compClassName)
      await fs.writeFile(filename, content, 'utf-8')
    }))
    let rename = pify(fs.rename)
    await Promise.all(
      files.filter(filename => /mip-example\.(js|vue)$/.test(filename))
        .map(async filename => {
          await rename(filename, filename.replace(/mip-example\.(vue|js)/, compName + '.$1'))
        })
    )
  }

  downloadRepo(isVue, () => {
    generate(templateDir, compName, isVue, async (err: Error | null) => {
      if (err) {
        logger.error('Failed to add component: ' + err.message.trim())
        return
      }

      await replaceComponentName()
      logger.info('Add component: ' + compName + ' successfully!')
    })
  })
}
