# 4. 使用内置组件

考虑到页面的性能，MIP 页面限制了部分 HTML 原始标签的使用，如`<img> <video> <iframe>` 等 等，同时提供了可以替代的相应的内置组件标签，如`<mip-img> <mip-video> <mip-iframe>` 等， [查看具体限制详情](../../guide/mip-standard/mip-html-spec.md)，本小节我们利用内置标签 `<mip-img>` 来插入图片，加深大家印象。

  > 使用内置组件标签时，无需额外引入该组件的`.js` 文件。


1. 在 `/example/index.html` 文件的 `<body>` 标签中增加增加 `<mip-img>` 标签。

```html
  <body>
    <div>
      <h2>First MIP page</h2>
      <h2>Add MIP components here</h2>

      <!-- 内置组件 -->
      <mip-img src="https://placekitten.com/200/200"></mip-img>

      <!-- 自定义组件引入方式 -->
      <mip-example></mip-example>

    </div>
    <!-- body的底部引入 mip.js 文件必须 & 自定义组件的 .js 文件 -->
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="/mip-example/mip-example.js"></script>

  </body>
```

2. 在项目根目录 `mip2 dev` 起服务，查看 `http://127.0.0.1:8111/example/index.html` ，可以看到插入图片的页面效果。



> 修改完页面，下一小节我们来校验页面的规范问题。

