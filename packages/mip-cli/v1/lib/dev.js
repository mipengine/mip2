/**
 * @file dev.js
 * @author clark-t (clarktanglei@163.com)
 */
const Server = require('./server')
const cli = require('./cli')
const chalk = require('chalk')
const path = require('path')

module.exports = async function (options) {
  options.dir = path.resolve(process.cwd(), options.dir || '')
  options.port = options.port || 8111
  options.livereload = options.livereload || false
  options.env = 'development'

  process.env.NODE_ENV = options.env

  if (options.asset) {
    options.asset = options.asset.replace(/\/$/, '').replace(/:\d+/, '') + ':' + options.port
  } else {
    options.asset = 'http://127.0.0.1:' + options.port
  }

  const server = new Server(options)

  try {
    await server.run()

    console.log()
    console.log()
    cli.info(`服务启动成功，正在监听 ${options.asset}`)
    console.log()
    console.log(chalk.yellow('预览示例:'))
    console.log(`组件示例放在 /components/{组件名}/example 目录下，可通过 ${chalk.green(options.asset + '/components/{组件名}/example/{页面名}.html')} 进行预览。`)
    console.log()
    console.log('也可以直接访问 ' + chalk.green(options.asset) + ' 点击对应的示例文件。')
    console.log()
    console.log(chalk.yellow('调试组件:'))
    console.log(`调试阶段下组件编译产物 URL 为 ${chalk.green(options.asset + '/{组件名}/{组件名}.js')} ，可在 HTML 页面直接引入进行调试。`)
    console.log()
    console.log()

    let autoopen = options.autoopen

    if (autoopen) {
      if (/^\//.test(autoopen)) {
        autoopen = `http://127.0.0.1:${server.port}${autoopen}`
      }

      cli.info(`正在打开网页 ${autoopen}`)
      require('opn')(autoopen)
    }
  } catch (e) {
    cli.error(e, '服务启动失败')
  }
}
