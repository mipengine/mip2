/**
 * @file add mip component
 * @author tracy (qiushidev@gmail.com)
 */

const path = require('path')
const fs = require('fs-extra')
const cli = require('./cli')
const {downloadRepo, generate} = require('./utils/template')
const {globPify} = require('./utils/helper')

const templateDir = 'template/components/mip-example'

module.exports = function add (config) {
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

  downloadRepo(isVue, opts => {
    generate(templateDir, config.compName, isVue, async err => {
      if (err) {
        cli.error('Failed to add component: ' + err.message.trim())
        return
      }

      await replaceComponentName()
      cli.info('Add component: ' + config.compName + ' successfully!')
    })
  })

  async function replaceComponentName () {
    let files = await globPify('**/*.*', {
      cwd: path.resolve('components', config.compName),
      realpath: true
    })

    await Promise.all(files.map(async filename => {
      let content = await fs.readFile(filename, 'utf-8')
      content = content.replace(/mip-example/g, config.compName).replace(/MIPExample/g, compClassName)
      await fs.writeFile(filename, content, 'utf-8')
    }))
    await Promise.all(
      files.filter(filename => /mip-example\.(js|vue)$/)
        .map(async filename => {
          await fs.rename(filename, filename.replace(/mip-example\.(vue|js)/, config.compName + '.$1'))
        })
    )
  }
}
