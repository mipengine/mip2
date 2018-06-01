/**
 * @file utils.js
 * @desc 常用工具
 * @author liwenqian
 */

const compiler = require('vue-template-compiler')
module.exports = {
  parseComponent (content) {
    return compiler.parseComponent(content, {pad: 'line'})
  }
}
