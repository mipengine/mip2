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
```

构建组件，在项目根目录运行

``` bash
$ mip2 build
```

## changelog

- 1.0.11
    1. 支持组件通过 `import()` 和 `require.ensure` 异步加载模块
    2. dev 模式自动对组件 script 注入 md5
