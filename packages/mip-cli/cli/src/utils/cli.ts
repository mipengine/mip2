/**
 * @file CLI utilities
 * @author qiushidev@gmail.com
 */

import semver from 'semver'
import chalk from 'chalk'
import {Command, Option} from 'commander'
import {Arguments} from '../types/interface'

export function checkNodeVersion(expectVersion: string): void {
  if (!semver.satisfies(process.version, expectVersion)) {
    console.log(
      chalk.red(`您的 Node 版本是 ${process.version}，MIP CLI 需要 ${expectVersion} 及以上版本，请升级您的 Node 版本。` )
    )
    process.exit(1)
  }
}

export function camelize (str: string): string {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

export function cleanArgs (cmd: Command) {
  const args: Arguments = {}

  cmd.options.forEach((o: Option) => {
    const key: string = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}