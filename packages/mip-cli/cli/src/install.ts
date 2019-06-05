/**
 * @file 安装 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import { installPlugin } from './utils/installPlugin'

interface Option {
  registry: string;
}

export function add (name: string, options: Option) {
  const { registry } = options
  installPlugin('npm', name, registry)
}
