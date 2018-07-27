/**
 * @file walker.js
 * @desc 文件工具
 * @author liwenqian
 */

const fs = require('fs-extra')
const path = require('path')
const minimatch = require('minimatch')

function isIgnore (pathname, ignore) {
  if (!ignore) {
    return false
  }

  if (Array.isArray(ignore)) {
    return ignore.some(ig => isIgnore(pathname, ig))
  }

  if (typeof ignore === 'string') {
    return minimatch(pathname, ignore)
  }

  return ignore.test(pathname)
}

async function walk (dirPath, callback, opts) {
  if (isIgnore(dirPath, opts && opts.ignore)) {
    return
  }

  let stats = await fs.stat(dirPath)
  if (!stats.isDirectory()) {
    await callback(dirPath)
    return
  }

  let dir = await fs.readdir(dirPath)
  await Promise.all(
    dir.map(async file => {
      const pathname = path.join(dirPath, file)
      if (isIgnore(pathname, opts && opts.ignore)) {
        return
      }

      const stats = await fs.stat(pathname)

      if (stats.isDirectory()) {
        await walk(pathname, callback, opts)
      } else {
        await callback(pathname)
      }
    })
  )
}

module.exports = {
  walk: walk,
  isIgnore: isIgnore
}
