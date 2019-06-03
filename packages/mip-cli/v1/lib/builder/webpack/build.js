/**
 * @file webpack builder
 * @author clark-t (clarktanglei@163.com)
 */

const webpack = require('webpack')
const {pify} = require('../../utils/helper')
const WebpackBaseBuilder = require('./base')

module.exports = class WebpackBuilder extends WebpackBaseBuilder {
  async build () {
    await this.initConfig()
    let result = await pify(webpack)(this.config)

    if (result.hasErrors()) {
      throw Error(result.compilation.errors)
    }

    return result
  }
}
