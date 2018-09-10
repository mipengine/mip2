/**
 * @file plugins 相关的方法
 * @author tracy(qiushidev@gmail.com)
 */

const path = require('path')
const fs = require('fs')
const execa = require('execa')
const chalk = require('chalk')

// plugin name rules
// common：mip-cli-plugin-xxx
// under specific scope：@somescope/mip-cli-plugin-xxx
const pluginREG = /^(mip-|@[\w-]+\/mip-)cli-plugin-/

// mip2 & mip-cli-plugin-xxx install path
const installedPath = path.join(__dirname, '../../..')
// const installedPath = path.resolve(__dirname, '../../../../node_modules') // for dev mode only

exports.resolvePluginName = name => {
  if (pluginREG.test(name)) {
    return name
  }

  return `mip-cli-plugin-${name}`
}

exports.installPackage = async (targetDir, command, packageName) => {
  const args = ['install', '--loglevel', 'error']
  args.push(packageName)
  await exports.executeCommand(command, args, targetDir)
}

exports.isInstalled = pkg => {
  const packageDir = path.join(installedPath, pkg)
  return fs.existsSync(packageDir)
}

exports.executeCommand = (command, args, targetDir) => {
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

exports.resolve = pkg => {
  function fix (dir) {
    let idx = dir.lastIndexOf(pkg)
    if (idx === -1) {
      throw new Error('Invalid package name')
    }
    dir = dir.substr(0, idx + pkg.length)

    return dir
  }

  // handle: plugin package without index.js as main entry
  try {
    return fix(require.resolve(pkg))
  } catch (e) {
    return path.resolve(__dirname, '..', '..', '..', pkg)
  }
}

exports.resolveCommand = pkg => {
  // if args[0] is full package name, covert to executable main command
  // `mip2 mip-cli-pulgin-test` => `mip2 test`
  return pkg.replace(pluginREG, '')
}

exports.showPluginCmdHelpInfo = () => {
  let pluginsPkgs = exports.getPluginPackages()

  if (!pluginsPkgs.length) {
    return
  }

  console.log()
  console.log('  User Plugin Commands:')
  console.log()

  pluginsPkgs.forEach(pkg => {
    let cmd
    let description
    try {
      cmd = exports.resolveCommand(pkg)
      const cmdModule = require(path.join(exports.resolve(pkg), 'cli', cmd))
      description = cmdModule.cli.config.description
    } catch (e) {}

    if (cmd) {
      // used for left-align commands list
      const MAGIC = 15
      console.log(`    ${pad(cmd, MAGIC)}${chalk.green(description || '')}`)
    }
  })

  console.log()
}

exports.getPluginPackages = () => {
  let pkgs = fs.readdirSync(installedPath)
  return pkgs.filter(item => pluginREG.test(item))
}

function pad (str, width) {
  let len = Math.max(0, width - str.length)
  return str + Array(len + 1).join(' ')
}
