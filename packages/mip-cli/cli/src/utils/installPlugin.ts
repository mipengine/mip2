/**
 * @file 安装 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import path from 'path'
import execa from 'execa'
// import utils from '../../../cli-utils' // TODO: 改相对路径为模块名

// mip2 & mip-cli-plugin-xxx install path
const installedPath = path.join(__dirname, '../../..')
// dev
// const installedPath = path.join(__dirname, '../../../../..')

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

export async function installPlugin (command: string, packageName: string, registry: string = '') {
  const args: string[] = ['install', '--loglevel', 'error']
  args.push(packageName)
  registry && args.push('--registry', registry)
  console.log(installedPath)
  await executeCommand(command, args, installedPath)
}
