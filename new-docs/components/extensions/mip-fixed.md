# mip-fixed 悬浮布局

悬浮元素整体使用方案。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v1/mip-fixed/mip-fixed.js

## 示例

### 顶部悬浮

```html
<mip-fixed type="top">
    自定义内容，可以嵌套其他组件
</mip-fixed>
```

### 顶部悬浮 - 向下滑动隐藏

```html
<mip-fixed type="top" data-slide>
    顶部悬浮 - 向下滑动隐藏
</mip-fixed>
```

### 顶部悬浮 - 自动隐藏距离

```html
<!-- 以下代码只是示例 -->
<style>
    /*元素顶部距离*/
    .mip-fixed-top {
        top: 300px !important;
    }
    /*自定义元素隐藏时动画*/
    .mip-fixed-test-top {
        -webkit-transform: translate3d(0, -400px, 0);
                transform: translate3d(0, -400px, 0);
    }
</style>

<mip-fixed type="top" data-slide="mip-fixed-test-top" class="mip-fixed-top">
    顶部悬浮 - 自动隐藏距离
</mip-fixed>
```

### 底部悬浮

```html
<mip-fixed type="bottom">
    自定义内容，可以嵌套其他组件
</mip-fixed>
```

### 左边悬浮

规则：属性 `bottom` 或 `top` 必须有一个

```html
<mip-fixed type="left" bottom="50px">
    自定义内容，可以嵌套其他组件
</mip-fixed>
```

### 右边悬浮

规则：属性 `bottom` 或 `top` 必须有一个

```html
<mip-fixed type="right" top="50px">
    自定义内容，可以嵌套其他组件
</mip-fixed>
```

### 支持 `<mip-gototop>`

```html
<mip-fixed type="gototop">
    <mip-gototop></mip-gototop>
</mip-fixed>
```

### 关闭悬浮元素的方法

1. 给 `<mip-fixed>` 标签添加一个自定义的 `id=customid`。

2. 给需要点击关闭悬浮元素的标签添加属性 `on="tap:customid.close"`。

```html
<mip-fixed type="top" id="customid">
  <div>我是顶部的fixed</div>
  <div  class="btn_style" on="tap:customid.close">我是关闭按钮</div>
</mip-fixed>
```

## 属性

### type

说明：悬浮类型  
必选项：是  
类型：字符串  
取值范围：`top/bottom/right/left`

### top

说明：距离屏幕顶部距离  
必选项: 否  
类型：字符串  
取值范围：数值+单位，例如：`50(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)`  
默认值：`auto`

### bottom

说明：距离屏幕底部距离  
必选项: 否  
取值范围：数值+单位，例如：`50(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)`  
默认值：`auto`

### data-slide

说明：屏幕向下滑动时元素添加 `class` 名称去隐藏元素，元素已经添加 `transition: transform .5s` ，只需要向对应的类添加 `transform` 即可，只支持 `type="top"` 和 `type="bottom"`  
必须项：否  
默认值：`type="top"` 时默认取值 `mip-fixed-hide-top`（`translate3d(0, -200%, 0)`） ，`type="bottom"` 时默认取值 `mip-fixed-hide-bottom`（`translate3d(0, 200%, 0)`）  

### still

说明：不需要移动到 fixedLayer 中  
必选项: 否

## 注意事项

### 悬浮类型

- `type` 为 `top`, `bottom` 类别不需要添加属性：`top/bottom`。

- `type` 为 `left`, `right` 类别需要至少添加一个 `top/bottom` 属性，优先用 `bottom`。

- `type` 为 `gototop` 类别不需要任何属性。

### 不需要滚动的场景

为了解决 iOS iframe 中滚动场景下的 fixed 问题，默认我们会将所有 `<mip-fixed>` 元素移动到原始 `<body>` 的兄弟节点（fixedLayer）中。由于发生了节点移动，在开发过程中会带来一些问题，[详见](https://github.com/mipengine/mip2/issues/90)。

所以如果 `<mip-fixed>` 不需要在滚动中保持 fixed，例如常见的对话框场景，可以加上 `still` 属性显式声明不需要移动节点。代码示例如下：

```html
// 处于 iOS 下 iframe 中不会发生节点移动
<mip-fixed type="top" still>  
</mip-fixed>
```