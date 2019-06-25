/**
 * @file 加载 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import program from 'commander'
import { installOrUpdatePlugin, resolvePluginName, isInstalled, loadModule } from './utils/plugin'
import { logger, Plugin, Params, Option } from 'mip-cli-utils'
import chalk from 'chalk'
import { cleanArgs } from './utils/cli'

interface CommandInstance extends Plugin {
  isSubcommand?: boolean;
}

export async function checkAndInstall (command: string) {
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

export function parseOption (option: Option) {
  let parsedArray = []

    // option 后面的值有三种类型： 1.flag，值为 true false 2.可选添值，不填时为 undefined 3.必填值
    let optionValue: string
    switch (option.type) {
      case 'optional':
        optionValue = '[value]'
        break;
      case 'required':
        optionValue = '<value>'
        break;
      case 'flag':
      default:
        optionValue = ''
    }

    parsedArray.push(`-${option.shortName}, --${option.name} ${optionValue}`, `${option.description}`)

    option.fn && parsedArray.push(option.fn)
    option.defaultValue && parsedArray.push(option.defaultValue)
    return parsedArray
}

export function findIndex (option: Option, argsArray: string[]) {
  let nameIndex = argsArray.indexOf(`--${option.name}`)
  let shortNameIndex = argsArray.indexOf(`-${option.shortName}`)

  if (nameIndex > -1) {
    return nameIndex
  } else if (shortNameIndex > -1) {
    return shortNameIndex
  }
  return -1
}

// 自定义参数解析
// sub-sub command 模式，option -xx 输入位置不同时，将导致 comamnder action 回调参数顺序问题
export function parseArgs (cmd: CommandInstance) {
  // mip2 dev: ['node', 'mip2', 'dev', ...]
  // isSubcommand 时，mip2 dev comoponent : ['node', 'mip2', 'dev', 'component', ...]
  const sliceCount = cmd.isSubcommand ? 4 : 3
  let argsArray = process.argv.slice(sliceCount)

  // 过滤掉数组中的 options （eg: -x, -y value, --yes）
  cmd.options.forEach((opt) => {
    let optIndex = findIndex(opt, argsArray)
    if (optIndex < 0) {
      return
    }
    if (opt.type === 'flag') {
      argsArray.splice(optIndex, 1)
    }
    else {
      argsArray.splice(optIndex, 2)
    }
  })

  // 返回参数对象 {<name>: <value>}
  let argsResult: Record<string, string | string[]> = {}
  cmd.args && cmd.args.forEach((a, index) => {
    if (a.rest) {
      // if c set rest, [a, b, c, d, e] => [c, d, e]
      argsResult[a.name] = argsArray.splice(index, argsArray.length - 1)
    }
    else {
      argsResult[a.name] = argsArray[index]
    }
  })
  return argsResult
}

export function setupCommand (mainCommand: string, cmd: CommandInstance) {
  // 拼接 comamnd
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
    programResult.usage(`${cmd.name} [options] ${commandArgs}`)
  }

  // set options
  cmd.options.forEach(opt => {
    let parsedOpt = parseOption(opt)
    let setOption: (...args: any[]) => void = programResult.option.bind(programResult)
    setOption(...parsedOpt)
  })

  // set description & set action
  programResult
    .description(cmd.description)
    .action((...args) => {
      let params: Params = {args: {}, options: {}}

      // 解析 options, args 最后一个参数是 cmd 对象
      let options = cleanArgs(args[args.length - 1])
      params.options = options

      // parse args
      params.args = parseArgs(cmd)

      // // invoke with params
      cmd.run(params)
    })

  program.parse(process.argv)
}

export async function load (mainCommand: string, args?: string[]) {
  // for dev, 注释掉下一行，不用安装
  // await checkAndInstall(mainCommand)

  let commandDefination: CommandInstance
  try {
    // // for dev
    // commandDefination = loadModule('../../../dev-plugin.js')
    commandDefination = loadModule(resolvePluginName(mainCommand))
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
