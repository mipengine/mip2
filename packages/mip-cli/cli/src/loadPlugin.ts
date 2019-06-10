/**
 * @file 加载 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import program from 'commander'
import { installOrUpdatePlugin, resolvePluginName, isInstalled } from './utils/plugin'
import utils from 'mip-cli-utils'
import chalk from 'chalk'

async function checkAndinstall (command: string) {
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

function setupCommand (commandDef: any) {
  let command: string
  let commandPrefix = commandDef.isSubcommand ? `dev <${commandDef.name}>` : 'dev'
  let commandArgs = commandDef.args
    .map(arg => arg.optional ? `[${arg.name}]` : `<${arg.name}>`
    )
    .join(' ')

  command = `${commandPrefix} ${commandArgs}`

  // set command
  let programResult = program.command(command)

  // set options
  commandDef.options.forEach(opt => {
    programResult.option(`-${opt.shortName}, --${opt.name} ${opt.optional ? '[value]' : '<value>'}`, `${opt.description}`)
  })

  // set description
  // set action
  programResult
    .description(commandDef.description)
    .action((...args) => {
      // console.log('action', args, args.length)
      let params = {}
      commandDef.args.forEach((a, index) => {
        params[a.name] = args[commandDef.isSubcommand ? index + 1 : index]
      })

      commandDef.options.forEach((o) => {
        params[o.name] = args[args.length - 1][o.name]
      })

      // invoke with params
      console.log(params)
    })

  program.parse(process.argv)

  // program
  //   .command('dev <name> [dir]')
  //   .option('-p, --port <value>', '端口号')
  //   .description('描述这个命令的功能')
  //   // .on('--help', () => {
  //   //   console.log('')
  //   //   console.log('Examples:');
  //   //   console.log('  $ custom-help --help');
  //   //   console.log('  $ custom-help -h');
  //   // })
  //   .action((...args) => {
  //     console.log('========= plugin run ==========')
  //     console.log(Array.isArray(args))
  //   })
  // program.parse(process.argv)
}

export async function load (command: string, args?: string[]) {
  // 1 检查plugin 是否安装
  // 2 npm install 安装plugin
  // 3 根据子命令/命令 加载模块
  // 4 运行命令

  // await checkAndinstall(command)

  let pluginPackage: any
  try {
    // for dev
    pluginPackage = require('../../dev-plugin.js')
    // pluginPackage = require(resolvePluginName(command))
  } catch (e) {
    utils.logger.info('加载命令插件失败', e)
    return
  }

  // plugin 定义
  const pluginDefination = pluginPackage.command

  // 查询是否有子命令，如果有直接加载子命令模块，否则加载主命令模块
  const subcommand = args && args[0]
  const subcommandDefination = pluginDefination.subcommands && pluginDefination.subcommands.find(s => s.name === subcommand)

  // 最终加载的插件定义
  let defination: any
  if (subcommandDefination) {
    subcommandDefination['isSubcommand'] = true
    defination = subcommandDefination
  } else {
    defination = pluginDefination
  }

  setupCommand(defination)
}
