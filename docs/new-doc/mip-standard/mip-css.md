## 组件样式开发规范

- 组件的样式开发必须遵循 Stylelint 中 stylelint-config-standard 中的规范，且必须通过 Stylelint 工具审核之后才能提交。
- 所有样式文件必须使用UTF-8编码 UTF-8 编码具有更广泛的适应性，避免不必要的麻烦，请使用此编码。
- 不允许使用ID选择器：组件的设计，需要考虑一个页面上同时存在多个组件的场景。所以组件及内部元素都不应该拥有hard code的ID属性。
- 选择器的第一层如果是标签选择器，只允许使用组件自身标签，组件的样式定义应只对组件本身以及组件内部生效。

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

- class选择器的命名必须为组件名，或以组件名为前缀。
组件的样式定义应尽量避免对使用方页面产生影响。短小简捷的class 容易与使用方页面产生冲突。

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