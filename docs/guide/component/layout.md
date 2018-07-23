# 组件布局

MIP 组件支持的各种布局，可以让图片屏幕自适应、定高等。用于预先给组件确定占位，防止组件内容加载后撑开页面，造成页面内容抖动，浏览器重排重绘，简称为 `layout` 。

## 支持的布局种类

类别|强制 width|强制 height|详细说明
---|---|---|---
responsive | 是 | 是 | 能够根据 `width`、`height` 的值，算出元素对应的比例，在不同屏幕宽度上做自适应，非常适合图片、视频等需要大小自适应的组件
fixed-height | 否 | 是 | 元素的高度固定，`width` 缺省或者取值为 `auto` ，比较适合 [mip-carousel](../extensions/builtin/mip-carousel.md)
fixed | 是 | 是 | 元素根据 `width` 和 `height` 固定高宽，不随屏幕宽度变化
flex-item | 否 | 否 | 元素通过 `flex` 进行布局，需设置父元素为 `display: flex`
fill | 否 | 否 | 元素的大小根据父节点的大小自动撑开
container | 否 | 否 | 元素的高度由子节点高度决定，相当于 `display: block`
nodisplay | 否 | 否 | 元素不展现，即 `display: none` ，这种元素可由用户点击触发显示，也可以应用于统计组件

## 使用方法

MIP 元素添加属性 `layout`，取值参照上面的种类，如：

```html
<mip-img
  layout="responsive"
  width="350"
  height="263"
  src="/doc/image/layout/img.jpg">
</mip-img>
```

## layout 详解

### 1. responsive

- 布局介绍：使用 `layout="responsive"` 的组件能够根据 `width`、`height` 的值，算出元素对应的比例，在不同屏幕宽度上做自适应。
- 适用场景：[图片](./builtin/mip-img.md)、[视频](./builtin/mip-video.md)、[图片轮播](./builtin/mip-carousel.md)等需要按比例自动缩放的元素。
- 代码示例：

```html
<mip-img
  layout="responsive"
  width="350"
  height="263"
  src="/doc/image/layout/img.jpg">
</mip-img>
```

- 使用效果：

```html
<mip-video controls loop layout="fixed-height" height="350" class="white-bg"
  src="/doc/image/layout/responsive.mp4"
  poster="/doc/image/layout/responsive.png">
</mip-video>
```

### 2. fixed-height

- 布局介绍：使用 `layout="fixed-height"` 的组件高度固定，不随屏幕大小变化。`width` 缺省或者取值为 `auto` 。
- 适用场景：高度固定的[广告位](../extensions/mip-ad/mip-ad.md)、[音频播放组件](../extensions/extensions/mip-audio.md)、[mip-fixed悬浮组件](../extensions/extensions/mip-fixed.md)。
- 代码示例：

```html
<mip-img
  layout="fixed-height"
  height="263"
  src="/doc/image/layout/img.jpg">
</mip-img>
```

- 使用效果：

```html
<mip-video controls loop layout="fixed-height" height="350" class="white-bg"
  src="/doc/image/layout/fixed-height.mp4"
  poster="/doc/image/layout/fixed-height.png">
</mip-video>
```

### 3. fixed

- 布局介绍：使用 `layout="fixed"` 的组件宽高固定，根据 `width` 和 `height` 取值（px）固定宽高，元素尺寸不随屏幕大小变化。
- 适用场景：头像[图片](../extensions/builtin/mip-img.md)、[表情GIF](../extensions/extensions/mip-anim.md)、[后退按钮](../extensions/extensions/mip-history.md) 等有固定大小的元素。
- 代码示例：

```html
<mip-img
  layout="fixed"
  width="350"
  height="263"
  src="/doc/image/layout/img.jpg">
</mip-img>
```

- 使用效果：

```html
<mip-video controls loop layout="fixed-height" height="350" class="white-bg"
  src="/doc/image/layout/fixed.mp4"
  poster="/doc/image/layout/fixed.png">
</mip-video>
```

### 4. flex-item

- 布局介绍：使用 `layout="flex-item"` 的组件通过 `flex` 进行布局，需设置父元素为 `display: flex` ，元素的大小根据父节点的大小自动撑开。
- 适用场景：多图横向排列，左右内容对比布局。
- 代码示例：

```html
<style>
  #container {
    display: flex;
    height: 200px;
  }
</style>
<section id="container">
  <mip-img layout="flex-item" src="/doc/image/layout/img.jpg"></mip-img>
  <mip-img layout="flex-item" src="/doc/image/layout/img.jpg"></mip-img>
  <mip-img layout="flex-item" src="/doc/image/layout/img.jpg"></mip-img>
</section>
```

- 使用效果：

```html
<mip-video controls loop layout="fixed-height" height="350" class="white-bg"
  src="/doc/image/layout/flex-item.mp4"
  poster="/doc/image/layout/flex-item.png">
</mip-video>
```

### 5. fill

- 布局介绍：使用 `layout="fill"` 的元素的大小根据父节点的大小自动撑开。
- 适用场景：铺满父元素的背景图片。
- 代码示例：

```html
<style>
  .container {
    position: relative;
    height: 300px;
    width: 80%;
  }
</style>
<section class="container">
  <mip-img
    layout="fill"
    src="img.jpg">
  </mip-img>
</section>
```

- 使用效果：

```html
<mip-video controls loop layout="fixed-height" height="350" class="white-bg"
  src="/doc/image/layout/fill.mp4"
  poster="/doc/image/layout/fill.png">
</mip-video>
```

### 6. container

- 布局介绍：使用 `layout="container"` 的元素的大小根据子节点的大小自动撑开，相当于 `display: block` 。
- 适用场景：内容高度不固定的[表单](../extensions/extensions/mip-form.md)，[无限滚动](../extensions/extensions/mip-infinitescroll.md)组件。
- 代码示例：

```html
<mip-history history="go, -1" layout="container">
  我说你是人间的四月天；笑声点亮了四面风；轻灵在春的光艳中交舞着变。你是四月早天里的云烟，黄昏吹着风的软，星子在无意中闪，细雨点洒在花前。那轻，那娉婷，你是，鲜妍百花的冠冕你戴着，你是天真，庄严，你是夜夜的月圆。
</mip-history>
<script src="https://c.mipcdn.com/static/v1/mip-history/mip-history.js"></script>
```

- 使用效果：

```html
<mip-video controls loop layout="fixed-height" height="350" class="white-bg"
  src="/doc/image/layout/container.mp4"
  poster="/doc/image/layout/container.png">
</mip-video>
```

### 7. nodisplay

- 布局介绍：使用 `layout="nodisplay"` 的元素不展现，即 `display: none` 。隐藏元素可由用户点击触发显示，也可以应用于统计组件。
- 适用场景：不需要显示在页面上的[mip-pix统计](../extensions/builtin/mip-pix.md)、[mip-analytics统计](../extensions/extensions/mip-analytics.md)、[百度统计](../extensions/extensions/mip-stats-baidu.md)组件，由用户点击触发的[mip-lightbox弹框](../extensions/extensions/mip-lightbox.md)组件。
- 代码示例：

```html
<button on="tap:L1.toggle" id="btn-open" class="lightbox-btn">
  打开弹层
</button>
<mip-lightbox layout="nodisplay" class="mip-hidden" id="L1">
  <div class="lightbox">
    <span on="tap:L1.toggle" class="lightbox-btn">关闭弹层</span>
  </div>
</mip-lightbox>
```

- 使用效果：

```html
<mip-video controls loop layout="fixed-height" height="350" class="white-bg"
  src="/doc/image/layout/nodisplay.mp4"
  poster="/doc/image/layout/nodisplay.png">
</mip-video>
```

## layout 属性缺省规则

width | height |其他属性|默认布局
---|---|---|---
有 | 有| 无 | fixed
有 | 有 | 存在 `sizes` 参数| responsive
无或取值为 `auto` | 有 | 无 | fixed-height
无 | 无 | 无 | container

## layout 默认值

所有 MIP 元素都会有 `layout` 。移动端的设计大部分是块状的，默认的 `layout` 是 `container` 。如果有其它的样式需求，如 `inline`、`inline-block`。可通过 CSS 样式覆盖的方式修改元素 `display` 属性。
