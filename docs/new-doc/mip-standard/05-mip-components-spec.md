# MIP 2.0 组件开发规范

在本文档中，使用的关键字会以英文表示：`"MUST"`, `"MUST NOT"`, `"REQUIRED"`, `"SHALL"`, `"SHALL NOT"`, `"SHOULD"`, `"SHOULD NOT"`, `"RECOMMENDED"`, `"MAY"`, 和 `"OPTIONAL"`被定义在 rfc2119 中。

## 源文件仓库

MIP 扩展组件的中央仓库是 https://github.com/mipengine/mip2-extensions 。中央仓库 master 分支下的代码永远是稳定的。根目录下，每个 mip- 前缀的目录为一个扩展组件。

## 开发方式

MIP 扩展组件开发采用 [Forking工作流](https://github.com/oldratlee/translations/blob/master/git-workflows-and-tutorials/workflow-forking.md) 的方式。

  - 开发者需要 fork MIP 扩展组件仓库
  - 开发者在自己的仓库下开发
  - 开发完成后通过 pull request 提交修改，由 MIP 开发小组审核与合并
  - 不允许在主仓库 https://github.com/mipengine/mip2-extensions 下开发。


## 审核标准

  - <a href="#1">结构规范</a>
  - <a href="#2">JavaScript 规范</a>
  - <a href="#3">CSS 规范</a>

<a name="1"></a>
### 结构规范

- [MUST] 所有组件目录必须是组件名称
- [MUST] 目录名称（组件名称）必须是 `mip-` 为前缀的全小写字符串
- [MUST] 所有组件必须是 `.vue` 后缀的 [单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html) 形式
- [MUST] 必须包含说明组件用途的 `mip-xxx.md` 文件，具体规范可参照自动生成的 `README.md` 模板文件结构进行填充。

示例：

```bash
mip-example
  ├── mip-example.md
  ├── mip-example.vue
```

<a name="2"></a>
### JavaScript 规范

- [MUST] 组件的脚本开发必须遵守 JavaScript Standard Style [[CN](https://standardjs.com/rules-zhcn.html)/[EN](https://standardjs.com/rules-en.html)] 代码规范
- [MUST] 组件的模版开发应该遵循 [Vue Style Guide](https://cn.vuejs.org/v2/style-guide/index.html)
- [SHOULD] 使用 ES6 和 ES Module 模块化组织代码
- [MUST] 仅允许引入白名单（TODO: 白名单列表）中的第三方 javaScript

开发过程中可以通过 [ESLint](https://eslint.org/) 工具检查，在组件校验和审核环节要求所有代码必须通过 ESLint，一般不允许使用 `eslint-disable` 来豁免检测。


<a name="3"></a>
### CSS 规范

- [MUST] 组件的样式必须遵循 Stylelint 中 [`stylelint-config-standard`](https://github.com/stylelint/stylelint-config-standard) 中包含的规范，且必须通过 Stylelint 工具审核之后才能提交。
- [MUST] 组件所有样式必须 scoped
- [MUST NOT] 组件样式禁止使用 `position: fixed`
- [MUST] 所有样式文件必须使用 UTF-8 编码
- [MUST] 选择器的第一层如果是标签选择器，只允许使用组件自身标签，组件的样式定义应只对组件本身以及组件内部生效。

```css
/* good */
mip-sample span {
  color: red;
}

/* bad */
span {
  color: red;
}
```

- [SHOULD] 组件样式选择器应该使用 `mip-组件名` 或以组件名为前缀，尽量避免对使用方页面产生冲突影响。

```css
/* good */
.mip-sample-title {
  color: red;
}

/* bad */
.title {
  color: red;
}
```

- [SHOULD NOT] 不允许使用 ID 选择器：组件的设计，需要考虑一个页面上同时存在多个组件的场景。所以组件及内部元素都不应该拥有 hard code 的 ID 属性。



