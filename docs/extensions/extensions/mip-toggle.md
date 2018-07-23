# mip-toggle 显示隐藏

提供显示/隐藏元素的功能。

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-toggle/mip-toggle.js

## 示例

### 基本使用

你可以使用事件 `toggle`, `show` 或 `hide` 以控制 `mip-toggle` 组件的显示与隐藏。

```html
<button on="tap:my-mip-toggle-1.toggle">显示/隐藏</button>
<button on="tap:my-mip-toggle-1.show">显示</button>
<button on="tap:my-mip-toggle-1.hide">隐藏</button>
<mip-toggle id="my-mip-toggle-1">
    <p>lorem ipsum</p>
</mip-toggle>
```

### 自动隐藏

你可以设置自定义隐藏时间，在显示了指定时间后它将会被自动隐藏。注意这仅对 `show` 生效。

```html
<button on="tap:my-mip-toggle-2.toggle">显示/隐藏</button>
<button on="tap:my-mip-toggle-2.show">显示</button>
<button on="tap:my-mip-toggle-2.hide">隐藏</button>
<mip-toggle id="my-mip-toggle-2" hidetimeout="500" layout="nodisplay">
    <p>lorem ipsum</p>
</mip-toggle>
```

### 自定义 display

你可以自定义显示时的 display 以实现特殊需求。

```html
<button on="tap:my-mip-toggle-3.toggle">显示/隐藏</button>
<p>
    <mip-toggle id="my-mip-toggle-3" display="inline">lorem ipsum</mip-toggle> dolor sit amet
</p>
```

### 自动隐藏（事件级别）

你可以通过 `show` 的事件参数传入隐藏延迟以覆盖默认值。

```html
<button on="tap:my-mip-toggle-4.show(500)">显示500ms</button>
<button on="tap:my-mip-toggle-4.show(1000)">显示1s</button>
<button on="tap:my-mip-toggle-4.show(3000)">显示3s</button>
<button on="tap:my-mip-toggle-4.show(Infinity)">不自动隐藏（覆盖默认值）</button>
<mip-toggle id="my-mip-toggle-4" layout="nodisplay" hidetimeout="2000">
    <p>lorem ipsum</p>
</mip-toggle>
```

### 自定义动画

你可以在组件上申明 `enterclass` 以决定显示/隐藏时要增加/删除的 class。此时，元素的 `display` 将不再自动变化。

```html
<style>
.my-mip-toggle {
    transition: 2s opacity;
    opacity: 0;
}
.my-mip-toggle-enter {
    opacity: 1;
}
</style>
<button on="tap:my-mip-toggle-5.toggle">显示/隐藏</button>
<mip-toggle id="my-mip-toggle-5" enterclass="my-mip-toggle-enter" class="my-mip-toggle">
    <p>lorem ipsum</p>
</mip-toggle>
```

## 属性

### hidetimeout

说明：自动隐藏延时(ms)。当设置 hidetimeout 时，每次被 show 后，将会在指定时间后被自动隐藏。toggle 不受该参数影响。  
必选项：否  
类型：整数  
取值范围：0~Infinity  
默认值：Infinity

### display

说明：当元素被显示时，需要使用的 display 值。  
必选项：否  
类型：字符串  
取值范围：css display property  
默认值：block  

### enterclass

说明：当元素被显示时，使用的 class。注意设置该值之后，组件将不再设置 display。  
必选项：否  
类型：字符串  
取值范围：class  
默认值：无  
