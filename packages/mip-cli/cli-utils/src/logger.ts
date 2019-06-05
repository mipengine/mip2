import chalk from 'chalk'

export function info (...args: any[]) {
  console.log(chalk.green('INFO'), ...args)
}

export function warn (...args: any[]) {
  console.log(chalk.yellow('WARN'), ...args)
}

export function error (...args: any[]) {
  console.error(chalk.red('ERROR'), ...args)
}
