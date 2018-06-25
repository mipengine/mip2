/**
 * @file webpack builder
 * @author clark-t (clarktanglei@163.com
 * )
 */

const webpack = require('webpack')
const middleware = require('koa-webpack')
const config = require('./config')
const chokidar = require('chokidar')
/* eslint-disable */
const {globPify} = require('../../utils/helper');
/* eslint-enable */
const projectPath = require('../../utils/project-path')
const path = require('path')
const cli = require('../../cli')

module.exports = class WebpackBuilder {
  constructor (options) {
    this.outputDir = options.output || path.resolve('dist')
    this.dir = options.dir
    this.componentDir = projectPath.components(this.dir)
    this.asset = options.asset
    this.ignore = options.ignore

    if (options.dev) {
      this.mode = 'development'
      this.initDev()
      this.initWatcher()
    } else {
      this.mode = 'production'
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
    return new Promise((resolve, reject) => {
      webpack(this.config, (err, result) => {
        if (err) {
          reject(err)
        } else if (result.hasErrors()) {
          reject(result.compilation.errors)
        } else {
          resolve(result)
        }
      })
    })
  }

  async getEntries () {
    let globOpts = {
      cwd: this.componentDir,
      root: this.componentDir
    }

    let components = await globPify('mip-*/mip-*.@(vue|js)', globOpts)
      .then(arr => arr.filter(name => /(mip-[\w-]+)\/\1\.(vue|js)$/.test(name)))

    // let [vueComponents, jsComponents] = await Promise.all([
    //   globPify('mip-*/mip-*.vue', globOpts).then(arr => arr.filter(name => /(mip-[\w-]+)\/\1\.vue$/.test(name))),
    //   globPify('mip-*/mip-*.vue', globOpts).then(arr => arr.filter(name => /(mip-[\w-]+)\/\1\.vue$/.test(name)))
    // ])

    // globPify('mip-*/mip-*.vue', globOpts)
    //   .then(arr => arr.filter(name => /(mip-[\w-]+)\/\1\.vue$/.test(name)))

    return components.reduce((entries, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      entries[basename] = path.resolve(this.componentDir, pathname)
      return entries
    }, {})

    // let [singleComponents, complexComponents] = await Promise.all([
    //     globPify('mip-*.vue', globOpts),
    //     globPify('mip-*/mip-*.vue', globOpts)
    //         .then(arr => arr.filter(name => /(mip-\w+)\/\1\.vue$/.test(name)))
    // ]);

    // return [...singleComponents, ...complexComponents].reduce((entries, pathname) => {
    //     let basename = path.basename(pathname, '.vue');
    //     entries[basename] = path.resolve(this.componentDir, pathname);
    //     return entries;
    // }, {});
  }

  async initConfig () {
    let entries = await this.getEntries()
    this.config = config({
      entry: entries,
      outputPath: this.outputDir,
      mode: this.mode,
      context: this.dir,
      asset: this.asset,
      ignore: this.ignore
    })
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
    this.watcher = chokidar.watch(this.componentDir)
    let cb = async pathname => {
      if (this.isOnInited) {
        return
      }

      if (!projectPath.isComponentPath(this.dir, pathname)) {
        return
      }

      // let basename = path.basename(pathname)
      // // 非入口文件的增减则不做任何处理
      // if (!/^mip-[\w-]+\.(vue|js)$/.test(basename)) {
      //   return
      // }

      // if (
      //   path.resolve(
      //     projectPath.componentDir(this.dir),
      //     path.basename(basename, path.extname(basename)),
      //     basename
      //   ) !== path.resolve(pathname)
      // ) {
      //   return
      // }

      // let possibleComponents = projectPath.possibleComponents(this.componentDir, basename.slice(-4));
      // if (possibleComponents.indexOf(pathname) < 0) {
      //     return;
      // }

      try {
        await this.initDev()
      } catch (e) {
        cli.error('init error')
        cli.error(e)
      }
    }

    this.watcher.on('ready', () => {
      this.watcher.on('add', cb).on('unlink', cb)
    })
  }
}
