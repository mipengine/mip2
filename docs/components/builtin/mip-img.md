# mip-img 图片

`<mip-img>` 用来支持在 MIP 中增加图片内容。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|无

`<mip-img>` 用法和 `<img>` 的用法基本相同，由 MIP Runtime 控制渲染，在浏览器视窗一定范围内才会加载资源、进行渲染，同时具有加载动画、popup 等特性。

`<mip-img>` 接受 `<source>` 标签作为子元素，能够选择合适的资源进行加载渲染。

## 示例

[notice] `<mip-img>` 需要对应闭合标签 `</mip-img>`，不支持自闭合写法。自闭合规范请见[w3.org](https://www.w3.org/TR/html/syntax.html#void-elements)。

### 最基本使用

```html
<mip-img
    layout="responsive"
    width="350"
    height="263"
    src="https://www.mipengine.org/static/img/sample_01.jpg">
</mip-img>
```

### 加全屏查看

```html
<mip-img
    layout="responsive"
    width="350"
    height="263"
    popup
    src="https://www.mipengine.org/static/img/sample_01.jpg">
</mip-img>
```

### 其他布局（以 `fixed` 为例）

```html
<mip-img
    layout="fixed-height"
    height="263"
    alt="baidu mip img"
    src="https://www.mipengine.org/static/img/sample_01.jpg">
</mip-img>
```

### 带图片标题

图片标题可添加在 `<mip-img>` 后用于说明，可在 `<style mip-custom>` 标签下自定义样式。

```html
<mip-img
    layout="responsive"
    width="350"
    height="263"
    popup
    alt="baidu mip img"
    src="https://www.mipengine.org/static/img/sample_01.jpg">
</mip-img>
<p class="mip-img-subtitle">带图片标题的类型</p>
```

### 使用 source 标签

通过使用 `<source>` 标签，可以让浏览器选择合适的图片进行加载和渲染。如果浏览器不兼容 `<source>` 标签，自动回退使用 `<mip-img>` 的 `src` 属性。

`<source>` 标签的用法与 `<picture>` 中的 `<source>` 用法相同，但是并不需要 `<picture>` 标签。下面例子中 `<source>` 使用了 `type` 属性和 `media` 属性，当浏览器支持 webp 格式并且视窗宽度小于 600px 时会选择加载第一个 `<source>` 地址中的资源。如果不符合条件，浏览器继续向下检查 `<source>`，直到命中其中一条。如果都不符合，则使用 `<mip-img>` 的 `src` 地址加载资源。

相关规范见：[<picture>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)和 [<source>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source)。

```html
<mip-img
  width="350"
  height="263"
  popup
  src="https://www.mipengine.org/static/img/sample_01.jpg">
  <source srcset="http://boscdn.bpc.baidu.com/v1/assets/mipengine/1.webp" type="image/webp" media="(max-width: 600px)">
  <source srcset="http://boscdn.bpc.baidu.com/v1/assets/mipengine/2.webp" type="image/webp">
</mip-img>
```

## 属性

### width

说明：宽度，不是实际宽度，与高度属性配合来设置图片比例，详见[组件布局](../../docs/style-and-layout/layout.md)  
必选项：否  
类型：数字  
单位：无  
默认值：无

### height

说明：高度，不是实际高度，与宽度属性配合来设置图片比例，详见[组件布局](../../docs/style-and-layout/layout.md)  
必选项：否  
类型：数字  
单位：无  
默认值：无

### src

说明：图片地址	  
必选项：是  
格式：字符串

### popup

说明：设置图片资源是否可以在被点击后弹出全屏浮层查看  
必选项：否  
取值：无

### alt

说明：与 `<img>` 标签的 `alt` 属性相同  
必选项：否

### class

说明：与 `<img>` 标签的 `class` 属性相同，用于标识元素，设置元素样式	  
必选项：否
