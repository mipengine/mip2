/**
 * @file utils.js
 * @desc 常用工具
 * @author liwenqian
 */

const compiler = require('vue-template-compiler')
const glob = require('glob')

function pify (fn) {
  return (...args) => new Promise((resolve, reject) => {
    let callback = (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    }

    fn(...args, callback)
  })
}

function globPify (...args) {
  return pify(glob)(...args)
}

module.exports = {
  parseComponent (content) {
    return compiler.parseComponent(content, {pad: 'line'})
  },
  globPify: globPify,
  pify: pify
}
