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
  constructor (options) {
    this.app = new Koa()
    this.options = options

    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })
  }

  run () {
    let record = async (ctx, next) => {
      cli.info(`[request]: ${ctx.request.url}`)
      await next()
    }

    let options = Object.assign({app: this.app}, this.options)

    let scriptMiddlewares = script(options)
    let htmlMiddlewares = html(options)

    this.router = new Router()
    this.router
      .get(['/:id([^\\.]*)', '/:id([^\\.]+\\.html)'], ...htmlMiddlewares)
      .get('*', ...scriptMiddlewares, koaStatic(this.dir))

    this.app
      .use(record)
      .use(this.router.routes())
      .listen(this.port)

    if (this.livereload) {
      const lrserver = livereload.createServer({
        extraExts: ['vue', 'less', 'styl', 'stylus'],
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
