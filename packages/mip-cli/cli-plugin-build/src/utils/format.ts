/**
 * @file format.js
 * @author clark-t (clarktanglei@163.com)
 */
import { BuilderOptions } from '../types/options'
import path from 'path'

const CWD = process.cwd()

export function format (options: Record<string, any>) {
  let formated: BuilderOptions = {
    context: path.resolve(CWD, options.dir),
    outputPath: path.resolve(CWD, options.output || 'dist'),
    publicPath: options.asset || '/',
    env: options.env || 'production',
    cleanDist: options.clean,
    ignoreWhitelistCheck: options.ignore
  }

  return formated
}

