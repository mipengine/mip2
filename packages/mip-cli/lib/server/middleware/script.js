/**
 * @file js process middleware
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('../../builder/webpack/dev')

module.exports = async function (options) {
  let builder = new Builder(options)

  options.app.builder = builder
  await builder.loaded

  return [
    builder.dev.bind(builder)
  ]
}
