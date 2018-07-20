## MIP HTML 规范

MIP 规范是高性能 MIP 页面的保证，其中最重要的规范是：MIP HTML 规范。按照页面功能区域划分，MIP HTML 规范主要分为以下列出的若干类型。
- <a href="#1">头部规范</a>
- <a href="#2">页面元素使用规范</a>
- <a href="#3">HTML 属性</a>
- <a href="#4">自定义样式规范</a>

由于规范长期更新，更多最新规范可查阅 MIP 官方网站 MIP HTML规范章节。

<a name="1"></a>
### 1. 头部使用规范
下面简要列出MIP页头部的使用规范。头部是MIP页的声明、配置信息、资源引入的主要区域。
  - 页面起始标签使用 <!DOCTYPE html>
  - `<html>` 标签必写且唯一，同时必须存在 mip 属性，即：`<html mip>` 。
  - `<head>` 标签必写且唯一，其父元素必须是 `<html>` 标签。
  - `<body>` 标签必写且唯一，其父元素必须是 `<html>` 标签。标签：HTML5的标准约定，通过这两个标签进行功能区块划分。
  - 必须在`<head>` 标签中包含字符集声明: meta charset="utf-8"，字符集统一为utf-8。
  - 必须在`<head>` 标签中包含 viewport 设置标签: `<meta name="viewport" content="width=device-width,initial-scale=1">`，推荐包含`minimum-scale=1`。
  - 必须在`<head>` 标签中包含`<link rel="stylesheet" type="text/css" href="https:// c.mipcdn.com/static/v1/mip.css" >`。
  - 必须在 `<head>` 标签中包含 `<link rel="canonical" href="http(s)://example.com">` 。
  - 必须在 `<head>` 标签中包含 `<link rel="canonical" href="http(s)://example.com">` 。
  - 必须在 `<body>` 标签底部包含 `<script src="<script src="https://c.mipcdn.com/static/v2/mip.js"></script>` ，如果包含在 `<head>` 标签中则须增加 `async` 属性。


<a name="2"></a>
### 2. 页面元素

MIP-HTML 禁止使用对页面性能以及安全有较大影响的标签，同时也规定了元素的使用方式。

|标签|使用范围|备注|
|--|--|--|
|`<img>`    |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-img>`|
|`<video>`  |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-video>`|
|`<audio>`  |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-audio>`|
|`<iframe>` |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-iframe>`|
|`<form>`   |<span class="mipengine-doc-red">禁止使用</span>|需替换为 `<mip-form>`|
|`<frame>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<frameset>`|<span class="mipengine-doc-red">禁止使用 </span>||
|`<object>` |<span class="mipengine-doc-red">禁止使用</span>||
|`<param>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<applet>` |<span class="mipengine-doc-red">禁止使用</span>||
|`<embed>`  |<span class="mipengine-doc-red">禁止使用</span>||
|`<script>` |<span class="mipengine-doc-orange">限制使用</span>|<span>禁止使用 `<script>` 不包括以下两种场景：</span><ul><li>`src` 属性存在<ul><li>`type` 必须 `text/javascript` 、`application/javascript` 或 `type` 不存在（即没有 `type` 属性）</li><li>`src` 必须是 `https` 或 `//` 开头</li><li>`src` 必须是 MIP 域名，否则禁止使用</li><li>如果在 `<head>` 中，必须加 `async` 属性</li></ul></li><li>`src`  属性不存在<ul><li>`type` 必须是 `application/json` 或 `application/ld+json`</li><li>`script` 不强制大小写，不区分单双引号</li></ul></li><li>`script` 父节点不能是 `template`</li></ul>|
|`<style>`  |<span class="mipengine-doc-orange">替换为 `<style mip-custom>`</span>|只能在 `<head>` 标签中使用一次|
|`<svg>`    |<span class="mipengine-doc-green">允许使用</span>||
|`<button>` |<span class="mipengine-doc-green">允许使用</span>||
|`<link>`   |<span class="mipengine-doc-green">允许使用</span>|<ul><li>`<link>` 必须在 `<head>` 中<br></li><li>必须存在 `rel="miphtml"` 或 `rel="canonical"` 的 `<link>` 标签</li><li>拥有 `rel="miphtml"` 或 rel=`"canonical"` 的标签之间或自身不能重复</li><li>如果 `rel="miphtml"` 或 `rel="canonical"` ，则 `href` 必须以 `https` 、`http` 或 `//` 开头</li><li>如果非 `rel="miphtml"` 或 `rel="canonical"` ，则 `href` 必须以非 `/` 开头（除 `//`）</li><li>**注：支持引入外链 CSS**</li></ul>|
|`<a>`      |<span class="mipengine-doc-green">允许使用</span> | <ul><li>`href` 属性必填，同时其值不可以 `href="javascript:"`</li><li>MIP 页之间跳转推荐使用 [`<a data-type="mip">`](/examples/mip-extensions/mip-link.html)</li></ul>|
|`<source>`|<span class="mipengine-doc-green">允许使用</span>|其父元素必须是 `<mip-video>`、`<mip-audio>`、`<picutre>`，其他均不可|
|`<base>`|<span class="mipengine-doc-green">允许使用</span>|<ul><li>不能存在多个</li><li>必须在 `<head>` 标签中</li><li>属性必须存在 `target` 或 `href` 属性之一</li><li>`target` 必须为 `_top` 、`_self` 或 `_blank`</li><li>`href` 必须 `/`</li></ul>|
|input elements |<span class="mipengine-doc-green">允许使用</span>|<ul><li>包括: `<select>` 、`<option>` 、 `<textarea>` 、`<input>`</li><li>父元素必须是 `<mip-form>`</li><li>`<source>` 的 `src` 必须存在且非 `/` 开头的相对路径</li></ul>|


#### 自定义标签

#### mip-img

|属性|必填|备注|
|--|--|--|
|`src`|否|属性非空|
|`srcset`|否|属性非空|

[notice]mip-img 必须存在 `src` 或 `srcset` 属性之一

#### mip-pix

|属性|必填|备注|
|--|--|--|
|`src`|是|`src` 必须是以 `http(s)` 或 `//` 开头的地址|

#### mip-video

|属性|必填|备注|
|--|--|--|
|`src`|是|对于不包含 `<source>` 后代节点的 `<mip-video>` 标签，src 属性是强制的|

#### mip-carousel

|属性|必填|备注|
|--|--|--|
|`width`|是|`width` 是 1-4 位的数字|
|`height`|是|`height` 是 1-4 位的数字|

#### mip-iframe

|属性|必填|备注|
|--|--|--|
|`width`|是|`width` 是 1-4 位的数字|
|`height`|是|`height` 是 1-4 位的数字|

#### mip-appdl

|属性|必填|备注|
|--|--|--|
|`tpl`|是|值为 `imageText` 或 `noneImg`|
|`src`|是|如果 `tpl` 为 `imageText` ，`src` 必须为 `http(s)` 开头，其他场景无限制|
|`texttip`|是|非空|

#### mip-audio
|属性|必填|备注|
|--|--|--|
|`src`|是|非相对路径，即 `/` 开头的路径|

#### mip-stats-bidu
|属性|必填|备注|
|--|--|--|
|`token`|是|非空|

#### mip-form 
|属性|必填|备注|
|--|--|--|
|`method`|否|值为 `get` 或 `post`|
|`url`|是|必须是 `http(s)` 或 `//` 开头的地址|

#### mip-link 
|属性|必填|备注|
|--|--|--|
|`href`|是|值为非 `javascript:`|

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

#### template
|属性|必填|备注|
|--|--|--|
|`type`|是|-|


<a name="3"></a>
### 3. HTML 属性
- MIP-HTML 中所有 `on` 开头的属性都不允许使用，如：`onclick`，`onmouseover` 。
- MIP-HTML 中允许使用 `on` 属性。
- MIP-HTML 中不允许使用 `style` 属性。

<a name="4"></a>
### 4. 自定义样式使用规范
出于性能考虑，HTML 中不允许使用内联 `style`，所有样式只能放到 `<head>` 的 `<style>` 标签里。

正确方式：
```js
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
<p style="color:#00f;">Hello World!</p>
<p>
  <style>
    p { color: #00f;}
  </style>
</p>
```

[info] 所有 MIP 规范都可以通过 [MIP 代码校验工具](https://www.mipengine.org/validator/validate)进行快速检查，帮忙开发者迅速定位到问题！