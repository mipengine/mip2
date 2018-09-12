/**
 * @file whitelist.js
 * @author clark-t (clarktanglei@163.com)
 * @description whitelist validate
 */

const path = require('path')
const fs = require('fs-extra')
const {globPify} = require('../utils')
const fetch = require('node-fetch')

async function searchPackageJSON (pathname) {
  let stats = await fs.stat(pathname)

  if (!stats.isDirectory()) {
    if (!/package\.json$/.test(pathname)) {
      return
    }

    if (await fs.exists(pathname)) {
      return pathname
    }
  }

  // 找当前层级下的 package.json
  let currPackagePath = path.resolve(pathname, 'package.json')
  if (await fs.exists(currPackagePath)) {
    return currPackagePath
  }

  // 找子层级下的 package.json
  let childrenPackagePath = await globPify('!(node_modules)/package.json', {
    cwd: pathname,
    root: pathname
  })

  if (childrenPackagePath.length) {
    return childrenPackagePath.map(p => path.resolve(pathname, p))
  }

  // let parentPath = pathname
  // // 找父层级下的 package.json，最多往上找 3 层
  // for (let i = 0; i < 3; i++) {
  //   parentPath = path.resolve(parentPath, '..')
  //   let packagePath = path.resolve(parentPath, 'package.json')
  //   if (await fs.exists(packagePath)) {
  //     return packagePath
  //   }
  // }
}

let whitelist

function getWhitelist () {
  if (whitelist) {
    return Promise.resolve(whitelist)
  }

  const url = 'http://bos.nj.bpc.baidu.com/assets/mip-cli/whitelist.txt'
  const local = path.resolve(__dirname, 'lib/whitelist.txt')

  return fetch(url)
    .then(response => response.text())
    .then(async txt => {
      await fs.writeFile(local, txt, {encodeing: 'utf8'})
      return txt
    })
    .catch(() => fs.readFile(local, 'utf-8'))
    .then(txt => txt.split(/\s+/).filter(txt => !/^\s*$/.test(txt)))
    .then(list => {
      whitelist = list
      return whitelist
    })
}

function getDependenciesFromFile (pathname) {
  return fs.readFile(pathname, 'utf-8')
    .then(getDependencies)
    .catch(e => {
      console.warn(pathname, '读取 package.json 失败')
      console.warn(e)
      return []
    })
}

function getDependencies (file) {
  let json = JSON.parse(file)

  if (json.dependencies) {
    return Object.keys(json.dependencies)
  }

  return []
}

function compare (dependencies, whitelist) {
  let illegal = []

  for (let i = 0; i < dependencies.length; i++) {
    if (whitelist.indexOf(dependencies[i]) === -1) {
      illegal.push(dependencies[i])
    }
  }

  return illegal
}

async function getAllDependencies (pathname) {
  let result = await searchPackageJSON(pathname)
  if (!result) {
    return []
  }

  if (typeof result === 'string') {
    return getDependenciesFromFile(result)
  }

  return Promise.all(result.map(getDependenciesFromFile)).then(list => [].concat(...list))
}

function getErrorInfo (result) {
  return [
    '',
    '以下 npm 包不在白名单范围内，请到项目 package.json 中移除相关 dependencies，并修改代码移除相关依赖。或者前往地址申请白名单：',
    'https://github.com/mipengine/mip2/issues/new?template=npm_whiltelist_request.md',
    '',
    '非白名单 npm 列表：'
  ]
    .concat(result)
    .concat([
      '',
      ''
    ])
    .join('\n')
}

module.exports = {
  name: 'component-npm-whitelist',
  async exec (file, reporter) {
    if (!/package\.json$/.test(file.path)) {
      return
    }

    let dependencies = getDependencies(file.content)

    let whitelist = await getWhitelist()
    let result = compare(dependencies, whitelist)
    if (result.length) {
      let info = getErrorInfo(result)
      reporter.error(file.path, info)
    }
  },

  // 暴露给 validator 单独做 whitelist 的校验
  validate (dir = process.cwd(), reporter) {
    return Promise.all([
      getAllDependencies(dir),
      getWhitelist()
    ])
      .then(([dependencies, whitelist]) => compare(dependencies, whitelist))
      .then(result => {
        if (result.length) {
          let info = getErrorInfo(result)
          reporter.error(dir, info)
        }
      })
  }
}
