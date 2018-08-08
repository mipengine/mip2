/**
 * @file webpack builder
 * @author clark-t (clarktanglei@163.com)
 */

const webpack = require('webpack')
const middleware = require('koa-webpack')
const config = require('./config')
const chokidar = require('chokidar')
const {pify, globPify} = require('../../utils/helper')
const projectPath = require('../../utils/project-path')
const validator = require('mip-component-validator')
const path = require('path')
const cli = require('../../cli')

module.exports = class WebpackBuilder {
  constructor (options) {
    this.options = options

    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })

    this.outputDir = options.output || path.resolve('dist')
    this.packageJsonPathname = path.resolve(this.dir, 'package.json')
    this.componentDir = projectPath.components(this.dir)

    if (this.env === 'development') {
      this.initDev()
      this.initWatcher()
    }
  }

  async dev (ctx, next) {
    if (this.isOnInited) {
      ctx.body = 'initing...'
    } else {
      await this.midd(ctx, next)
    }
  }

  async build () {
    await this.initConfig()
    let result = await pify(webpack)(this.config)

    if (result.hasErrors()) {
      throw Error(result.compilation.errors)
    }

    return result
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

  async initDev () {
    if (this.isOnInited) {
      return
    }

    this.isOnInited = true

    if (this.midd) {
      this.midd.close()
    }

    await this.initConfig()
    this.compiler = webpack(this.config)

    this.midd = middleware({
      compiler: this.compiler,
      dev: {
        publicPath: '/',
        stats: 'errors-only'
      },
      hot: false
    })
    this.isOnInited = false
  }

  async initWatcher () {
    let entryWatcher = chokidar.watch(this.componentDir)
    let cb = async pathname => {
      if (this.isOnInited) {
        return
      }

      if (!projectPath.isComponentPath(this.dir, pathname)) {
        return
      }

      try {
        await this.initDev()
      } catch (e) {
        cli.error('init error')
        cli.error(e)
      }
    }

    entryWatcher.on('ready', () => {
      entryWatcher.on('add', cb).on('unlink', cb)
    })

    if (this.ignore && /(^|,)whitelist(,|$)/.test(this.ignore)) {
      return
    }

    let packageWatcher = chokidar.watch(this.packageJsonPathname)
    packageWatcher.on('ready', () => {
      packageWatcher.on('change', async () => {
        let reporter = await validator.whitelist(this.dir)
        if (reporter.errors.length) {
          cli.error(reporter.errors[0].message)
          // 暂时把白名单校验过程改成非中断式的
          // process.exit(1)
        }
      })
    })
  }
}
