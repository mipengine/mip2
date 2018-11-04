# 开发您的第一个 MIP 页面

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
[warning]出于对代码质量和性能的考虑，MIP 页中不允许使用 `script` 标签自定义 JavaScript 代码。如有必要，开发者可以考虑使用 [`<mip-script>` 组件](../interactive-mip/mip-script.md)来编写受 MIP 限制的 JavaScript 代码。

在一个合法的 MIP 页面中，所有的交互通过引入 MIP 组件实现。MIP 组件可以理解为封装了 JS 的自定义 HTML 标签。上一步中的 `<mip-img>` 也是一个 MIP 组件，[点击这里](../../extensions/index.md) 查看更多组件。

我们以 tab 切换组件为例，根据[切换组件文档](../../extensions/extensions/mip-tabs.md)，组件对应的 HTML 标签为 `<mip-tabs>` ，需要依赖 <https://c.mipcdn.com/static/v2/mip-tabs/mip-tabs.js> 脚本，用在页面里就是这样：

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
      <mip-tabs-item label="MIP 2">
        <h2>MIP 2</h2>
        <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
      </mip-tabs-item>
      <mip-tabs-item label="mip-tabs 组件介绍">
        <ol>
          <li>使用方便</li>
          <li>动画交互</li>
          <li>任意嵌套</li>
          <li>自定义tab内容结构</li>
        </ol>   
      </mip-tabs-item>
    </mip-tabs>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="https://c.mipcdn.com/static/v2/mip-tabs/mip-tabs.js"></script>
  </body>
</html>
```

在使用组件时，请注意阅读组件文档，查看组件是否依赖所需脚本。如果依赖，请在 `mip.js` 之后引入脚本。

[info] 另外，这个切换组件是用 Vue 语法写的组件。MIP 组件化的核心是基于 Custom Elements（自定义元素）来实现的，而 MIP 支持将 Vue 组件转换为 MIP 组件，这也是 MIP 的特点之一。

## 7. 使用 MIP 特性

MIP 提供了强大的组件DOM通信，组件间通信功能，以解决在MIP组件开发中遇到的组件交互问题。可以通过 DOM 属性来触发某个 MIP 元素的自定义事件。语法使用用一种简单特定的语言来表示：`eventName:targetId[.actionName[(args)]]`。通过 mip-tabs 来进行简单说明，例子如下：

```javascript
<mip-tabs initial-tab="0" id="tabs">
  <mip-tabs-item label="MIP 2">
    <h2>什么是 MIP</h2>
    <mip-img layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png" alt="MIP LOGO"></mip-img>
  </mip-tabs-item>
  <mip-tabs-item label="mip-tabs 组件介绍">
    <ol>
      <li>使用方便</li>
      <li>动画交互</li>
      <li>任意嵌套</li>
      <li>自定义tab内容结构</li>
    </ol>
    <button on="tap:tabs.slideTab(2)">点击查看更多</button>     
  </mip-tabs-item>
  <mip-tabs-item label="更多">
    <div>MIP 教程</div>
    <div>MIP 组件</div>
    <div>MIP API</div>
    <div>MIP Codelab</div>
  </mip-tabs-item>
</mip-tabs>
```

在这个例子中，点击按钮会跳转到第三个 tab ，其中 tap 是 MIP 为所有 HTML 元素设置的点击事件，tabs 是 mip-tabs 组件的 id ，slideTab 是其暴露的 action。

另外，MIP 也有数据驱动的概念，即不直接操作 DOM 节点，通过事先配置数据，并将 DOM 节点与数据绑定，通过触发数据的更新来触发 DOM 节点的更新。下面将对上面的例子补充完整来进行说明。

```javascript
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
      /* 自定义样式 */

      mip-tabs {
        transition: height .3s;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
      }

      .mip-tabs {
        transition: height .3s;
      }

      h2 {
        line-height: 3;
      }

      p {
        line-height: 1.8;
      }

      ul,
      ol {
        padding-top: 30px;
      }

      ul li,
      ol li {
        list-style: disc;
        list-style-position: inside;
        line-height: 1.6;
      }
      
      .bold {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <mip-data>
      <script type="application/json">
        {
          "isActive": true,
          "alt": "MIP LOGO",
          "styleObject": {
            "color": "red"
          }
        }
      </script>
    </mip-data>

    <mip-tabs initial-tab="0" id="tabs">
      <mip-tabs-item label="MIP 2" m-bind:class="{ bold: isActive }">
        <h2>什么是 MIP</h2>
        <p>MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。
          MIP 主要由三部分组织成：
        </p>
        <ul>
          <li>MIP-HTML：基于 HTML 中的基础标签制定了全新的规范，通过对一部分基础标签的使用限制或功能扩展，使 HTML 能够展现更加丰富的内容。</li>
          <li>MIP-JS：可以保证 MIP-HTML 页面的快速渲染。</li>
          <li m-bind:style="styleObject">MIP-Cache：用于实现 MIP 页面的高速缓存，从而进一步提高页面性能。</li>
        </ul>
        <button on="tap:MIP.setData({isActive:!m.isActive})">点击切换字体粗细</button>
        <mip-img m-bind:alt="alt" layout="responsive" width="350" height="263" src="https://www.mipengine.org/static/img/mip_logo_3b722d7.png"></mip-img>
      </mip-tabs-item>
      <mip-tabs-item label="mip-tabs 组件介绍">
        <ol>
          <li>使用方便</li>
          <li>动画交互</li>
          <li>任意嵌套</li>
          <li>自定义tab内容结构</li>
        </ol>
        <button on="tap:tabs.slideTab(2)">点击查看更多</button>     
      </mip-tabs-item>
      <mip-tabs-item label="更多">
        <div>MIP 教程</div>
        <div>MIP 组件</div>
        <div>MIP API</div>
        <div>MIP Codelab</div>
      </mip-tabs-item>
    </mip-tabs>
    <script src="https://c.mipcdn.com/static/v2/mip.js"></script>
    <script src="https://c.mipcdn.com/static/v2/mip-tabs/mip-tabs.js"></script>
  </body>
</html>
```

`<mip-data>` 组件用于设置数据源，`mip-bind` 用于在 HTML 元素上绑定和使用此前用 `<mip-data>` 设置的数据。在上述例子中，变量 alt 被绑定为 `<mip-img>` 的 alt 属性，变量 isActive 被用来决定 bold class 是否存在，并且可以结合 `on` 语法做到动态切换，变量 styleObject 被用来绑定元素的样式。

上述例子都是比较基本的用法，[这个链接](https://itoss.me/mip-test/src/mip-bind/view/ecommerce.html)展示了更复杂的应用，后面的章节将会对 MIP 的特性做更多详细的说明。

## 8. 预览
开发完成后，可以使用 [MIP 校验工具](//www.mipengine.org/validator/validate) 保证代码规范。

[info] 校验代码，使用 [MIP 校验工具](//www.mipengine.org/validator/validate)。<br> 预览线上 URL 异步打开效果，使用 [MIP 预览工具](//www.mipengine.org/validator/preview)。

MIP 页文件可以直接运行，你可以选择如下方式，像预览普通 HTML 站点一样预览 MIP-HTML 页面：

- 直接在浏览器中打开（由于 XML HTTP Requests 失败可能会导致某些元素预览失败）。
- 在本地部署一个服务，如 Apache，Nginx 等。
- 使用 MIP-CLI 辅助预览，使用方法见 MIP 博客：[开发教程一](http://www.cnblogs.com/mipengine/p/mip_cli_1_install.html)。

## 9. 起飞
到目前为止，你已经创建好了一个 MIP 页面。这个页面有图、有文，可以在浏览器中运行。

进阶的内容，请参考：

- [MIP-HTML 规范](../mip-standard/mip-html-spec.md)
- [MIP 加速原理](./principle-of-mip.md)
- [自定义组件](../component/introduction.md)
- [组件布局](../component/layout.md)
- [可交互 MIP](../interactive-mip/introduction.md)
- [全站 MIP](../all-sites-mip/introduction.md)

[info] MIP 开发系列视频教程：https://bit.baidu.com/course/datalist/column/120.html
