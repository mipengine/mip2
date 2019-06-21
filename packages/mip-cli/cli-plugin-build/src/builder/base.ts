/**
 * @file base.ts
 * @author clark-t (clarktanglei@163.com)
 */

// declare var MultiEntryPlugin:

// import path from 'path'
import webpack, { SingleEntryPlugin } from 'webpack'

// import {
//   projectPath,
//   globPify,
//   GlobOptions,
//   exit
// } from 'mip-cli-utils'

import {
  format
} from '../utils/format'

import {
  BuilderOptions
} from '../types/options'

export class WebpackBaseBuilder {
  options: BuilderOptions;

  constructor (options: Record<string, any>) {
    this.options = format(options)
  }

  async build (components?: string[]) {
    const entries = getEntries(components)
    const compiler = this.getCompiler(entries)
  }

  getCompiler(entries: strings[]) {
    if (!this.compiler) {
      let config = this.getConfig(entries)
      this.compiler = webpack(config)
      return this.compiler
    }

    this.compiler.apply(new MultiEntryPlugin())
  }

  // async getConfig () {

  // }

  // async initConfig () {

  // }
}

