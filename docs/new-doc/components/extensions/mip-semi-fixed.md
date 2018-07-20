# mip-semi-fixed 滑动悬浮组件 

`position:sticky` 的 `JS` 兼容版本。页面元素滑动到顶部时自动贴顶。  

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-semi-fixed/mip-semi-fixed.js

## 示例

### 基本用法

```html
<mip-semi-fixed id="semi-fixed" fixedClassNames="fixedStyle">
    <div mip-semi-fixed-container class="absoluteStyle">
        距离顶部0px时自动贴顶 magic
    </div>
</mip-semi-fixed>
<!--以下为占位符，仅用于查看组件效果-->
<div class="placeholder">小毛驴滴滴答答，</div>
<div class="placeholder">倚天剑伴我走天涯。 </div>
<div class="placeholder">大家都说我因为爱着杨过大侠，</div>
<div class="placeholder">才在峨眉山上出了家， </div>
<div class="placeholder">其实我只是爱上了峨眉山上的云和霞，</div>
<div class="placeholder">像极了十六岁那年的烟花。</div>
```

### 设置 `fixed` 时距离页面顶部的阈值

```html
<mip-semi-fixed id="semi-fixed2" threshold="100" fixedClassNames="fixedStyle">
	<div mip-semi-fixed-container class="absoluteStyle">
	    距离顶部100px时停下
	</div>
</mip-semi-fixed>
<!--以下为占位符，仅用于查看组件效果-->
<div class="placeholder">小毛驴滴滴答答，</div>
<div class="placeholder">倚天剑伴我走天涯。 </div>
<div class="placeholder">大家都说我因为爱着杨过大侠，</div>
<div class="placeholder">才在峨眉山上出了家， </div>
<div class="placeholder">其实我只是爱上了峨眉山上的云和霞，</div>
<div class="placeholder">像极了十六岁那年的烟花。</div>
```

## 属性

### threshold

说明：元素 `fixed` 状态时距离页面顶部的距离  
必选项：否  
类型：整数  
取值范围：无  
单位：无  
默认值：0

### fixedClassNames

说明：元素 `fixed` 状态时需要添加的类  
必选项：否  
类型：字符串   
取值范围：无  
单位：无  
默认值：''  

## 子节点

### div[mip-semi-fixed-container]  

说明：所有 HTML 需要放在这个节点中  
必选项：是  
类型：DOM 节点  
取值范围：无  
单位：无  
默认值：div[mip-semi-fixed-container]  