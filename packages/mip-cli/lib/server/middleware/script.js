/**
 * @file js process middleware
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('../../builder')

module.exports = function (options) {
  let builder = new Builder(options)

  options.app.builder = builder

  return [
    async function (ctx, next) {
      await builder.dev(ctx, next)
    }
  ]
}
