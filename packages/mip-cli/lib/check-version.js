/**
 * @file 检查 cli 版本，提示更新
 * @author tracy(qiushidev@gmail.com)
 */

const request = require('request')
const semver = require('semver')
const localVersion = require('../package').version
const chalk = require('chalk')

module.exports = function checkVersion () {
  return new Promise((resolve, reject) => {
    request({
      url: 'https://registry.npmjs.org/mip2',
      timeout: 1000
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const latestVersion = JSON.parse(body)['dist-tags'].latest

        if (semver.lt(localVersion, latestVersion)) {
          console.log()
          console.log(chalk.yellow('  *** 检测到有新版本的 mip-cli 可用 ***'))
          console.log()
          console.log('  最新版本: ' + chalk.green(latestVersion))
          console.log('  当前版本: ' + chalk.red(localVersion))
          console.log()
          console.log(' 您可以使用 npm update -g mip2 进行更新')
          console.log()
        }
      }
      resolve()
    })
  })
}
