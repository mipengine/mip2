/**
 * @file 加载 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import program from 'commander'
import { installOrUpdatePlugin, resolvePluginName, isInstalled } from './utils/plugin'
import { logger, Plugin } from 'mip-cli-utils'
import chalk from 'chalk'
import { cleanArgs } from './utils/cli'

interface CommandInstance extends Plugin {
  isSubcommand?: boolean;
}

interface Params {
  [key: string]: Record<string, string | undefined>;
}

async function checkAndInstall (command: string) {
  const packageName = resolvePluginName(command)

  if (!isInstalled(packageName)) {
    logger.info(`正准备安装 ${chalk.cyan(packageName)}`)

    try {
      await installOrUpdatePlugin('install', packageName)
    } catch (e) {
      return logger.error(`插件 ${chalk.cyan(packageName)} 不存在，请重新输入`)
    }

    logger.info(`${chalk.cyan(packageName)} 安装成功`)
  }
}

function setupCommand (mainCommand: string, cmd: CommandInstance) {
  let command: string

  let commandPrefix: string = cmd.isSubcommand ? `${mainCommand} <${cmd.name}>` : `${mainCommand}`

  let commandArgs = (cmd.args || [])
    .map(arg => {
      if (arg.optional) {
        return arg.rest ? `[${arg.name}...]` : `[${arg.name}]`
      }
      return arg.rest ? `<${arg.name}...>` : `<${arg.name}>`
    })
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
      let params: Params = {}

      if (!cmd.args) {
        return
      }

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

  let commandDefination: CommandInstance
  try {
    // // for dev
    commandDefination = require('../../dev-plugin.js')
    // commandDefination = require(resolvePluginName(mainCommand))
  } catch (e) {
    logger.info('加载命令插件失败', e)
    return
  }

  // 查询是否有子命令，如果有直接加载子命令模块，否则加载主命令模块
  const subcommandName = args && args[0]
  const subcommandDefination = commandDefination.subCommands && commandDefination.subCommands.find(s => s.name === subcommandName)

  // 最终加载的插件定义
  let cmd: CommandInstance
  if (subcommandDefination) {
    cmd = subcommandDefination
    cmd['isSubcommand'] = true
  } else {
    cmd = commandDefination
  }

  try {
    setupCommand(mainCommand, cmd)
  } catch (e) {
    logger.error('启动命令插件失败', e)
  }
}
