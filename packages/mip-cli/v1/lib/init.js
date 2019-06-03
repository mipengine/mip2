/**
 * @file 初始化mip项目命令
 * @author tracy(qiushidev@gmail.com)
 */

const cli = require('./cli')
const {downloadRepo, generate} = require('./utils/template')

const templateDir = 'template'

module.exports = function init () {
  downloadRepo(() => {
    generate(templateDir, false, err => {
      if (err) {
        cli.error('Failed to generate project: ' + err.message.trim())
        return
      }

      cli.info('generate MIP project successfully!')
    })
  })
}
