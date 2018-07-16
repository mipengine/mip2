/**
 * @file server.js
 * @author clark-t (clarktanglei@163.com)
 */

const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')
const script = require('./middleware/script')
const html = require('./middleware/html')
const livereload = require('livereload')
const cli = require('../cli')
const koaStatic = require('koa-static')

module.exports = class Server {
  constructor ({
    port = 8111,
    dir,
    livereload,
    asset,
    ignore
  }) {
    if (!asset) {
      asset = 'http://127.0.0.1:' + port
    } else {
      asset = asset.replace(/\/$/, '').replace(/:\d+/, '') + ':' + port
    }

    this.port = port
    this.dir = dir
    this.livereload = livereload
    this.app = new Koa()
    this.asset = asset
    this.ignore = ignore
  }

  run () {
    let record = async (ctx, next) => {
      cli.info(`[request]: ${ctx.request.url}`)
      await next()
    }

    let scriptMiddlewares = script({dir: this.dir, asset: this.asset, ignore: this.ignore, app: this.app})
    let htmlMiddlewares = html({dir: this.dir, livereload: this.livereload, app: this.app})

    this.router = new Router()
    this.router
      .get(['/:id([^\\.]*)', '/:id([^\\.]+\\.html)'], ...htmlMiddlewares)
      // .get('/mip-components-webpack-helpers.js', koaStatic(path.resolve(__dirname, '../../node_modules/mip-components-webpack-helpers/dist')))
      .get('*', ...scriptMiddlewares, koaStatic(this.dir))

    this.app
      .use(record)
      .use(this.router.routes())
      .listen(this.port)

    if (this.livereload) {
      const lrserver = livereload.createServer({
        extraExts: ['vue', 'styl', 'less'],
        delay: 500
      })

      lrserver.watch([
        path.resolve(this.dir, 'components'),
        path.resolve(this.dir, 'common'),
        path.resolve(this.dir, 'example')
      ])
    }
  }
}
