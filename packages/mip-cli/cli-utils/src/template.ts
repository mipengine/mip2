/**
 * @file template 项目模板工具
 * @author tracy (qiushidev@gmail.com) clark-t (clarktanglei@163.com)
 */

import path from 'path'
import { existsSync as exists } from 'fs'
import ora from 'ora'
import home from 'user-home'
import { sync as rm } from 'rimraf'
import download from 'download-git-repo'

import async, { ErrorCallback } from 'async'
import ms, { Callback, Plugin, Files } from 'metalsmith'
import inquirer from 'inquirer'
import render from './render'
import getMeta from './meta'

const OFFICIAL_VUE_TEMPLATE = 'mipengine/mip-cli-template#vue'
const OFFICIAL_TEMPLATE = 'mipengine/mip-cli-template'

const VUE_TEMPLATE_TMP = path.resolve(home, '.mip-vue-template')
const TEMPLATE_TMP = path.resolve(home, '.mip-template')

export function downloadRepo (isVue: boolean | Function, done: Function) {
  if (typeof isVue === 'function') {
    done = isVue
    isVue = false
  }

  let template
  let tmp

  if (isVue) {
    template = OFFICIAL_VUE_TEMPLATE
    // 本地临时目录
    tmp = VUE_TEMPLATE_TMP
  } else {
    template = OFFICIAL_TEMPLATE
    tmp = TEMPLATE_TMP
  }

  const spinner = ora('正在获取最新模板')
  spinner.start()

  // 先清空临时目录
  if (exists(tmp)) {
    rm(tmp)
  }

  // 下载默认模板到临时目录
  download(template, tmp, { clone: false }, (err: Error) => {
    spinner.stop()
    if (err) {
      console.error('Failed to download repo: ' + err.message.trim())
      return
    }

    done()
  })
}

/**
 * 生成项目 or 组件结构
 *
 * @param {string} dir 渲染模板的目录
 * @param {string} compName 组件名称，仅用于只渲染组件的情况，渲染整个项目不传即可
 * @param {Function} done 回调函数
 */
export async function generate (dir: string, compName: string, isVue: boolean | Function, done: Function) {
  if (typeof isVue === 'function') {
    done = isVue
    isVue = false
  }

  let tmp = isVue ? VUE_TEMPLATE_TMP : TEMPLATE_TMP
  const metalsmith = ms(path.join(tmp, dir))
  const templatePrompts = getMeta(tmp).prompts

  function ask (templatePrompts: any): Plugin {
    return (files: Files, metalsmith: ms, done: Function) => {
      // 替换 components 目录组件名称
      (metalsmith.metadata() as any).compName = compName || 'mip-example'

      // 只渲染组件部分时(mip2 add)，不需要走 ask 流程，且使用 component name 作为 dest 路径
      if (compName) {
        metalsmith.destination(path.resolve('./components', compName))
        // 读取项目名称，用于渲染 README.md 的脚本地址
        let siteName = process.cwd().split(path.sep).pop();
        (metalsmith.metadata() as any).name = siteName
        done()
        return
      }

      function run (key: string, done: (reason?: any) => void) {
        let prompt = templatePrompts[key]

        inquirer.prompt([{
          'type': prompt.type,
          'name': key,
          'message': prompt.message || prompt.label || key,
          'default': prompt.default,
          'validate': prompt.validate || (() => true)
        }]).then((answers: any) => {
          if (typeof answers[key] === 'string') {
            (metalsmith.metadata() as any)[key] = answers[key].replace(/"/g, '\\"')
          } else {
            (metalsmith.metadata() as any)[key] = answers[key]
          }
          done()
        }).catch(done)
      }

      async.eachSeries(Object.keys(templatePrompts), run, () => {
        // After all inquirer finished, set destination directory with input project name
        metalsmith.destination(path.resolve('./', (metalsmith.metadata() as any).name))
        done()
      })
    }
  }

  function renderTemplateFiles (): Plugin {
    return (files: Files, metalsmith: ms, done: Callback) => {
      let keys = Object.keys(files)
      function run (file: string, done: (err?: Error | null | undefined) => void) {
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
      async.each(keys, run, done as ErrorCallback<Error>)
    }
  }

  metalsmith
    .use(ask(templatePrompts))
    .use(renderTemplateFiles())
    .clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .build((err: Error | null) => {
      done(err)
    })
}
