/**
 * @file addPlugin 添加自定义扩展组件
 * @author tracy(qiushidev@gmail.com)
 */

const path = require('path')
const fs = require('fs')
const {
  resolvePluginName,
  isInstalled,
  installPackage,
  resolve,
  resolveCommand
} = require('./utils/plugin')
const cli = require('./cli')

module.exports = async function addPlugin ({pluginName, options = {}, context = process.cwd()}) {
  if (!pluginName) {
    return cli.error(`pluginName not found`)
  }

  const packageName = resolvePluginName(pluginName)

  // install if necessary
  if (!isInstalled(packageName)) {
    cli.info(`Built-in command not found. Ready to install ${cli.chalk.cyan(packageName)} automatically...`)

    try {
      await installPackage(path.resolve(__dirname, '../../..'), 'npm', packageName)
    } catch (e) {
      return cli.warn(`${cli.chalk.cyan(packageName)} does not exist, check your input again.`)
    }

    cli.info(`${cli.chalk.cyan(packageName)} successfully installed`)
  }

  // invoke command

  /**
   * resolve cmd module path to execuate
   *
   * @param {String} cliDir cli directory
   * @param {String} args input arguements
   * @return {String} command module path which will be execuate
   */
  const resolveCmdPath = (cliDir, args) => {
    const mainCommand = resolveCommand(args[0])
    const subCommand = args[1]

    // scan cli dir to check if args of main command is a subcommand
    const pkgSubCommandDir = path.join(cliDir, mainCommand)

    let pkgSubCommands = []
    if (fs.existsSync(pkgSubCommandDir)) {
      pkgSubCommands = fs.readdirSync(path.join(cliDir, mainCommand)).map(file => path.basename(file, '.js'))
    }

    // match cli file with command name
    if (pkgSubCommands.indexOf(subCommand) !== -1) {
      return path.join(cliDir, mainCommand, subCommand)
    }

    return path.join(cliDir, mainCommand)
  }

  // user custom plugin dir: mip-cli-plugin-xxx/cli
  const cliPath = path.join(resolve(packageName), 'cli')

  let commandModule
  try {
    const cmdPath = resolveCmdPath(cliPath, options.args)
    commandModule = require(cmdPath)
  } catch (e) {
    cli.error('Cannot find command module', e)
    return
  }

  // setup cli configuration
  cli.setup(commandModule.cli.config)

  // help information
  if (options.rawArgs.indexOf('--help') !== -1 || options.rawArgs.indexOf('-h') !== -1) {
    return cli.program.help()
  }

  // invoke main
  commandModule.cli.main(options.args, cli.program)
}
