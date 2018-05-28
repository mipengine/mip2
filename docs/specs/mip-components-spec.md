# MIP 2.0 组件开发规范

在本文档中，使用的关键字会以英文表示：`"MUST"`, `"MUST NOT"`, `"REQUIRED"`, `"SHALL"`, `"SHALL NOT"`, `"SHOULD"`, `"SHOULD NOT"`, `"RECOMMENDED"`, `"MAY"`, 和 `"OPTIONAL"`被定义在 rfc2119 中。

## 代码结构规范

- [MUST] 所有组件目录必须是组件名称
- [MUST] 目录名称（组件名称）必须是 `mip-` 为前缀的全小写字符串
- [MUST] 所有组件必须是 `.vue` 后缀的 [单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html) 形式
- [MUST] 必须包含说明组件用途的 `README.md` 文件

示例：

```bash
mip-example
  ├── mip-example.md
  ├── mip-example.vue
```

## 代码风格规范

- [MUST] 组件的脚本开发必须遵守 [JavaScript Style Guide](https://github.com/ecomfe/spec/blob/master/javascript-style-guide.md)
- [MUST] 组件的样式开发必须遵守 [CSS Style Guide](https://github.com/ecomfe/spec/blob/master/css-style-guide.md)。如果你使用了 [LESS](http://lesscss.org/) ，还 必须遵守 [LESS Code Style](https://github.com/ecomfe/spec/blob/master/less-code-style.md)。
- [SHOULD] 组件开发应该遵循 [Vue Style Guide](https://cn.vuejs.org/v2/style-guide/index.html)

开发过程中可以通过 [FECS](http://fecs.baidu.com/) 工具检查，在组件校验和审核环节要求所有代码必须通过 FECS。

## CSS 规范

- [MUST] 组件所有样式必须 scoped
- [MUST NOT] 组件样式禁止使用 `position: fixed`
- [SHOULD] 组件样式选择器应该使用 `mip-组件名`，尽量避免对使用方页面产生影响。

## JavaScript 规范

- [MUST] 仅允许引入白名单（TODO: 白名单列表）中的第三方 javaScript

## template 规范

- [MUST] 沿用 1.0 页面元素使用规范，但不包括 `<style>` `<script>` `<link>` 等标签限制

|标签|使用范围|备注|
|--|--|--|
|`<img>`    |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-img>`|
|`<video>`  |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-video>`|
|`<audio>`  |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-audio>`|
|`<iframe>` |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-iframe>`|
|`<form>`   |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-form>`|
|`<frame>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<frameset>`|<span class="mipengine-doc-red">禁止使用 </span>||
|`<object>` |<span class="mipengine-doc-red">禁止使用</span>||
|`<param>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<applet>` |<span class="mipengine-doc-red">禁止使用</span>||
|`<embed>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<svg>`    |<span class="mipengine-doc-green">允许使用</span>||
|`<button>` |<span class="mipengine-doc-green">允许使用</span>||
|`<a>`      |<span class="mipengine-doc-green">允许使用</span> | <ul><li>`href` 属性必填，同时其值不可以 `href="javascript:"`</li><li>MIP 页之间跳转推荐使用 [`<a data-type="mip">`](/examples/mip-extensions/mip-link.html)</li></ul>|
|`<source>`|<span class="mipengine-doc-green">允许使用</span>|其父元素必须是 `<mip-video>`、`<mip-audio>`、`<picutre>`，其他均不可|
|input elements | <span class="mipengine-doc-green"> 允许使用 </span>|<ul><li> 包括: `<select>` 、`<option>` 、 `<textarea>` 、`<input>`</li><li>父元素必须是 `<mip-form>`</li><li>`<source>` 的 `src` 必须存在且非 `/` 开头的相对路径</li></ul>|

- [MUST] 沿用 1.0 HTML 属性规范
  - MIP-HTML 中所有 `on` 开头的属性都不允许使用，如：`onclick`，`onmouseover` 。
  - MIP-HTML 中允许使用 `on` 属性。
  - MIP-HTML 中不允许使用 `style` 属性。
- [MUST] 沿用 1.0 自定义标签规范

附：[MIP 1.0-HTML 规范](https://www.mipengine.org/doc/2-tech/1-mip-html.html)
