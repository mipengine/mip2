/**
 * @file 安装 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import path from 'path'
import fs from 'fs'
import execa from 'execa'
import { logger, Command } from 'mip-cli-utils'

/**
 * 插件命名规则：mip-cli-plugin-xxx
 * installedPath: mip cli 及 plugin 安装目录：
 */
// const pluginREG = /^(mip-|@[\w-]+\/mip-)cli-plugin-/
// const installedPath = path.join(__dirname, '../../..')

// for dev mode
const pluginREG = /^cli-plugin-*/
const installedPath = path.join(__dirname, '../../..')

function executeCommand (command: string, args: string[], targetDir: string) {
  return new Promise((resolve, reject) => {
    const child = execa(command, args, {
      cwd: targetDir,
      stdio: 'inherit'
    })

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`command failed: ${command} ${args.join(' ')}`))
        return
      }
      resolve()
    })
  })
}

export async function installOrUpdatePlugin (command: string, packageName: string | string[], registry: string = '') {
  let args = [command, '--loglevel', 'error']

  if (Array.isArray(packageName)) {
    args = args.concat(packageName)
  } else {
    args.push(packageName)
  }

  registry && args.push('--registry', registry)

  await executeCommand('npm', args, installedPath)
  logger.info(`${command} completed!`)
}

export function getPluginPackages () {
  let pkgs = fs.readdirSync(installedPath)
  return pkgs.filter(item => pluginREG.test(item))
}

export function isPluginFullName (name: string) {
  return pluginREG.test(name)
}

export function isInstalled (pkg: string) {
  const packageDir = path.join(installedPath, pkg)
  return fs.existsSync(packageDir)
}

export function resolvePluginName (name: string) {
  if (pluginREG.test(name)) {
    return name
  }
  return `mip-cli-plugin-${name}`
}

export function resolveCommandFromPackageName (pkg: string) {
  // mip-cli-pulgin-test => test
  return pkg.replace(pluginREG, '')
}

function pad (str: string, width: number) {
  let len = Math.max(0, width - str.length)
  return str + Array(len + 1).join(' ')
}

function printDescription (name: string, description: string) {
  if (description) {
    // used for left-align commands list
    const MAGIC = 35
    console.log(`  ${pad(name, MAGIC)}${description || ''}`)
  }
}

export function showPluginCmdHelpInfo () {
  let pluginsPkgs = getPluginPackages()

  if (!pluginsPkgs.length) {
    return
  }

  console.log()
  console.log('User Plugin Commands:')

  // /** for dev ***********************/
  // let cmdName = 'dev'
  // try {
  //   const cmdModule = require('../../../dev-plugin')
  //   // main command
  //   printDescription(cmdName, cmdModule.command.description)
  //   // sub command
  //   if (cmdModule.command.subcommands) {
  //     cmdModule.command.subcommands.forEach(subcmd => {
  //       printDescription(`${cmdName} ${subcmd.name}`, subcmd.description)
  //     })
  //   }
  // } catch (e) {}
  // /** for dev ***********************/

  pluginsPkgs.forEach(pkg => {
    let cmdName = resolveCommandFromPackageName(pkg)

    try {
      const cmdModule = require(pkg)
      // main command
      printDescription(cmdName, cmdModule.command.description)
      // sub command
      if (cmdModule.command.subcommands) {
        cmdModule.command.subcommands.forEach((subcmd: Command) => {
          printDescription(`${cmdName} ${subcmd.name}`, subcmd.description)
        })
      }
    } catch (e) {}
  })

  console.log()
}
