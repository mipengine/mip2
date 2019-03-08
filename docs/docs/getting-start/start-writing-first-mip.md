# 开发您的第一个 MIP 页面

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
    <h2>MIP 2</h2>
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
    <h2>MIP 2</h2>
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
    <h2>MIP 2</h2>
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
      h2 {
        color: red;
      }
    </style>
  </head>
  <body>
    <h2>MIP 2</h2>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 5. 替换禁用 HTML 标签

MIP 十分关注页面速度，也因此禁用了一些引起拖慢速度的 HTML 标签（[禁用列表](../mip-standard/mip-html-spec.md)）。例如，`<img>` 标签会引起浏览器的 repaint 和 reflow，为了避免这些，MIP 提供了替代标签 `<mip-img>` ，详见 [`<mip-img>`使用文档](../../components/builtin/mip-img.md)。

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
      h2 {
        color: red;
      }
    </style>
  </head>
  <body>
    <h2>MIP 2</h2>
    <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
  </body>
</html>
```

## 6. 使用 MIP 组件

出于对代码质量和性能的考虑，MIP 页中不允许使用 `script` 标签自定义 JavaScript 代码。MIP 提供了官方组件库，涵盖了一系列常用的展示、布局、动画、广告等等功能，基本上能够做到在不需要写任何自定义 JS 代码的前提下实现各种丰富的交互。[点击这里](../../components/index.md) 可以查看目前提供的 MIP 组件列表及其文档。

每个 MIP 组件都封装成了 Custom Element 也就是自定义 HTML 元素，开发者只需要像使用 `<img>`、`<video>` 这类标签那样使用 MIP 组件就好了。

我们以 Tab 切换组件为例，根据[切换组件文档](../../components/extensions/mip-tabs.md)，组件对应的 HTML 标签为 `<mip-tabs>` ，需要依赖 `<https://c.mipcdn.com/static/v2/mip-tabs/mip-tabs.js>` 脚本，页面可以这样使用：

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
      h2 {
        color: red;
      }
    </style>
  </head>
  <body>
    <mip-tabs initial-tab="0">
      <mip-tabs-item label="标签0">
        <h2>标签0展示了一张图片</h2>
        <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
      </mip-tabs-item>
      <mip-tabs-item label="标签1">
        <h2>标签1展示了一个无序列表</h2>
        <ol>
          <li>列表0</li>
          <li>列表1</li>
          <li>列表2</li>
        </ol>
      </mip-tabs-item>
    </mip-tabs>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="https://c.mipcdn.com/static/v2/mip-tabs/mip-tabs.js"></script>
  </body>
</html>
```

在浏览器打开这个 HTML 页面便可以看到，页面上显示了切换组件的布局，点击对应的标签页的标题能够切换显示对应的标签页。在这个过程中我们根本不需要去写自定义 JS 脚本，只需要在 HTML 里使用各种官方组件标签和原生 HTML 标签进行组合，加上样式调整，基本上就能够做出功能丰富的 MIP 页面了。

## 7. 使用 MIP 事件交互机制

MIP 提供了便捷的事件交互机制，来解决 MIP 页面开发过程中遇到的组件交互问题。

首先 MIP 组件会在特定条件下触发抛出某些事件，比如按钮组件被点击时触发点击事件，比如定时组件在特定时间触发定时事件等等，具体组件会触发什么样的事件在对应的官方组件文档里都有详细的说明和示例。MIP 提供了一套机制，即直接在需要监听事件的标签上添加 `on` 属性，并按照一定的语法规则描述监听到事件后的行为，就可以实现组件之间基于事件机制的交互。

首先我们通过 mip-tabs 和 button 之间的事件交互来进行简单说明，例子如下：

```html
<button on="tap:tabs.slideTab(0)">切换至标签0</button>
<button on="tap:tabs.slideTab(1)">切换至标签1</button>

<mip-tabs initial-tab="0" id="tabs">
  <mip-tabs-item label="标签0">
    <h2>标签0展示了一张图片</h2>
    <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
  </mip-tabs-item>
  <mip-tabs-item label="标签1">
    <h2>标签1展示了一个无序列表</h2>
    <ol>
      <li>列表0</li>
      <li>列表1</li>
      <li>列表2</li>
    </ol>
  </mip-tabs-item>
</mip-tabs>
```

在这个例子中我们增加了两个 `<button>` 按钮，并且用 `on` 语法监听他们的点击。点击按钮时会触发通用事件 `tap`，监听到 `tap` 事件后会去寻找 ID 为 `tabs` 的组件，也就是 mip-tabs 切换组件。mip-tabs 提供了切换标签页的方法 `slideTab()`，因此通过调用这个 `tabs.slideTab(0)` 即可触发标签页的切换。至此就完成了基于事件机制的组件交互过程。

MIP 提供了多种交互机制来方便开发者在不需要写自定义 JS 的情况下完成组件交互的功能，相关文档可以阅读 [可交互式设计](../interactive-mip/introduction.md) 章节来进行深入学习。

## 8. 预览
开发完成后，可以使用 [MIP 校验工具](https://www.mipengine.org/validator/validate) 保证代码规范。

校验代码，使用 [MIP 校验工具](https://www.mipengine.org/validator/validate)。

预览线上 URL 异步打开效果，使用 [MIP 预览工具](https://www.mipengine.org/validator/preview)。

MIP 页文件可以直接运行，你可以选择如下方式，像预览普通 HTML 站点一样预览 MIP-HTML 页面：

- 直接在浏览器中打开（由于 XML HTTP Requests 失败可能会导致某些元素预览失败）。
- 在本地部署一个服务，如 Apache，Nginx 等。
- 使用 MIP-CLI 辅助预览，使用方法可以参考网站内 **工具** 一栏。

## 9. 起飞
到目前为止，你已经创建好了一个 MIP 页面。这个页面有图、有文，可以在浏览器中运行。

进阶的内容，请参考：

- [MIP-HTML 规范](../mip-standard/mip-html-spec.md)
- [MIP 加速原理](./principle-of-mip.md)
- [自定义组件](../component/introduction.md)
- [组件布局](../component/layout.md)
- [可交互 MIP](../interactive-mip/introduction.md)
- [全站 MIP](../all-sites-mip/introduction.md)

MIP 开发系列视频教程：https://bit.baidu.com/course/datalist/column/120.html
