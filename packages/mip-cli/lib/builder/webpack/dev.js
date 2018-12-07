/**
 * @file webpack dev builder
 * @author clark-t (clarktanglei@163.com)
 */

const webpack = require('webpack')
const middleware = require('koa-webpack')
const chokidar = require('chokidar')
const validator = require('mip-component-validator')
const projectPath = require('../../utils/project-path')
const cli = require('../../cli')
const WebpackBaseBuilder = require('./base')

module.exports = class WebpackDevBuilder extends WebpackBaseBuilder {
  constructor (options) {
    super(options)
    this.initDev()
    this.initWatcher()
  }

  async dev (ctx, next) {
    if (this.isOnInited) {
      ctx.body = 'initing...'
    } else {
      await this.midd(ctx, next)
    }
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
