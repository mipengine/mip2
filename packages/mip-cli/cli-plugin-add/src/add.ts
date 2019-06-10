/**
 * @file add mip component
 * @author tracy (qiushidev@gmail.com)
 */

// import { Arguments } from './interface'
import path from 'path'
import fs from 'fs-extra'
import { downloadRepo, generate } from '../../cli-utils/src/template'
import globPify from '../../cli-utils/src/helper'
import { promisify } from 'util'
import * as cli from '../../cli-utils/src/logger'

const templateDir = 'template/components/mip-example'

interface Arguments {
  compName: string;
  options: {
    vue: boolean;
    force: boolean;
  };
}

export function add (config: Arguments) {
  if (!config.compName) {
    cli.error('缺少组件名称参数，请按 `mip2 add [组件名]` 的格式重新输入')
    return
  }
  if (fs.existsSync(path.resolve('components', config.compName)) && !config.options.force) {
    cli.warn('组件:' + config.compName + ' 已存在，您可以使用 --force 参数强制覆盖')
    return
  }

  let isVue = config.options.vue
  let compClassName = 'MIP' + config.compName.slice(3).replace(/-\w/g, str => str.slice(1).toUpperCase())

  async function replaceComponentName () {
    let files = await globPify('**/*.*', {
      cwd: path.resolve('components', config.compName),
      realpath: true
    })

    let readFile: (file: string, encoding: string) => Promise<string> = promisify(fs.readFile)
    await Promise.all(files.map(async filename => {
      let content = await readFile(filename, 'utf-8')
      content = content.replace(/mip-example/g, config.compName).replace(/MIPExample/g, compClassName)
      await fs.writeFile(filename, content, 'utf-8')
    }))
    let rename: (oldPath: string, newPath: string) => Promise<void> = promisify(fs.rename)
    await Promise.all(
      files.filter(filename => /mip-example\.(js|vue)$/.test(filename))
        .map(async filename => {
          await rename(filename, filename.replace(/mip-example\.(vue|js)/, config.compName + '.$1'))
        })
    )
  }

  downloadRepo(isVue, () => {
    generate(templateDir, config.compName, isVue, async (err: Error | null) => {
      if (err) {
        cli.error('Failed to add component: ' + err.message.trim())
        return
      }

      await replaceComponentName()
      cli.info('Add component: ' + config.compName + ' successfully!')
    })
  })
}
