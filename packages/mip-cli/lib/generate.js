/**
 * @file 渲染模板生成项目
 * @author tracy(qiushidev@gmail.com)
 */

const async = require('async')
const path = require('path')
const ms = require('metalsmith')
const inquirer = require('inquirer')
const render = require('./utils/render').render
const getMeta = require('./utils/meta')
const home = require('user-home')
// 本地临时目录
const tmp = path.join(home, '.mip-template')

/**
 * 生成项目 or 组件结构
 *
 * @param {string} dir 渲染模板的目录
 * @param {string} compName 组件名称，仅用于只渲染组件的情况，渲染整个项目不传即可
 * @param {Function} done 回调函数
 */
module.exports = function generate (dir, compName, done) {
  const metalsmith = ms(path.join(tmp, dir))
  const templatePrompts = getMeta(tmp).prompts

  metalsmith
    .use(ask(templatePrompts))
    .use(renderTemplateFiles())
    .clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .build(err => {
      done(err)
    })

  function ask (templatePrompts) {
    return (files, metalsmith, done) => {
      // 替换 components 目录组件名称
      metalsmith.metadata().compName = compName || 'mip-example'

      // 只渲染组件部分时(mip2 add)，不需要走 ask 流程，且使用 component name 作为 dest 路径
      if (compName) {
        metalsmith.destination(path.resolve('./components', compName))
        // 读取项目名称，用于渲染 README.md 的脚本地址
        let siteName = process.cwd().split(path.sep).pop()
        metalsmith.metadata().name = siteName
        return done()
      }

      async.eachSeries(Object.keys(templatePrompts), run, () => {
        // After all inquirer finished, set destination directory with input project name
        metalsmith.destination(path.resolve('./', metalsmith.metadata().name))
        done()
      })

      function run (key, done) {
        let prompt = templatePrompts[key]

        inquirer.prompt([{
          'type': prompt.type,
          'name': key,
          'message': prompt.message || prompt.label || key,
          'default': prompt.default,
          'validate': prompt.validate || (() => true)
        }]).then(answers => {
          if (typeof answers[key] === 'string') {
            metalsmith.metadata()[key] = answers[key].replace(/"/g, '\\"')
          } else {
            metalsmith.metadata()[key] = answers[key]
          }
          done()
        }).catch(done)
      }
    }
  }

  function renderTemplateFiles () {
    return (files, metalsmith, done) => {
      let keys = Object.keys(files)
      async.each(keys, run, done)

      function run (file, done) {
        let str = files[file].contents.toString()

        // do not attempt to render files that do not have mustaches
        if (!/{{([^{}]+)}}/g.test(str)) {
          return done()
        }

        let res
        try {
          res = render(str, metalsmith.metadata())
        } catch (err) {
          return done(err)
        }

        files[file].contents = Buffer.from(res)
        done()
      }
    }
  }
}
