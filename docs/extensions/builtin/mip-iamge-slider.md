# mip-image-slider 

`mip-image-slider` 是一种将两张 mip-img 图片对比的组件。用户可以点击或拖动移动条来比较图片。

标题|内容
----|----
类型|通用
支持布局|fixed-height,responsive
所需脚本|无

## 示例

### responsive 布局

```html
<mip-image-slider
    layout="responsive"
    width="600"
    height="400">
    <mip-img
        src="https://www.mipengine.org/static/img/sample_01.jpg">
    </mip-img>
    <mip-img
        src="https://www.mipengine.org/static/img/sample_02.jpg">
    </mip-img>
</mip-image-slider>
```

### 添加说明内容

```html
<mip-image-slider
    layout="responsive"
    width="600"
    height="400">
    <mip-img
        src="https://www.mipengine.org/static/img/sample_01.jpg">
    </mip-img>
    <mip-img
        src="https://www.mipengine.org/static/img/sample_02.jpg">
    </mip-img>
    <div first>这是第一</div>
    <div second>这是第二</div>
</mip-image-slider>
```


### 添加自定义箭头

```html
<style type="text/css">
.mip-image-slider-arrow-left {
	width: 10px;
    height: 20px;
    background-size: 10px 20px;
    margin-right: 10px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='10,0 0,10 10,20' style='fill:white' /%3e%3c/svg%3e")
}
.mip-image-slider-arrow-right {
	width: 10px;
    height: 20px;
    background-size: 10px 20px;
    margin-left: 10px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='0,0 10,10 0,20' style='fill:white' /%3e%3c/svg%3e")
}
</style>
<mip-image-slider
    layout="responsive"
    width="600"
    height="400">
    <mip-img
        src="https://www.mipengine.org/static/img/sample_01.jpg">
    </mip-img>
    <mip-img
        src="https://www.mipengine.org/static/img/sample_02.jpg">
    </mip-img>
</mip-image-slider>
```

### 初始化移动条的位置

```html
<mip-image-slider
    layout="responsive"
    width="600"
    height="400"
    initial-slider-position="0.2">
    <mip-img
        src="https://www.mipengine.org/static/img/sample_01.jpg">
    </mip-img>
    <mip-img
        src="https://www.mipengine.org/static/img/sample_02.jpg">
    </mip-img>
</mip-image-slider>
```

### 设置步幅大小

```html
<mip-image-slider
	tabindex="0"
    layout="responsive"
    width="600"
    height="400"
    step-size="0.2">
    <mip-img
        src="https://www.mipengine.org/static/img/sample_01.jpg">
    </mip-img>
    <mip-img
        src="https://www.mipengine.org/static/img/sample_02.jpg">
    </mip-img>
</mip-image-slider>
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

### disable-hint-reappear

说明：箭头提示在用户点击之后会消失，但是随着视口离开当前位置又返回，则箭头提示会重新出现，如果想要禁止这种效果，让箭头不再反复出现，可使用这个属性。
必选项：否  
类型：字符串或空  
取值："", `disable-hint-reappear`
单位：无  
默认值：无

### initial-slider-position

说明：移动条到初始位置。
必选项：否  
类型：数字  
取值：0-1
单位：无  
默认值：0

### step-size

说明：使用键盘左右箭头来移动移动条时的步幅。
必选项：否  
类型：数字  
取值：0-1
单位：无  
默认值：0.1

## API

### seekTo

说明：使移动条到指定位置

示例：  
```html
<mip-image-slider
    layout="responsive"
    width="600"
    height="400"
    initial-slider-position="0.2">
    <mip-img
        src="https://www.mipengine.org/static/img/sample_01.jpg">
    </mip-img>
    <mip-img
        src="https://www.mipengine.org/static/img/sample_02.jpg">
    </mip-img>
</mip-image-slider>
<div class="button-container">
	<button class="ampstart-btn"
	  on="tap:seekable.seekTo(percent=1)">展示第一张图</button>
	<button class="ampstart-btn"
	  on="tap:seekable.seekTo(percent=0)">展示第二张图</button>
</div>
```

## 注意事项

1. 说明文字的样式需要自定义设置，默认都是在左上角的（也就是没有样式）
2. 箭头提示的样式可以通过重写 `.mip-image-slider-arrow-left` 和 `.mip-image-slider-arrow-right` 来实现自定义
3. 使用键盘并设置步幅大小时，需要设置 `tabindex="0"` 并且使用键盘的 tab 键聚焦到这个组件，不然无法生效。
