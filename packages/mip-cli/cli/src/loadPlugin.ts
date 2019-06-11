/**
 * @file 加载 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import program from 'commander'
import { installOrUpdatePlugin, resolvePluginName, isInstalled } from './utils/plugin'
import utils from 'mip-cli-utils'
import chalk from 'chalk'
import { cleanArgs } from './utils/cli'

async function checkAndInstall (command: string) {
  const packageName = resolvePluginName(command)

  if (!isInstalled(packageName)) {
    utils.logger.info(`正准备安装 ${chalk.cyan(packageName)}`)

    try {
      await installOrUpdatePlugin('install', packageName)
    } catch (e) {
      return utils.logger.error(`插件 ${chalk.cyan(packageName)} 不存在，请重新输入`)
    }

    utils.logger.info(`${chalk.cyan(packageName)} 安装成功`)
  }
}

function setupCommand (mainCommand: string, cmd: any) {
  let command: string
  let commandPrefix: string = cmd.isSubcommand ? `${mainCommand} <${cmd.name}>` : `${mainCommand}`
  let commandArgs = cmd.args
    .map(arg => arg.optional ? `[${arg.name}]` : `<${arg.name}>`)
    .join(' ')

  command = `${commandPrefix} ${commandArgs}`

  // set command
  let programResult = program.command(command)

  if (cmd.isSubcommand) {
    // hack subcommand: display the usage correctly
    programResult = programResult.usage(`${cmd.name} ${commandArgs}`)
  }

  // set options
  cmd.options.forEach(opt => {
    programResult.option(`-${opt.shortName}, --${opt.name} ${opt.optional ? '[value]' : '<value>'}`, `${opt.description}`)
  })

  // set description
  // set action
  programResult
    .description(cmd.description)
    .action((...args) => {
      let params = {}

      // 从参数数组解析出参数对象 {<argsName>: <argsValue>}
      cmd.args.forEach((a, index) => {
        params[a.name] = args[cmd.isSubcommand ? index + 1 : index]
      })

      // commander action 回调最后一个参数始终是 cmd 对象，从中获取简单 options 对象 {<optionName>: <optionValue>}
      let options = cleanArgs(args[args.length - 1])
      params.options = options

      // invoke with params
      cmd.run(params)
    })

  program.parse(process.argv)

  // program
  //   .command('dev <component> [dir]')
  //   .option('-p, --port <value>', '端口号')
  //   .description('描述这个命令的功能')
  //   // .on('--help', () => {
  //   //   console.log('')
  //   //   console.log('Examples:');
  //   //   console.log('  $ custom-help --help');
  //   //   console.log('  $ custom-help -h');
  //   // })
  //   // .action((...args) => {
  //   .action((name, dir) => {
  //     console.log('========= plugin run ==========')
  //     console.log(name, dir)
  //   })
  // program.parse(process.argv)
}

export async function load (mainCommand: string, args?: string[]) {
  // 1 检查 plugin 是否安装
  // 2 npm install 安装plugin
  // 3 根据子命令/命令 加载模块
  // 4 运行命令

  await checkAndInstall(mainCommand)

  let pluginPackage: any
  try {
    // // for dev
    // pluginPackage = require('../../dev-plugin.js')
    pluginPackage = require(resolvePluginName(mainCommand))
  } catch (e) {
    utils.logger.info('加载命令插件失败', e)
    return
  }

  // plugin 定义
  const commandDefination = pluginPackage.command

  // 查询是否有子命令，如果有直接加载子命令模块，否则加载主命令模块
  const subcommand = args && args[0]
  const subcommandDefination = commandDefination.subcommands && commandDefination.subcommands.find(s => s.name === subcommand)

  // 最终加载的插件定义
  let cmd: any
  if (subcommandDefination) {
    subcommandDefination['isSubcommand'] = true
    cmd = subcommandDefination
  } else {
    cmd = commandDefination
  }

  setupCommand(mainCommand, cmd)
}
