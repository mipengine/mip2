/**
 * @file walker.js
 * @desc 文件工具
 * @author liwenqian
 */

const fs = require('fs-extra')
const path = require('path')

async function walk (dirPath, callback) {
  let stats = await fs.stat(dirPath)
  if (!stats.isDirectory()) {
    return await callback(dirPath)
  }

  let dir = await fs.readdir(dirPath)
  await Promise.all(
    dir.map(async file => {
      const pathname = path.join(dirPath, file)
      const stats = await fs.stat(pathname)

      if (stats.isDirectory()) {
        await walk(pathname, callback)
      } else {
        await callback(pathname)
      }
    })
  )
}

module.exports = {
  walk: walk
}
