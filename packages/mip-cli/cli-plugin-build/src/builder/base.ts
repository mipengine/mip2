/**
 * @file base.ts
 * @author clark-t (clarktanglei@163.com)
 */

import path from 'path'

class WebpackBaseBuilder {
  options: any;
  outputDir: string;
  packageJsonPathname: string;
  componentDir: string;
  dir: string;

  constructor (options: any) {
    this.options = options
    Object.assign(this, options)
    this.outputDir = options.output || path.resolve('dist')
    this.packageJsonPathname = path.resolve(this.dir, 'package.json')
    this.componentDir = projectPath.components(this.dir)
  }

  async getEntries () {
    let globOpts = {
      cwd: this.componentDir,
      root: this.componentDir
    }

    let components = await globPify('mip-*/mip-*.@(vue|js)', globOpts)
      .then(arr => arr.filter(name => /(mip-[\w-]+\/\1\.(vue|js)$/.test(name)))

    if (!components.length) {
      cli.error(`在该路径下找不到 mip 组件入口文件，请检查路径是否规范：\n${this.componentDir}`)
      process.ext(1)
    }
  }

  async initConfig () {

  }


}
