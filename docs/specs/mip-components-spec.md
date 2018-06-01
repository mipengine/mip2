# MIP 2.0 组件开发规范

在本文档中，使用的关键字会以英文表示：`"MUST"`, `"MUST NOT"`, `"REQUIRED"`, `"SHALL"`, `"SHALL NOT"`, `"SHOULD"`, `"SHOULD NOT"`, `"RECOMMENDED"`, `"MAY"`, 和 `"OPTIONAL"`被定义在 rfc2119 中。

## 代码结构规范

- [MUST] 所有组件目录必须是组件名称
- [MUST] 目录名称（组件名称）必须是 `mip-` 为前缀的全小写字符串
- [MUST] 所有组件必须是 `.vue` 后缀的 [单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html) 形式
- [MUST] 必须包含说明组件用途的 `mip-xxx.md` 文件

示例：

```bash
mip-example
  ├── mip-example.md
  ├── mip-example.vue
```

## 代码风格规范

- [MUST] 组件的脚本开发必须遵守 [JavaScript Standard Style](https://standardjs.com/readme-zhcn.html)
- [MUST] 组件的模版开发应该遵循 [Vue Style Guide](https://cn.vuejs.org/v2/style-guide/index.html)

开发过程中可以通过 [ESLint](https://eslint.org/) 工具检查，在组件校验和审核环节要求所有代码必须通过 ESLint。

## CSS 规范

- [MUST] 组件所有样式必须 scoped
- [MUST NOT] 组件样式禁止使用 `position: fixed`
- [SHOULD] 组件样式选择器应该使用 `mip-组件名`，尽量避免对使用方页面产生影响。

## JavaScript 规范

- [SHOULD] 使用 ES6 和 ES Module 模块化组织代码
- [MUST] 仅允许引入白名单（TODO: 白名单列表）中的第三方 javaScript
 
