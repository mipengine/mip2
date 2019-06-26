/**
 * @file 安装 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import path from 'path'
import fs from 'fs'
import { Command } from 'mip-cli-utils'
import { executeCommand } from './exec'

/**
 * 插件命名规则：mip-cli-plugin-xxx
 * installedPath: mip cli 及 plugin 安装目录：
 */
// const pluginREG = /^(mip-|@[\w-]+\/mip-)cli-plugin-/
// const installedPath = path.join(__dirname, '../../..')

// for dev mode
const pluginREG = /^(mip-)*cli-plugin-/
const installedPath = path.join(__dirname, '../../..')

export async function installOrUpdatePlugin (command: string, packageName: string | string[], registry: string = '') {
  let args = [command, '--loglevel', 'error']

  if (Array.isArray(packageName)) {
    args = args.concat(packageName)
  } else {
    args.push(packageName)
  }

  registry && args.push('--registry', registry)

  await executeCommand('npm', args, installedPath)
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

export function pad (str: string, width: number) {
  let len = Math.max(0, width - str.length)
  return str + Array(len + 1).join(' ')
}

export function printDescription (name: string, description: string) {
  if (description) {
    // used for left-align commands list
    const MAGIC = 35
    console.log(`  ${pad(name, MAGIC)}${description || ''}`)
  }
}

export function loadModule (name: string) {
  let loadResult = require(name)

  if (loadResult.__esModule) {
    return loadResult.default
  }

  return loadResult
}

export function showPluginCmdHelpInfo () {
  let pluginsPkgs = getPluginPackages()

  if (!pluginsPkgs.length) {
    return
  }

  console.log()
  console.log('User Plugin Commands:')

  pluginsPkgs.forEach(pkg => {
    let cmdName = resolveCommandFromPackageName(pkg)
    try {
      // const cmdModule = loadModule(pkg)
      // for dev
      const cmdModule = loadModule(`mip-${pkg}`)

      // main command
      printDescription(cmdName, cmdModule.description)
      // sub command
      if (cmdModule.subcommands) {
        cmdModule.subcommands.forEach((subcmd: Command) => {
          printDescription(`${cmdName} ${subcmd.name}`, subcmd.description)
        })
      }
    } catch (e) {}
  })

  console.log()
}
