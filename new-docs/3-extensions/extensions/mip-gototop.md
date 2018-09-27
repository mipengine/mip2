# mip-gototop 快速回顶

添加快速回顶按钮，点击回到页面顶部。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v1/mip-gototop/mip-gototop.js

## 示例

### 基本使用

```html
<mip-fixed type="gototop">
    <mip-gototop></mip-gototop>
</mip-fixed>
```

### 设置阈值

```html
<mip-fixed type="gototop">
    <mip-gototop threshold='300'></mip-gototop>
</mip-fixed>
```

## 属性

说明：显示按钮时页面已经滚动的高度    
必选项: 否  
取值范围：数值  
单位：无     
默认值：200
