/**
 * @file build.js
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('./builder/webpack/build')
const fs = require('fs-extra')
const path = require('path')
const cli = require('./cli')
const CWD = process.cwd()

module.exports = async function (options) {
  options.output = path.resolve(CWD, options.output || 'dist')
  options.dir = path.resolve(CWD, options.dir || '')
  options.asset = options.asset || '/'
  options.env = options.env || 'production'
  // options.dev = false
  // output = path.resolve(CWD, output)
  // dir = path.resolve(CWD, dir)
  process.env.NODE_ENV = options.env

  const builder = new Builder(options)

  try {
    if (options.clean) {
      await fs.remove(options.output)
    }
    cli.info('开始编译...')
    await builder.build()

    cli.info('编译成功！')
  } catch (e) {
    cli.error('编译失败')
    if (Array.isArray(e)) {
      e.forEach(err => {
        cli.error(err)
        cli.info(' ')
      })
    } else {
      cli.error(e)
    }

    throw e
  }
}
