# mip-anim 动图

用来支持在 MIP 页中 GIF 图的使用。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fixed, container
所需脚本|https://c.mipcdn.com/static/v1/mip-anim/mip-anim.js

## 示例

### 带 `placeholder` 的加载方式

```html
<mip-anim layout="fixed" width=210 height=210 src="https://www.mipengine.org/static/img/sample_gif.gif" alt="an animation">
   <mip-img class="background" layout="fixed-height" width=210 height=210 src="https://www.mipengine.org/static/img/sample_mip_logo.png"></mip-img>
</mip-anim>
```

### 只有 GIF 图

```html
<mip-anim layout="fixed" width=210 height=210 src="https://www.mipengine.org/static/img/sample_gif.gif" alt="an animation"></mip-anim>
```

## 属性

### src

说明：图片路径  
必选项：是  
类型：字符串  
取值范围：URL
