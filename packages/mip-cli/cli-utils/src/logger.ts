import chalk from 'chalk'
import {format} from 'util'

export function info (...args: any[]) {
  const msg = format(args)
  console.log(chalk.green('INFO'), msg)
}

export function warn (...args: any[]) {
  const msg = format(args)
  console.log(chalk.yellow('WARN'), msg)
}

export function error (...args: any[]) {
  console.error(chalk.red('ERROR'), ...args)
}
