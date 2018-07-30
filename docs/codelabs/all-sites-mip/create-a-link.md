# 3. 创建一个链接

到目前为止 MIP 还是以“页面”为单位。在标准 HTML 中，页面之间通过链接相连，在这点上 MIP 也是相同的。

在创建链接之前，我们需要再创建一个页面。只有拥有两个页面，才使得链接跳转有意义。

## 再创建一个页面

因为之前已经创建过一个页面了，因此这里就不详细分步骤讲述了，直接放上第二个页面的 HTML 代码。我们把它命名为 `second.html`

```html
<html>
  <head>
    <meta charset="utf-8">
    <title>My Second MIP Page</title>
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
    <style mip-custom>
    h2 {
      text-align: center;
      margin: 10px auto;
    }

    .main-image {
      margin: 10px auto;
      display: block;
    }

    p,h3 {
      margin: 10px;
    }
    </style>
  </head>
  <body>
    <h2>这是我的第二个 MIP 页面</h2>

    <mip-img src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" width="300" height="300" class="main-image"></mip-img>

    <p>MIP 为所有组件提供了一些常用的样式，避免开发者在编写组件时重复实现。这部分样式会在以后的迭代中逐步完善，敬请开发者们关注。</p>

    <h3>一像素边框</h3>

    <p>针对移动端浏览器在高清屏幕显示中最常见的“一像素边框”问题，MIP 给出了通用的解决方案。开发者只需要引入固定的类名即可绘制出真实的一像素边框。</p>

    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 添加链接

MIP 页面的链接采用和标准 HTML 相同的 `<a>` 标签，但进行了一些限制。最主要的一点是在 MIP 页面之间跳转时，加上 `mip-link` 或者 `data-type="mip"`。更加详细和完整的相关说明可以参阅[这篇文档](../../guide/all-sites-mip/structure.md)。

既然我们已经有了两个页面 `index.html` 和 `second.html`，我们可以给它们之间添加链接了。例如我们在 `index.html` 的最后添加：

```html
<a mip-link href="./second.html" class="next-link">下一页</a>
```

## 预览效果

点击 `index.html` 的下一页按钮，我们可以看到 `second.html` 以动画的形式流畅地侧滑进入屏幕，页面并没有常规的白屏，体验和单页应用完全相同。

![切换效果](http://boscdn.bpc.baidu.com/assets/mip/codelab/shell/transition-forward.png)
