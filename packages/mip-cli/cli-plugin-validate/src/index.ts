import { Plugin, Params } from 'mip-cli-utils'
import validate from './validate'

const plugin: Plugin = {
  name: 'validate',
  description: '校验组件或页面',
  args: [
    {
      name: 'filePath',
      optional: false
    }
  ],
  options: [
    {
      name: 'component',
      shortName: 'c',
      optional: true,
      description: '校验 mip 组件'
    },
    {
      name: 'page',
      shortName: 'p',
      optional: true,
      description: '校验 mip 页面'
    },
    {
      name: 'whitelist',
      shortName: 'w',
      optional: true,
      description: '校验 npm 白名单'
    }
  ],
  run (params: Params) {
    validate(params)
  }
}

export default plugin
