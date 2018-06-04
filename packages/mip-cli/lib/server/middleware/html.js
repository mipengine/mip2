/**
 * @file html middleware
 * @author clark-t (clarktanglei@163.com)
 */

const fs = require('fs-extra')
const path = require('path')
/* eslint-disable */
const {resolvePath} = require('../../utils/helper');
/* eslint-enable */

module.exports = function (config) {
  return [
    async (ctx, next) => {
      let id = ctx.params.id

      if (!id) {
        let ext = path.extname(ctx.params.id)
        if (!ext) {
          id += '.html'
        }
      }

      let pagePath

      let ext = path.extname(ctx.params.id)
      if (ext) {
        pagePath = path.resolve(config.dir, id)
      } else {
        pagePath = await resolvePath([
          path.resolve(config.dir, id + '.html'),
          path.resolve(config.dir, id, 'index.html')
        ])
      }

      try {
        let html = await fs.readFile(pagePath, 'utf-8')

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

function injectLivereload (content) {
  /* eslint-disable */
    return content
        + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
}
