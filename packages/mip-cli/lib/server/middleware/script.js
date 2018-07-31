/**
 * @file js process middleware
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('../../builder')

module.exports = function ({dir, asset, ignore, proxy, app}) {
  let builder = new Builder({
    dir: dir,
    dev: true,
    asset: asset,
    ignore: ignore,
    proxy: proxy
  })

  app.builder = builder

  return [
    async function (ctx, next) {
      await builder.dev(ctx, next)
    }
  ]
}
