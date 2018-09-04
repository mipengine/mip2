/**
 * @file cli
 * @author tracy(qiushidev@gmail.com)
 */

'use strict'
const program = require('commander')
const chalk = require('chalk')
const format = require('util').format

module.exports = {
  program,
  chalk,

  /**
   * 设置命令行项目解析
   *
   * @param  {Object} config 解析参数
   * @return {Array}  解析后的参数集合
   */
  setup (config) {
    if (config.name) {
      program.name(config.name)
    }

    if (config.usage) {
      program.arguments(config.usage)
    }

    if (config.options) {
      config.options.forEach(option => {
        program.option(option[0], option[1], option[2])
      })
    }

    if (config.help) {
      program.on('--help', () => {
        console.log(config.help)
      })
    }

    program.parse(process.argv)
    // 只有命令，没有设置参数，打印help
    if (program.args.length === 0 && !config.noArgs) {
      return program.help()
    }

    return program.args || []
  },

  /**
   * 打印消息
   *
   * @param {...string} args 参数
   */
  info (...args) {
    const msg = format.apply(format, args)
    console.log(chalk.green('INFO'), msg)
  },

  /**
   * 打印警告
   *
   * @param {...string} args 参数
   */
  warn (...args) {
    const msg = format.apply(format, args)
    console.log(chalk.yellow('WARN'), msg)
  },

  /**
   * 打印错误
   *
   * @param {...string} args 参数
   */
  error (...args) {
    console.error(chalk.red('ERROR'), ...args)
  }
}
