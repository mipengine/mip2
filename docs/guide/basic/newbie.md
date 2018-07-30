# 新手指南

MIP（Mobile Instant Pages - 移动网页加速器）主要用于移动端页面加速。

这篇文档将带你快速创建一个 MIP 页面。

## 1. 创建 HTML 文件
首先创建一个标准的 HTML 文件，注意：

- 在 `<html>` 标签中增加 `mip` 属性标识。
- 编码为 `utf-8` 。
- 添加 `meta-viewport`，用于移动端展现。

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

## 2. 添加 MIP 运行环境
在 HTML 代码中，添加 MIP 依赖的 `mip.js` 和 `mip.css` 。

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v2/mip.css">
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 3. 添加 MIP 关联标签
`<link rel="miphtml">` 和 `<link rel="canonical">` 主要用于告知搜索引擎页面间的关系。添加关联标签后，MIP 页的会继承 **原页面**(移动端) 的点击权重，同时 **MIP 页** 将作为搜索引擎的首选导流页面。

使用规则：

- `<link rel="miphtml">` 在移动端页面（H5）使用，指向对应内容的 MIP 页，方便搜索引擎发现对应的 MIP 页。
- `<link rel="canonical">` 在 MIP 页中使用，指向内容对应的移动端页面（H5）。
- 若没有移动端页面（H5），则指向内容对应的 PC 页。
- 若直接在原链接修改 MIP，则 Canonical 指向当前 URL 。

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v2/mip.css">
    <!-- canonical 中的链接优先填写对应内容的移动端页面（H5）地址 -->
    <link rel="canonical" href="https://www.example.com/your/path.html">
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 4. 添加样式
出于速度考虑，建议內联使用 CSS 样式。所有样式写在 `<style mip-custom></style>` 中，注意：`style` 标签仅允许出现一次。

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v2/mip.css">
    <!-- canonical 中的链接优先填写对应内容的移动端页面（H5）地址 -->
    <link rel="canonical" href="https://www.example.com/your/path.html">
    <title>Hello World</title>
    <style mip-custom>
      h1 {
        color: red;
      }
    </style>
  </head>
  <body>
    <h1>Hello World!</h1>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 5. 替换禁用 HTML 标签
[notice]MIP 十分关注页面速度，也因此禁用了一些引起拖慢速度的 HTML 标签（[禁用列表](../mip-standard/mip-html-spec.md)）。例如，`<img>` 标签会引起浏览器的 repaint 和 reflow，为了避免这些，MIP 提供了替代标签 `<mip-img>` ，详见 [`<mip-img>`使用文档](../../extensions/builtin/mip-img.md) 。

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v2/mip.css">
    <!-- canonical 中的链接优先填写对应内容的移动端页面（H5）地址 -->
    <link rel="canonical" href="https://www.example.com/your/path.html">
    <title>Hello World</title>
    <style mip-custom>
      h1 {
        color: red;
      }
    </style>
  </head>
  <body>
    <h1>Hello World!</h1>
    <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 6. 使用 MIP 组件
[warning]出于对代码质量和性能的考虑，MIP 页中不允许自定义 JavaScript 代码。

在一个合法的 MIP 页面中，所有的交互通过引入 MIP 组件实现。MIP 组件可以理解为封装了 JS 的自定义 HTML 标签。上一步中的 `<mip-img>` 也是一个 MIP 组件，[点击这里](../../extensions/index.md) 查看更多组件。

我们以分享组件为例，根据[分享组件文档](../../extensions/extentions/mip-share.md)，组件对应的 HTML 标签为 `<mip-share>` ，需要依赖 <https://c.mipcdn.com/static/v2/mip-share/mip-share.js> 脚本，用在页面里就是这样：

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v2/mip.css">
    <!-- canonical 中的链接优先填写对应内容的移动端页面（H5）地址 -->
    <link rel="canonical" href="https://www.example.com/your/path.html">
    <title>Hello World</title>
    <style mip-custom>
      h1 {
        color: red;
      }
    </style>
  </head>
  <body>
    <h1>Hello World!</h1>
    <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
    <mip-share title="分享：我的第一个 MIP 页面 "></mip-share>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="https://c.mipcdn.com/static/v2/mip-share/mip-share.js"></script>
  </body>
</html>
```

在使用组件时，请注意阅读组件文档，查看组件是否依赖所需脚本。如果依赖，请在 `mip.js` 之后引入脚本。

## 7. 预览
开发完成后，可以使用 [MIP 校验工具](//www.mipengine.org/validator/validate) 保证代码规范。

[info] 校验代码，使用 [MIP 校验工具](//www.mipengine.org/validator/validate)。<br> 预览线上 URL 异步打开效果，使用 [MIP 预览工具](//www.mipengine.org/validator/preview)。

MIP 页文件可以直接运行，你可以选择如下方式，像预览普通 HTML 站点一样预览 MIP-HTML 页面：

- 直接在浏览器中打开（由于 XML HTTP Requests 失败可能会导致某些元素预览失败）。
- 在本地部署一个服务，如 Apache，Nginx 等。
- 使用 MIP-CLI 辅助预览，使用方法见 MIP 博客：[开发教程一](http://www.cnblogs.com/mipengine/p/mip_cli_1_install.html)。


## 8. 起飞
到目前为止，你已经创建好了一个 MIP 页面。这个页面有图、有文、能分享，可以在浏览器中运行。

进阶的内容，请参考：

- [MIP-HTML 规范](../mip-standard/mip-html-spec.md)
- [MIP 加速原理](./principle-of-mip.md)
- [自定义组件](../component/introduction.md)
- [组件布局](../component/layout.md)
- [可交互 MIP](../interactive-mip/introduction.md)
- [全站 MIP](../all-sites-mip/introduction.md)

[info] MIP 开发系列视频教程：https://bit.baidu.com/course/datalist/column/120.html
