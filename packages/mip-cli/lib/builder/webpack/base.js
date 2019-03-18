/**
 * @file webpack builder
 * @author clark-t (clarktanglei@163.com)
 */
const config = require('./config')
const {globPify} = require('../../utils/helper')
const projectPath = require('../../utils/project-path')
const path = require('path')
const cli = require('../../cli')

module.exports = class WebpackBaseBuilder {
  constructor (options) {
    this.options = options

    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })

    this.outputDir = options.output || path.resolve('dist')
    this.packageJsonPathname = path.resolve(this.dir, 'package.json')
    this.componentDir = projectPath.components(this.dir)
  }

  async getEntries () {
    let globOpts = {
      cwd: this.componentDir,
      root: this.componentDir
    }

    let components = await globPify('mip-*/mip-*.@(vue|js)', globOpts)
      .then(arr => arr.filter(name => /(mip-[\w-]+)\/\1\.(vue|js)$/.test(name)))

    if (!components.length) {
      cli.error(`在该路径下找不到 mip 组件入口文件，请检查路径是否规范：\n${this.componentDir}`)
      // 在 dev 模式下 throw Error 不会导致中断也不会显示错误，因此需要 process.exit(1) 强制中断
      process.exit(1)
    }

    let entries = components.reduce((entries, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      entries[`${basename}/${basename}`] = path.resolve(this.componentDir, pathname)
      return entries
    }, {})

    return entries
  }

  async initConfig () {
    let entries = await this.getEntries()

    let options = Object.assign(
      {
        entry: entries,
        outputPath: this.outputDir,
        context: this.dir
      },
      this.options
    )

    this.config = config(options)
  }
}
