# mip-carousel 多图轮播

`<mip-carousel>` 用来支持 MIP 中图片的一种展示方式，支持多图轮播，支持子元素是 `div` 或任意元素。

标题|内容
----|----
类型|通用
支持布局|fixed-height,responsive
所需脚本|无

## 示例

### responsive 布局

```html
<mip-carousel
    layout="responsive"
    width="720"
    height="405">
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>
</mip-carousel>
```

### 自动轮播

```html
<mip-carousel
    autoplay
    layout="responsive"
    width="700"
    height="405">
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>

</mip-carousel>
```

### 设置轮播时间间隔

```html
<mip-carousel
    autoplay
    defer="1000"
    layout="responsive"
    width="720"
    height="405">
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>

</mip-carousel>
```

### 加数字指示器

```html
<mip-carousel
    autoplay
    defer="1000"
    layout="responsive"
    width="720"
    height="405"
    indicator
    >
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>

</mip-carousel>
```

### 加下方指示器

```html
<mip-carousel
    autoplay
    defer="1000"
    layout="responsive"
    width="720"
    height="405"
    indicator
    indicatorId="mip-carousel-example"
    >
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>

</mip-carousel>
<div class="mip-carousel-indicator-wrapper">
    <div class="mip-carousel-indicatorDot" id="mip-carousel-example">
        <div class="mip-carousel-activeitem mip-carousel-indecator-item"></div>
        <div class="mip-carousel-indecator-item"></div>
        <div class="mip-carousel-indecator-item"></div>
    </div>
</div>
```

### 加翻页按钮

```html
<mip-carousel
    defer="1000"
    layout="responsive"
    width="720"
    height="405"
    indicator
    buttonController
    >
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>

</mip-carousel>
```

### 加副标题

```html
<mip-carousel
    autoplay
    defer="1000"
    layout="responsive"
    width="720"
    height="405"
    indicator
    buttonController
    >
    <a target="_blank" href="http://wenda.tianya.cn/m/question/1almfj0foas94gc7vtoq6ejbfbmdk3e78ehaa">
        <mip-img
            src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg" layout="responsive"
        width="720"
        height="405">
        </mip-img>
        <div class="mip-carousle-subtitle">这里是title2</div>
    </a>
    <mip-img
        layout="responsive"
        width=720
        height=405
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        layput="responsive"
        width=720
        height=405
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>
</mip-carousel>
```

### 点击图片跳转

非 `<mip-carousel>` 直接子级元素的 `<mip-img>` 节点需要设置 `width` 和 `height` 属性。

```html
<mip-carousel
    autoplay
    defer="1000"
    layout="responsive"
    width="720"
    height="405">
    <mip-img
        layout="responsive"
        width=720
        height=405
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <a target="_blank" href="http://wenda.tianya.cn/m/question/1almfj0foas94gc7vtoq6ejbfbmdk3e78ehaa">
        <mip-img
            src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg" width="720" height="405" layout="responsive">
        </mip-img>
    </a>
    <mip-img
        layout="responsive"
        width=720
        height=405
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>
</mip-carousel>
```

### 方法 go 使用

```html
<mip-carousel
    id="simple-carousel"
    layout="responsive"
    width="720"
    height="405">
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg">
    </mip-img>
    <mip-img
        width="720"
        height="405"
        layout="responsive"
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>
</mip-carousel>
<div>
    <button on="tap:simple-carousel.go(1)">点击展现第 1 页</button>
    <button on="tap:simple-carousel.go(2)">点击展现第 2 页</button>
    <button on="tap:simple-carousel.go(3)">点击展现第 3 页</button>
</div>
```

### 自定义处理翻页事件

每次翻页时，mip-carousel 会对外暴露 switchCompleted 事件，事件被触发时，在你自己的组件内处理对应的逻辑即可。可以通过[Events 事件绑定](../../basic/actions-and-events.md)章节了解更多事件通信的处理细节。

在下面的例子中，轮播图每切换一次图片，都会在下方文案显示当前图片的索引值（index），通过 `switchCompleted` 所抛出的参数 `event.currIndex` 获取：

```html
<mip-carousel
    autoplay
    defer="1000"
    layout="responsive"
    width="720"
    height="405"
    on="switchCompleted:MIP.setData({ index: event.currIndex })"
    >
    <mip-img
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-01.jpg">
    </mip-img>
    <a target="_blank" href="http://wenda.tianya.cn/m/question/1almfj0foas94gc7vtoq6ejbfbmdk3e78ehaa">
        <mip-img
            src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-02.jpg" width="720" height="405" layout="responsive">
        </mip-img>
    </a>
    <mip-img
        src="https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/static/example-03.jpg">
    </mip-img>
</mip-carousel>
<div m-text="'当前显示的图片 index: ' + index"></div>
```

## 属性

### width

说明：宽度，不是实际宽度，与高度属性配合来设置图片比例，详见[组件布局](../../guide/component/layout.md)
必选项：是  
类型：数字  
单位：无  
默认值：无

### height

说明：高度，不是实际高度，与宽度属性配合来设置图片比例，详见[组件布局](../../guide/component/layout.md)
必选项：是  
类型：数字  
单位：无  
默认值：无

### autoplay

说明：自动轮播开关  
必选项：否  
类型：字符串或空  
取值："", `autoplay`  
单位：无  
默认值：无

### defer

说明：每次轮播的时间间隔，如果设置了 `autoplay`，可以添加 `defer` 来指定轮播的时间间隔  
必选项：否  
类型：数字  
单位：ms  
默认值：2000

### indicator

说明：下方默认提供的数字指示器。  
必选项：否  
类型：字符串 或空 
取值："", `indicator`
单位：无  
默认值：无

### indicatorId

说明：下方指示器功能字段，和指示器的父节点的 `id` 取值请保持一致，指示器的个数和轮播的 `item` 个数必须保持一致，指示器这块对 `id` 是强依赖，样式可以自行修改，示例中是官方默认样式，指示器可点击定位。  
必选项：否  
类型：字符串  
单位：无  
默认值：无

### buttonController

说明：翻页按钮功能字段，使用这个字段之后，轮播页左右侧会出现前进后退的翻页按钮，点击可执行相应的操作。  
必选项：否  
类型：字符串或空 
取值："", `buttonController`
单位：无  
默认值：无

### index

说明：指定轮播图从哪一张开始。  
必选项：否  
类型：数字  
取值：整数  
单位：无  
默认值：1  

### autoheight

说明：实现轮播图的宽度为 100%，而高度是自适应的，即根据图片来更改轮播图的高度。  
必选项：否  
类型：字符串或空  
取值："", autoheight  
单位：无  
默认值：无  

## 方法

### go

说明：使轮播图跳转到指定的第几张图
参数：一个参数，取值为整数，从 1 开始计数
返回值：无

## 事件

### switchCompleted

说明：当每一页切换完成之后，会触发该事件，并返回相关参数:

```js
// 当前显示的索引, 从 1 开始计数
event.currIndex

// 总的轮播图数
event.carouselChildrenLength
```
