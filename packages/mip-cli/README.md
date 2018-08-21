# mip2 CLI [![npm package](https://img.shields.io/npm/v/mip2.svg)](https://www.npmjs.com/package/mip2) ![node](https://img.shields.io/node/v/mip2.svg)


Command Line Interface for MIP 2.0.

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=8.x), npm version 3+ and [Git](https://git-scm.com/).

``` bash
$ npm install -g mip2
```

## Usage

创建项目

``` bash
$ mip2 init
```

新增一个组件

在项目根目录运行 `mip2 add` 命令，即可快速添加一个新组件

```bash
# 快速添加名为 mip-new 的组件
$ mip2 add mip-new

# 使用 -f 或 --force 参数强制覆盖同名组件
$ mip2 add mip-new -f
```

启动调试服务器，在项目根目录运行

``` bash
$ mip2 dev
```

Example:

``` bash
# 可使用 ——port 指定端口
$ mip2 dev --port 8888
```

组件和页面校验

``` bash
$ mip2 validate
```

Example:

``` bash
# 组件校验
$ mip2 validate components
$ mip2 validate -c components

# 页面校验
$ mip2 validate -p page.html

# npm 白名单校验
$ mip2 validate -w path-to-project
```

构建组件，在项目根目录运行

``` bash
$ mip2 build
```

生成 Service Worker

mip2 CLI 提供了 `sw` 命令，帮助开发者更简单快速地生成 Service Worker，支持离线可用等特性。

``` bash
# 在项目根目录运行
$ mip2 sw
```

默认情况下，将导出 Service Worker 文件到 `dist/sw.js`，并对静态资源(如 js,css)及 html 文档进行缓存，实现页面的离线可用。

`mip2 sw` 命令提供了选项：

``` javascript
-o, --output // 指定 sw 导出路径，如 mip2 -o output/service-worker.js
-c, --config // 指定配置文件路径，默认使用项目根目录 mip.config.js
```

除此之外，我们可以在 `mip.config.js` 中增加 `serviceWorker` 配置项，对 Service Worker 进行进一步的配置，如预缓存列表、动态缓存策略、`skipWaiting`、`clientsClaim` 等。

``` javascript
module.exports = {
  dev: {/*...*/},
  serviceWorker: {
    cacheId: 'mipuser',
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [],
    globPatterns: [],
    globIgnores: []
  }
}
```

更多的配置选项可以参考 [Workbox 配置项](https://developers.google.com/web/tools/workbox/modules/workbox-build#generateswstring_mode)

## changelog
- 1.2.3
    1. 组件的 README.md 支持自动生成组件脚本地址
- 1.2.2
    1. cli 沙盒注入提示信息增加对应文件提示以及白名单申请引导
    2. 修复 1.2.1 dev/build 模式下默认命令行参数失效的 bug
    3. 修复 dev 模式下 -d 参数不能传相对路径的 bug
    4. 升级 mip-sandbox，添加 `CustomEvent` 依赖
    5. 增加 mip2 dev/build -i all 的参数简写

- 1.2.1
    1. cli dev 和 build 命令增加 proxy 配置，支持对组件代码中字符串部分做替换以模拟实现开发和测试时的请求转发功能；
    2. mip2 build 增加 -e/--env 指定当前编译的环境变量 process.env.NODE_ENV

- 1.2.0
    1. 升级 validator 依赖 mip-component-validator 至 1.1.0，该版本全流程改为异步实现
    2. dev 和 build 命令强制进行 npm 白名单校验，出现非白名单的 npm 包，会在控制台将包名打印出来
    3. validate 命令增加 -w 参数校验 npm 白名单
    4. validate -c 命令增加组件所在白名单校验

- 1.1.10
    1. 升级 mip-sandbox 依赖，添加 `crypto` 入白名单
    2. 将 helpers 改回直接从 window 获取

- 1.1.9
    1. 升级 mip-sandbox 依赖，添加 `WebSocket` 入白名单

- 1.1.8
    1. 升级 mip-sandbox 依赖，添加 `mipDataPromises` 入白名单

- 1.1.6
    1. mip2 dev 模式将 --autoopen 的简写改为 -o，新增 --asset 参数指定 public path，简写为 -a 与 build 保持一致。-a 默认为 '/'

- 1.1.5
    1. 支持 process.env.NODE_ENV， mip2 dev 的值为 'development'，mip2 build 的值为 'production'

- 1.1.4
    1. mip2 build 产生的组件公用 js 直接指向线上
    2. mip.config.js 新增 `build` 配置项

- 1.1.2
    1. 调整组件公用部分的引入机制

- 1.0.13
    1. 支持组件通过 `import()` 和 `require.ensure` 异步加载模块
    2. dev 模式自动对组件 script 注入 md5

