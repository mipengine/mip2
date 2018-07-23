# mip-history 历史记录

封装了对历史记录的操作，实现页面间前进后退的功能。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-history/mip-history.js

## 示例

### 基本用法
```html
<mip-history history="go, -1" class="mip-history-default">
	go, -1
</mip-history>
<mip-history history="go, -2" class="mip-history-default">
	go, -2
</mip-history>
<mip-history history="go, 1" class="mip-history-default">
	go, 1
</mip-history>
<mip-history history="go" class="mip-history-default">
	go
</mip-history>
<mip-history history="back" class="mip-history-default">
	back
</mip-history>
<mip-history history="forward" class="mip-history-default">
	forward
</mip-history>
```

### 为 `<mip-history>` 按钮使用布局

示例中的 `width` 和 `height` 不一定为最终渲染高度，请参考阅读[组件布局](../layout.md)。

```html
<!--宽高比3：1-->
<mip-history history="go, -1" class="mip-history-default"
	layout="responsive" width="3" height="1">
	go, -1
</mip-history>
<!--定高30px-->
<mip-history history="go, -1" class="mip-history-default"
	layout="fixed-height" width="30">
	go, -1
</mip-history>
```

## 属性

### history

说明：填入对历史记录的操作方式，支持 `go`, `back`, `forward`
必选项：是
类型：字符串
取值范围：`back`, `forward`, `"go, -1"`

## 注意事项
1. `mip-history` 的操作相当于对 `window.history` 的封装。使用方法可参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/History)。
2. `.mip-history-default`定义了方便预览的点击的样式，没有绑定事件，可选择性使用。
