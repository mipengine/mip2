# mip-sample

mip-sample 实现了一个简单的卡牌元素，手指滑过卡牌时可向滑动方向翻牌。

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-sample/mip-sample.js

## 示例

### 单卡牌式
```html
<mip-sample delay="100" duration="1000">
    <div class="mip-sample-front">正面内容</div>
    <div class="mip-sample-back">反面内容</div>
</mip-sample>
```

### 多卡牌式

可支持多张卡牌，最后一张为不可翻卡牌。

```html
<mip-sample duration="1000">
    <div class="mip-sample-list">第一张</div>
    <div class="mip-sample-list">第二张</div>
    <div class="mip-sample-list">第三张</div>
    <div class="mip-sample-list">第四张</div>
    <div class="mip-sample-list">第五张</div>
    <div class="mip-sample-list">第六张</div>
    <div class="mip-sample-list">第七张</div>
    <div class="mip-sample-list">第八张</div>
    <div class="mip-sample-list">第九张</div>
    <div class="mip-sample-list mip-sample-list-last">最后一张</div>
</mip-sample>
```

### mip-img

可支持多张卡牌，最后一张为不可翻卡牌。

```html
<mip-img width="350" height="263"
    class="mip-img" 
    popup 
    alt="baidu mip img" 
    src="http://ztd00.photos.bdimg.com/ztd/w%3D350%3Bq%3D70/sign=e3bb1c4b97ef76c6d0d2fd2ead2d8cc7/f703738da9773912b57d4b0bff198618367ae205.jpg">
</mip-img>
<p class="mip-img-subtitle">带图片标题的类型</p>
<mip-img  layout="responsive" width="350" height="263"
    class="mip-img" 
    popup 
    alt="baidu mip img" 
    src="http://ztd00.photos.bdimg.com/ztd/w%3D350%3Bq%3D70/sign=e3bb1c4b97ef76c6d0d2fd2ead2d8cc7/f703738da9773912b57d4b0bff198618367ae205.jpg">
</mip-img>
<p class="mip-img-subtitle">带图片标题的类型</p>
<mip-img layout="responsive" width="350" height="263"
    class="mip-img" 
    popup 
    alt="baidu mip img" 
    src="http://ztd00.photos.bdimg.com/ztd/w%3D350%3Bq%3D70/sign=e3bb1c4b97ef76c6d0d2fd2ead2d8cc7/f703738da9773912b57d4b0bff198618367ae205.jpg">
</mip-img>
```

## 属性

### delay

说明：延迟翻转  
必选项：否  
类型：数字  
取值范围：>0  
单位：毫秒(ms)  
默认值：0

### duration

说明：动画持续时间  
必选项：否  
类型：数字  
取值范围：>0  
单位：毫秒(ms)  
默认值：400  

## 注意事项  

1、单卡牌与多卡牌有冲突。  
2、mip-sample-list-last 的作用是翻牌时保留最后一张，不加也不会有问题。
