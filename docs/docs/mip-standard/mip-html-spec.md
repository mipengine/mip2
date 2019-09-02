# MIP HTML 规范

MIP 规范是高性能 MIP 页面的保证，其中最重要的规范是：MIP HTML 规范。按照页面功能区域划分，MIP HTML 规范主要分为以下列出的若干类型。

- <a href="#1">头部规范</a>
- <a href="#2">HTML 标签使用规范</a>
- <a href="#3">HTML 属性使用规范</a>
- <a href="#4">自定义样式规范</a>

[info] 所有 MIP 规范都可以通过 [MIP 代码校验工具](https://www.mipengine.org/validator/validate)进行快速检查，帮忙开发者迅速定位到问题！校验工具的提示信息解读请参考 [MIP 校验错误列表](./mip-validate.md)。

由于规范长期更新，更多最新规范可查阅 MIP 官方网站 MIP HTML规范章节。也同时欢迎开发者到 MIP 项目的 [GitHub](https://github.com/mipengine/mip2/issues)，参与 MIP HTML 规范的讨论。

<a id="1"></a>
## 头部使用规范

下面简要列出MIP页头部的使用规范。头部是MIP页的声明、配置信息、资源引入的主要区域。

  - 页面起始标签使用 `<!DOCTYPE html>`。
  - `<html>` 标签必写且唯一，同时必须存在 mip 属性，即：`<html mip>` 。
  - `<head>` 标签必写且唯一，其父元素必须是 `<html>` 标签。
  - `<body>` 标签必写且唯一，其父元素必须是 `<html>` 标签。
  - 必须在`<head>` 标签中包含字符集声明: `<meta charset="utf-8">`，字符集统一为 utf-8。
  - 必须在`<head>` 标签中包含 viewport 设置标签: `<meta name="viewport" content="width=device-width,initial-scale=1">`，推荐包含`minimum-scale=1`。
  - 必须在`<head>` 标签中包含`<link rel="stylesheet" type="text/css" href="https:// c.mipcdn.com/static/v2/mip.css" >`。
  - 必须在 `<head>` 标签中包含 `<link rel="canonical" href="http(s)://example.com">` ，详情请阅读 [Canonical 使用规范](./mip-canonical.md)。
  - 必须在 `<body>` 标签底部包含 `<script src="https://c.mipcdn.com/static/v2/mip.js"></script>` ，如果包含在 `<head>` 标签中则须增加 `async` 属性。

因此一个满足 MIP 头部使用规范的最简页面如下所示：

```html
<!DOCTYPE html>
<html mip>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="canonical" href="https://www.mipengine.org">
    <link rel="stylesheet" type="text/css" href="https://c.mipcdn.com/static/v2/mip.css">
  </head>
  <body>
    <!-- 页面内容 -->
    <script src="https://c.mipcdn.com/static/v2/mip.js" async="async"></script>
  </body>
</html>
```

<a id="2"></a>
## 页面元素使用规范

MIP-HTML 禁止使用对页面性能以及安全有较大影响的标签，同时也规定了元素的使用方式。

|标签|使用范围|备注|
|--|--|--|
|`<a>`      |<span class="mipengine-doc-green">允许使用</span> | <ul><li>`href` 属性必填，同时其值不可以 `href="javascript:"`</li><li>MIP 页之间跳转推荐添加 `data-type="mip"` 属性，以获得更好的页面切换效果： [`<a data-type="mip">`](../../extensions/extensions/mip-link.md)</li></ul>|
|`<applet>` |<span class="mipengine-doc-red">禁止使用</span>||
|`<audio>`  |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-audio>`|
|`<base>`|<span class="mipengine-doc-green">允许使用</span>|<ul><li>不能存在多个</li><li>必须在 `<head>` 标签中</li><li>属性必须存在 `target` 或 `href` 属性之一</li><li>`target` 必须为 `_top` 、`_self` 或 `_blank`</li><li>`href` 必须 `/`</li></ul>|
|`<button>` |<span class="mipengine-doc-green">允许使用</span>||
|`<embed>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<form>`   |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-form>`|
|`<frame>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<frameset>`|<span class="mipengine-doc-red">禁止使用 </span>||
|`<iframe>` |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-iframe>`|
|`<img>`    |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-img>`|
|input elements |<span class="mipengine-doc-green">允许使用</span>|<ul><li>包括: `<select>` 、`<option>` 、 `<textarea>` 、`<input>`</li><li>父元素必须是 `<mip-form>`</li><li>`<source>` 的 `src` 必须存在且非 `/` 开头的相对路径</li></ul>|
|`<link>`   |<span class="mipengine-doc-green">允许使用</span>|<ul><li>`<link>` 必须在 `<head>` 中<br></li><li>必须存在 `rel="miphtml"` 或 `rel="canonical"` 的 `<link>` 标签</li><li>拥有 `rel="miphtml"` 或 rel=`"canonical"` 的标签之间或自身不能重复</li><li>如果 `rel="miphtml"` 或 `rel="canonical"` ，则 `href` 必须以 `https` 、`http` 或 `//` 开头</li><li>如果非 `rel="miphtml"` 或 `rel="canonical"` ，则 `href` 必须以非 `/` 开头（除 `//`）</li><li>**注：支持引入外链 CSS**</li></ul>|
|`<object>` |<span class="mipengine-doc-red">禁止使用</span>||
|`<param>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<script>` <br> `<script type="text/javascript">` <br> `<script type="application/javascript">`|<span class="mipengine-doc-orange">限制使用</span>|<ul><li>仅允许用于加载 MIP JS、MIP 组件 JS</li><li>禁止用于自定义 JS</li><li>`<script>` 应放在页面底部加载，并建议添加 `async` 属性。如放在 `<head>` 里面加载，则必须添加 `async` 属性防止 JS 加载阻塞页面渲染。</li></ul>|
|`<script type="application/json">` <br> `<script type="type="application/ld+json">`|<span class="mipengine-doc-green">允许使用</span>|一般作为 MIP 组件的复杂配置项使用|
|`<source>`|<span class="mipengine-doc-green">允许使用</span>|其父元素必须是 `<mip-video>`、`<mip-audio>`、`<picutre>`，其他均不可|
|`<style>`  |<span class="mipengine-doc-orange">限制使用</span>|只能在 `<head>` 标签中使用一次，并且添加 `mip-custom` 属性，如：`<style mip-custom></style>`|
|`<svg>`    |<span class="mipengine-doc-green">允许使用</span>||
|`<video>`  |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-video>`|

<a id="3"></a>
## HTML 元素属性规范

### 全局属性规范

这些规范无论是原生的 HTML 标签或者是 MIP 组件都必须遵守的。

|属性|使用范围|备注|
|----|----|----|
|所有 `on*` 开头的属性<br>如`onclick`<br>`onmouseover`|<span class="mipengine-doc-red">禁止使用</span>|使用 [MIP 事件机制](../interactive-mip/event-and-action.md)代替|
| `style` | <span class="mipengine-doc-red">禁止使用</span> | 改为使用 `class` |

### MIP 组件使用规范

MIP 官方组件根据各自组件的功能需求同样也需要遵守一些规范。

#### mip-img

|属性|必填|备注|
|--|--|--|
|`src`<br>`srcset`|是|ip-img 必须存在 `src` 或 `srcset` 属性之一|
|`width`<br>`height`<br>`layout`|建议|防止页面加载时由于图片加载过慢而导致页面抖动，并可能会影响到 MIP 首屏渲染计算错误。<br>请阅读 [样式和布局](../style-and-layout/introduction.md) 进行页面展示优化的学习。|

#### mip-pix

|属性|必填|备注|
|--|--|--|
|`src`|是|`src` 必须是以 `http(s)` 或 `//` 开头的地址|

#### mip-video

|属性|必填|备注|
|--|--|--|
|`src`|是|对于不包含 `<source>` 后代节点的 `<mip-video>` 标签，src 属性是强制的|
|`width`<br>`height`<br>`layout`|建议|防止页面加载时由于视频加载过慢而导致页面抖动，并可能会影响到 MIP 首屏渲染计算错误。<br>请阅读 [样式和布局](../style-and-layout/introduction.md) 进行页面展示优化的学习。|

#### mip-carousel

|属性|必填|备注|
|--|--|--|
|`width`<br>`height`<br>`layout`|是|防止页面加载时由于图片加载过慢而导致页面抖动，并可能会影响到 MIP 首屏渲染计算错误。<br>请阅读 [样式和布局](../style-and-layout/introduction.md) 进行页面展示优化的学习。|

#### mip-iframe

|属性|必填|备注|
|--|--|--|
|`width`<br>`height`<br>`layout`|是|防止页面加载时由于 iframe 网页内容加载过慢而导致页面抖动，并可能会影响到 MIP 首屏渲染计算错误。<br>请阅读 [样式和布局](../style-and-layout/introduction.md) 进行页面展示优化的学习。|

#### mip-appdl

|属性|必填|备注|
|--|--|--|
|`tpl`|是|值为 `imageText` 或 `noneImg`|
|`src`|是|如果 `tpl` 为 `imageText` ，`src` 必须为 `http(s)` 开头，其他场景无限制|
|`texttip`|是|非空|

#### mip-audio
|属性|必填|备注|
|--|--|--|
|`src`|是|必须是 以`https://` 或 `//` 开头的路径|

#### mip-stats-bidu
|属性|必填|备注|
|--|--|--|
|`token`|是|非空|

#### mip-form
|属性|必填|备注|
|--|--|--|
|`method`|否|值为 `get` 或 `post`|
|`url`|是|必须是 `http(s)` 或 `//` 开头的地址|

#### mip-ad && mip-embed
|属性|必填|备注|
|--|--|--|
|`type`|是|-|

#### mip-vd-baidu
|属性|必填|备注|
|--|--|--|
|`src`|是|`src` 必须是 `http(s)` 或 `//` 开头|
|`title`|是|非空|
|`poster`|是|非空|
|`width`<br>`height`<br>`layout`|是|防止页面加载时由于视频加载过慢而导致页面抖动，并可能会影响到 MIP 首屏渲染计算错误。<br>请阅读 [样式和布局](../style-and-layout/introduction.md) 进行页面展示优化的学习。|

#### template
|属性|必填|备注|
|--|--|--|
|`type`|是|-|

<a id="4"></a>
## 自定义样式使用规范

MIP 允许开发者自定义样式来修饰网页。我们从性能和体验的角度出发，同样制定了自定义样式规范来保证页面体验。在此之前，强烈建议开发者学习 [样式和布局](../style-and-layout/introduction.md) 一文，了解如何使用 MIP 提供的机制来提高页面渲染效率。

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




