/**
 * @file walker.js
 * @desc 文件工具
 * @author liwenqian
 */

const fs = require('fs')
const path = require('path')

module.exports = {
  walk (dirPath, callback) {
    fs.readdirSync(dirPath).forEach(file => {
      const pathname = path.join(dirPath, file)
      const stats = fs.statSync(pathname)

      if (stats.isDirectory()) {
        this.walk(pathname, callback)
      } else {
        callback(pathname)
      }
    })
  }
}
