/**
 * @file 安装 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import { installOrUpdatePlugin } from './utils/plugin'

interface Option {
  registry: string;
}

export function install (names: string[], options: Option) {
  const { registry } = options
  installOrUpdatePlugin('install', names, registry)
}
