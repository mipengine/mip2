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

集成到 cli 工具中的校验分为三种：

- 组件校验
- 页面校验
- npm 白名单校验

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

## 常用插件

本地启动 SF 调试环境

``` bash
$ mip2 sf
```

运行命令后，会在本地启动一个服务器，可以通过 `http://localhost:8210/sf` 进行访问，对页面嵌入 SF 的情况进行调试和验证。

详情可以查看插件项目仓库 [mip-cli-plugin-sf](https://github.com/mipengine/mip-cli-plugin-sf)
