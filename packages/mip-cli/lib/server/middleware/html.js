/**
 * @file html middleware
 * @author clark-t (clarktanglei@163.com)
 */

const fs = require('fs-extra')
const path = require('path')
/* eslint-disable */
const {resolvePath} = require('../../utils/helper');
const {getFilenameFromUrl} = require('webpack-dev-middleware/lib/util')
/* eslint-enable */
const crypto = require('crypto')

module.exports = async function (config) {
  return [
    async (ctx, next) => {
      let pagePath = path.resolve(config.dir, ctx.params.id)

      try {
        let html = await fs.readFile(pagePath, 'utf-8')

        html = injectScriptMd5(html, ctx.app.builder.compiler, ctx.app.builder.midd.dev.fileSystem)

        // 注入 livereload 脚本
        if (config.livereload) {
          html = injectLivereload(html)
        }

        ctx.body = html
      } catch (e) {
        ctx.throw(404, 'no such file in: ' + pagePath)
      }
    }
  ]
}

function injectScriptMd5 (html, compiler, fs) {
  return html.replace(
    /<script([\s\S]*?)\ssrc="\/(mip-[\w-]+)\/\2\.js"([\s\S]*?)>\s*<\/\s*script>/g,
    (str, prefix, name, extfix) => {
      try {
        let filename = getFilenameFromUrl('/', compiler, `/${name}/${name}.js`)
        let file = fs.readFileSync(filename)
        let md5 = crypto.createHash('md5').update(file).digest('hex')
        return `<script${prefix} src="/${name}/${name}.js?v=${md5}"${extfix}></script>`
      } catch (e) {
        return str
      }
    }
  )
}

function injectLivereload (content) {
  /* eslint-disable */
    return content
        + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
}
