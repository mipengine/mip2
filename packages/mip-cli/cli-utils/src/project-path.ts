/**
 * @file project-path.ts
 * @author clark-t (clarktanglei@163.com)
 */

import path from 'path'

function componentsDir (dir: string) {
  return path.resolve(dir, 'components')
}

function testDir (dir: string) {
  return path.resolve(dir, 'example')
}

function componentTestDir (dir: string, componentname: string) {
  return path.resolve(dir, componentname, 'example')
}

function isComponentPath (rootDir: string, pathname: string) {
  // 非入口文件的增减则不做任何处理
  if (!/(mip-[\w-]+)\/\1\.(vue|js)$/.test(pathname)) {
    return false
  }

  let basename = path.basename(pathname)

  return path.resolve(
    componentsDir(rootDir),
    path.basename(basename, path.extname(basename)),
    basename
  ) === path.resolve(pathname)
}

export default {
  components: componentsDir,
  componentTestDir: componentTestDir,
  test: testDir,
  isComponentPath: isComponentPath
}

