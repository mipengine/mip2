import chalk from 'chalk'
export const logger = {
  info (...args: any[]) {
    console.log(chalk.green('INFO'), ...args)
  },
  warn (...args: any[]) {
    console.warn(chalk.yellow('WARN'), ...args)
  },
  error (...args: any[]) {
    console.error(chalk.red('ERROR'), ...args)
  }
}

// export function info (...args: any[]) {
//   console.log(chalk.green('INFO'), ...args)
// }

// export function warn (...args: any[]) {
//   console.log(chalk.yellow('WARN'), ...args)
// }

// export function error (...args: any[]) {
//   console.error(chalk.red('ERROR'), ...args)
// }
