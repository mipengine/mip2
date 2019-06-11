/**
 * @file mip2-plugin-build
 * @author clark-t (clarktanglei@163.com)
 */

import { Plugin } from 'mip-cli-utils'

const plugin: Plugin = {
  name: 'build',
  description: '组件编译插件',
  options: [
    {
      name: 'asset',
      shortName: 'a',
      description: '静态资源 publicPath'
    },
    {
      name: 'dir',
      shortName: 'd',
      description: '项目文件夹路径'
    }
  ],
  run (params) {
    console.log(params)
  }
}

export default plugin
// const plugin:any = {
//   command: {
//     description: '组件编译插件',
//     options: [
//       {
//         flags: '-a, --asset <value>',
//         description: '静态资源 publicPath'
//       },
//       {
//         flags: '-d, --dir <value>',
//         description: '项目文件夹路径'
//       },
//       {
//         flags: '-o, --output <value>',
//         description: '编译代码输出路径'
//       },
//       {
//         flags: '-c, --clean',
//         description: '构建前先清空输出目录'
//       },
//       {
//         flags: '--ignore [value]',
//         description: '忽略沙盒注入或校验，可选参数为 -i sandbox, -i whitelist, -i sandbox,whitelist; -i 默认为 -i sandbox, -i all 默认为 -i sandbox,whitelist'
//       },
//       {
//         flags: 'e, --env <value>',
//         description: 'NODE_ENV 环境变量，默认为 "production"',
//         defaultValue: 'production'
//       }
//     ]
//   },
//   run (options:any) {
//     console.log(JSON.stringify(options))
//   }
// }

// export default plugin

