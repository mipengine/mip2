# 2. 创建一个独立的页面

创建一个 MIP 页面和创建一个标准的 HTML 页面是完全相同的，同样是以 `.html` 作为扩展名。区别仅仅是在 MIP 页面中，您可以编写形如 `<mip-xxxx>` 这样的自定义标签来使用 MIP 组件。

MIP 提供了一些很常用的组件，称为 “内置组件”，常用的如 `<mip-img>`, `<mip-iframe>`, `<mip-shell>` 等。关于 `<mip-shell>` 我们会在后面单独讲述，这里我们先用其他标签构成一个页面。

## 创建页面

创建一个 HTML 文件，命名为 `index.html` 作为我们的首页。按照标准 HTML 文件的结构，编写如下内容：

```html
<html>
  <head></head>
  <body></body>
</html>
```

## 填充页面

首先我们需要填充 `<head>` 部分。因为 MIP 页面和标准 HTML 页面在头部并无不同，因此不具体展开了。

我们以一个移动端页面为例：

```html
<head>
  <meta charset="utf-8">
  <title>My First MIP Page</title>
  <meta name="apple-touch-fullscreen" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="format-detection" content="telephone=no">
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
</head>
```

在 `<body>` 部分，我们可以混合使用标准的 HTML 标签和 MIP 标签。除了内置的 MIP 组件之外，我们也可以使用自定义的 MIP 组件。关于自定义组件的编写方式您可以参考[组件文档](../../guide/component/introduction)，这里只讲 MIP 组件的使用。

```html
<body>
  <h2>这是我的第一个 MIP 页面</h2>

  <mip-img src="http://boscdn.bpc.baidu.com/assets/mip/codelab/shell/mashroom.jpg" width="300" height="300" class="main-image"></mip-img>

  <p>MIP 全称为 Mobile Instant Pages，因此是以页面 (Page) 为单位来运行的。开发者通过改造/提交一个个页面，继而被百度收录并展示。 </p>
  <p>但以页面为单位会带来一个问题：当一个 MIP 页面中存在往其他页面跳转的链接时，就会使浏览器使用加载页面的默认行为来加载新页面。这“第二跳”的体验比起从搜索结果页到 MIP 页面的“第一跳”来说相去甚远。 </p>
  <p>MIP 为了解决这个问题，引入了 Page 模块。它的作用是把多个页面以一定的形式组织起来，让它们互相之间切换时拥有和单页应用一样的切换效果，而不是浏览器默认的切换效果。这个功能大部分情况下对开发者是透明的，但也需要开发者遵守一定的页面编写规范。除此之外，一些和路由相关的信息和操作也会提供给开发者使用。这两部分将是本章节的主要内容。</p>
</body>
```

## 添加样式

按照 MIP 页面的规范，为了页面性能考虑，不允许开发者随意编写 JavaScript。但页面样式还是需要的，因此开发者可以使用 `<style mip-custom>` 来定制页面级别的样式（组件级别的样式应该编写在组件代码内部）。

__注意__： `<style mip-custom>` 整个页面只能使用一次，不要遗漏 `mip-custom` 属性。

我们给第一个页面稍微添加一些样式：

```html
<head>
  <!-- 刚刚添加的 meta, title 等标签 -->
  <style mip-custom>
    h2 {
      text-align: center;
      margin: 10px auto;
    }

    .main-image {
      margin: 10px auto;
      display: block;
    }

    p {
      margin: 10px;
    }
  </style>
</head>
```

## 引用样式和脚本

作为一个 MIP 页面，必须要引用 `mip.js` 作为页面的启动脚本。因此我们需要在 `<body>` 的最后添加一条 js 的引用。此外，MIP 还提供了一些必须加载的样式，所以我们还需要在 `<head>` 的最后添加 css 的引用。示例如下：

```html
<html>
  <head>
    <!-- 其他内容 -->
    <link rel="stylesheet" href="https://c.mipcdn.com/static/v2/mip.css">
  </head>
  <body>
    <!-- 其他内容 -->
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 预览效果

至此一个独立的 MIP 页面已经完成了。我们可以使用一个静态服务器 (例如 [static-server](https://www.npmjs.com/package/static-server)) 来启动并通过浏览器访问这个 HTML 文件。预览效果如下：

![use-shell](http://boscdn.bpc.baidu.com/assets/mip/codelab/shell/use-shell.png)
