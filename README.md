# MIP 2

这个项目包含 mip 核心代码和 mip-cli 的代码，位于 packages 目录下

## JavaScript 代码规范

使用 [eslint](https://eslint.org/) 代码规范检查工具，使用 JavaScript Standard Style [[CN](https://standardjs.com/rules-zhcn.html)/[EN](https://standardjs.com/rules-en.html)] 代码规范。

```sh
# 在项目下运行检查所有文件
$ npm run lint

# or 检查单独文件
$ npx eslint filename.js
```

> **注意**: 这里 `eslint-config-standard` 作为 eslint 的规范配置引入, 在 `.eslintrc.json` 的 extends 配置项中使用，不需要安装 standard 工具，编辑器也不需要安装 standard 插件，只需要安装 eslint 的代码检查插件即可。

