/**
 * @file js process middleware
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('../../builder')

module.exports = function (config) {
  let builder = new Builder({
    dir: config.dir,
    dev: true,
    asset: config.asset,
    ignore: config.ignore
  })

  return [
    async function (ctx, next) {
      await builder.dev(ctx, next)
    }
  ]
}
