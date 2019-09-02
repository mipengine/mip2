# 自定义样式使用规范

出于性能考虑，HTML 中不允许使用内联 `style`，所有样式只能放到 `<head>` 的 `<style mip-custom>` 标签里。

正确方式：
```html
<head>
  <style mip-custom>
    p { color: #00f;}
  </style>
</head>
<body>
  <p>Hello World!</p>
</body>
```

错误方式：

```html
<!-- 禁止使用 style 属性 -->
<p style="color:#00f;">Hello World!</p>
<p>
  <!-- 禁止在 body 中使用 style 标签 -->
  <style>
    p { color: #00f; }
  </style>
</p>
```

样式属性规范如下表所示：

|属性|适用范围|说明|
|---|----|---|
| `position: fixed` | 禁止使用 | 请使用 [`<mip-fixed>`](https://www.mipengine.org/v2/components/layout/mip-fixed.html) 组件替代 |
| `!important` | 建议少用 |  |
| CSS3 样式，如：<br>`display: flex`<br> `transition`<br> `transform` | 允许使用 | 需自行处理兼容性问题 |

同时需要注意的是，在 class 的命名上，为避免与 MIP 内部使用的类名冲突，因此不要以 `mip-*` 或 `i-mip-*` 作为自定义 class 的名称。
