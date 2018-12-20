# 初始化数据
首先，我们创建一个页面，并在 HTML 页面代码中填充以下内容：

```html
<body>
  ...
  <mip-data>
    <script type="application/json">
      {
        "no": 0,
        "imgList": [
            "https://www.mipengine.org/static/img/sample_01.jpg",
            "https://www.mipengine.org/static/img/sample_02.jpg",
            "https://www.mipengine.org/static/img/sample_03.jpg"
        ],
        "tab": "娱乐",
        "loadingTip": "default"
      }
    </script>
  </mip-data>
</body>
```

在这里，我们使用了一个名为 `mip-data` 的自定义组件，这个组件是一个内置组件，由 MIP 核心代码提供，开发者无需引入额外的组件文件。

`<mip-data>` 元素用于在页面中设置数据源，一个页面中可以指定多个 `<mip-data>`，最终数据会合并到一个数据源对象上。请开发者留意我们在这里初始化的各项数据，后续的例子中仍会使用到。

通过 `<mip-data>` 元素设置数据源的方法有二：
1. 直接将数据嵌入到 HTML 页面中，如上面的代码所示，要求符合 `JSON` 数据格式；
2. [可交互 MIP - 初始化异步数据](https://mip-project.github.io/guide/interactive-mip/mip-data.html#%E5%BC%82%E6%AD%A5%E6%95%B0%E6%8D%AE)