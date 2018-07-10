/**
 * @file dev.js
 * @author clark-t (clarktanglei@163.com)
 */

const Server = require('./server')
const cli = require('./cli')
const opn = require('opn')
const chalk = require('chalk')

module.exports = function ({
  dir = process.cwd(),
  port = 8111,
  livereload = false,
  asset,
  autoopen,
  ignore
}) {
  const server = new Server({port, dir, livereload, ignore, asset})

  try {
    server.run()

    console.log()
    console.log()
    cli.info(`服务启动成功，正在监听 http://127.0.0.1:${server.port}`)
    console.log()
    console.log(chalk.yellow('预览页面:'))
    console.log(`/example 目录下的 html 可以通过 http://127.0.0.1:${server.port}/example/{页面名}.html 进行预览。`)
    console.log()
    console.log(chalk.yellow('预览组件:'))
    console.log(`/components/{组件名}/example 目录下的 html 可以通过 http://127.0.0.1:${server.port}/components/{组件名}/example/{页面名}.html 进行预览。`)
    console.log()
    console.log(chalk.yellow('调试组件:'))
    console.log(`组件可以通过引入 http://127.0.0.1:${server.port}/{组件名}/{组件名}.js 进行调试。`)
    console.log()
    console.log()

    if (autoopen) {
      if (/^\//.test(autoopen)) {
        autoopen = `http://127.0.0.1:${server.port}${autoopen}`
      }

      cli.info(`正在打开网页 ${autoopen}`)
      opn(autoopen)
    }
  } catch (e) {
    cli.error(e, '服务启动失败')
  }
}
