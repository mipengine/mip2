/**
 * @file 安装 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import path from 'path'
import fs from 'fs'
import execa from 'execa'
import utils from 'mip-cli-utils'

/**
 * 插件命名规则：mip-cli-plugin-xxx
 * installedPath: mip cli 及 plugin 安装目录：
 */
// const pluginREG = /^(mip-|@[\w-]+\/mip-)cli-plugin-/
// const installedPath = path.join(__dirname, '../../..')

// for dev mode
const pluginREG = /^cli-plugin-*/
const installedPath = path.join(__dirname, '../../../../..')

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
  utils.logger.info(`${command} completed!`)
}

export function getPluginPackages () {
  let pkgs = fs.readdirSync(installedPath)
  return pkgs.filter(item => pluginREG.test(item))
}

export function isPluginFullName (name: string) {
  return pluginREG.test(name)
}
