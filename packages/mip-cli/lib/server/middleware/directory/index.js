const fs = require('fs-extra')
const path = require('path')
const etpl = require('etpl')

module.exports = async function (config) {
  const engine = new etpl.Engine({
    commandOpen: '{%',
    commandClose: '%}',
    variableOpen: '{{',
    variableClose: '}}'
  })
  const template = await fs.readFile(path.join(__dirname, 'dir-template.etpl'), 'utf8')
  const renderer = engine.compile(template)

  return [
    async (ctx, next) => {
      let pagePath = path.join(config.dir, ctx.url)
      let stat = await fs.stat(pagePath)
      if (stat.isDirectory()) {
        let content = await dir(ctx.url, pagePath, renderer)
        ctx.body = content
      } else {
        await next()
      }
    }
  ]
}

async function dir (url, reqPath, renderer) {
  let {fileList, dirList, canAccess} = await walk(reqPath)
  url = url.endsWith('/') ? url : url + '/'
  let urlArr = []
  if (url !== '/') {
    urlArr = url.slice(1, -1).split('/')
  }
  let data = {
    canAccess: canAccess,
    fileList: fileList,
    dirList: dirList,
    urlArr: urlArr,
    url: url
  }
  return renderer(data)
}

async function walk (reqPath) {
  let items = await fs.readdir(reqPath)
  let pathArr = reqPath.split(path.sep)
  let canAccess = false
  // 仅可访问example和mock目录及子目录下的文件
  if (pathArr.indexOf('example') !== -1 || pathArr.indexOf('mock') !== -1) {
    canAccess = true
  }

  let dirList = []
  let fileList = []
  for (let item of items) {
    if (item === 'node_modules' || item[0] === '.') {
      continue
    }
    let stats = await fs.stat(path.join(reqPath, item))
    if (stats.isDirectory()) {
      dirList.push(item)
    }
    if (stats.isFile()) {
      fileList.push(item)
    }
  }
  return {
    fileList: fileList,
    dirList: dirList,
    canAccess: canAccess
  }
}
