# mip-lightbox 弹出层

由用户控制展现或关闭的全屏浮层组件，组件全屏覆盖。

标题|内容
----|----
类型|通用
支持布局|N/A
所需脚本|https://c.mipcdn.com/static/v1/mip-lightbox/mip-lightbox.js

## 示例

### 基本使用

```html
<button on="tap:my-lightbox.toggle" id="btn-open" role="button" tabindex="0">
    Open lightbox
</button>

<mip-lightbox
    id="my-lightbox"
    layout="nodisplay"
    class="mip-hidden">
    <div class="lightbox">
        <h1>Hello, World!</h1>
        <p> this is the lightbox</p>
        <span on="tap:my-lightbox.toggle" class="lightbox-close">关闭弹层</span>
    </div>
</mip-lightbox>
```

### 配置内容区可滚动

可用于展示搜索结果，用户协议等长内容。添加 `content-scroll` 属性可配置内容滚动。

```html
<button on="tap:my-lightbox2.toggle" id="btn-open" role="button" tabindex="0">
    打开用户协议
</button>

<mip-lightbox
    id="my-lightbox2"
    layout="nodisplay"
    class="mip-hidden"
    content-scroll>
    <div class="lightbox">
        <span on="tap:my-lightbox2.toggle" class="lightbox-close">忽略</span>
        <h1>Hello, World!</h1>
        <p> this is the lightbox</p>
        <p> this is the lightbox</p>
        <p> this is the lightbox</p>
        <p> this is the lightbox</p>
        <p> this is the lightbox</p>
        <p> this is the lightbox</p>
        <span on="tap:my-lightbox2.toggle" class="lightbox-close">我知道了</span>
    </div>
</mip-lightbox>
```

### 自动关闭

[notice] 此属性与 `class` 为 `mip-lightbox-seconds` 的标签配套使用

```html
<button on="tap:my-lightbox3.toggle" id="btn-open" role="button" tabindex="0">
    Open lightbox
</button>

<mip-lightbox
    autoclosetime="5"
    id="my-lightbox3"
    layout="nodisplay"
    class="mip-hidden">
    <div class="lightbox">
        <h1>Hello, World!</h1>
        <p> this is the lightbox</p>
        <div class="mip-lightbox-countdown">倒计时<span class="mip-lightbox-seconds"></span>秒关闭</div>
    </div>
</mip-lightbox>
```

## 属性

### id

说明：组件 `id`    
必选项：是    
类型：字符串  

### layout

说明：布局  
必选项：是    
类型：字符串    
取值：`nodisplay` 

### autoclose

说明：自定义倒计时，自动关闭，需要与 `class="mip-lightbox-seconds"` 的标签配套使用，`class="mip-lightbox-countdown"` 的标签可自定义倒计时样式及文字内容  
必选项：否    
类型：字符串    
取值：数字，单位秒

### content-scroll
说明：配置内容区域可以滚动，如果不填则内容不可滚动。  
必选项：否      

## 注意事项

- `<mip-lightbox>` 默认是隐藏的，作为打开开关的 DOM 节点需设置 `on` 属性，且 `on` 属性的属性值为 "tap:组件ID.open"。

- `<mip-lightbox>` 需要一个 `<div>` 子节点，这个 `<div>` 的 `calss` 必须有 `lightbox`，并且必须有 `on` 属性，属性值为 "tap:组件ID.close"。 

- 依赖 mipmain 最低版本为 1.1.2。
