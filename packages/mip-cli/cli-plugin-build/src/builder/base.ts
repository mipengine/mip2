/**
 * @file base.ts
 * @author clark-t (clarktanglei@163.com)
 */

import path from 'path'

import {
  projectPath,
  globPify,
  GlobOptions,
  exit
} from 'mip-cli-utils'

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

  async build (components?: ) {

  }

  async getConfig () {

  }

  async initConfig () {

  }
}

