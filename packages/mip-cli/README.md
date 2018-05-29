# mip2 CLI [![npm package](https://img.shields.io/npm/v/mip2.svg)](https://www.npmjs.com/package/mip2) ![node](https://img.shields.io/node/v/mip2.svg)


Command Line Interface for MIP 2.0.

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=8.x), npm version 3+ and [Git](https://git-scm.com/).

``` bash
$ npm install -g mip2
```

### Usage

创建项目

``` bash
$ mip2 init
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

