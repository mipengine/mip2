<p align='center'>
    <a href="https://www.mipengine.org/">
        <img width="150" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" title='MIP' alt='MIP'>
    </a>
</p>
<p align='center'>
    <a href='https://travis-ci.org/mipengine/mip2'>
        <img src='https://travis-ci.org/mipengine/mip2.svg?branch=master' title='Build Status' alt='Build Status'>
    </a>
    <a href='https://coveralls.io/github/mipengine/mip2'>
        <img src='https://coveralls.io/repos/github/mipengine/mip2/badge.svg?branch=master' title='Coverage Status' alt='Coverage Status' />
    </a>
    <a href='https://opensource.org/licenses/MIT'>
        <img src='https://img.shields.io/github/license/mipengine/mip2.svg'  title='license' alt='license'>
    </a>
</p>

# MIP 2

这个项目包含 mip 核心、mip-cli、mip-validator、mip-sandbox 代码，位于 packages 目录下

## 代码规范

- 使用 ES6 和 ES Module 编写组件
- 全部代码需要通过 eslint 审核才能提交，遵循社区 standard 规范
- 不到万不得已，不许使用 eslint-disable
- Vue 的 template 部分需要遵守 Vue 的编码规范

使用 [eslint](https://eslint.org/) 代码规范检查工具，使用 JavaScript Standard Style [[CN](https://standardjs.com/rules-zhcn.html)/[EN](https://standardjs.com/rules-en.html)] 代码规范。

```sh
# 检查所有文件
$ npm run lint

# or 检查单独文件
$ npx eslint filename.js
```

> **注意**: 这里 `eslint-config-standard` 作为 eslint 的规范配置引入, 在 `.eslintrc.json` 的 extends 配置项中使用，不需要安装 standard 工具，编辑器也不需要安装 standard 插件，只需要安装 eslint 的代码检查插件即可。
