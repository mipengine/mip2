# 父子组件机制

原则上，一个 MIP 组件的代码能够注册一个对应名称的 Custom Element，比如 mip-sample，当 HTML 页面引入对应的 script 标签时，只有 `<mip-sample>`标签会生效。但是对于一些复杂组件来说，比如选项卡组件，假设选项卡为 mip-tabs，则需要对外暴露 `<mip-tabs>` 和 `<mip-tabs-item>` 两种组件，这样才能更加方便地通过标签对拼接出选项卡功能，比如：

```html
<!-- 通过标签嵌套实现选项卡功能 -->
<mip-tabs>
  <mip-tabs-item>Tab 1</mip-tabs-item>
  <mip-tabs-item>Tab 2</mip-tabs-item>
  <mip-tabs-item>Tab 3</mip-tabs-item>
</mip-tabs>
<!-- 只需要引入 mip-tabs.js 即可 -->
<script src="http://c.mipcdn.com/static/v2/mip-tabs/mip-tabs.js"></script>
```

我们将 mip-tabs-item 称为 mip-tabs 的子组件。子组件的判定必须满足以下条件：

1. 子组件文件必须为以 `.js` 结尾；
2. 子组件文件名必须包含父组件名，并在父组件名后加上子组件标识，如 mip-tabs 和 mip-tabs-item；
3. 子组件文件必须与父组件入口文件放在同一级目录下；

这样mip-cli在进行组件代码编译的时候，会自动往入口文件注入子组件和子组件注册Custom Element的代码，从而实现上述功能。
