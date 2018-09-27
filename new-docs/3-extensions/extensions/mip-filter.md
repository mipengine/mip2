# mip-filter 筛选组件

筛选组件，自适应 PC 端和移动端宽度。`mipengine.org` 有引用。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-filter/mip-filter.js

## 示例

### 基本使用
筛选功能，支持从 hash 定位筛选项。

```html
<mip-filter
    mip-filter-filterWrap=".filter"
    mip-filter-itemWrap=".filter-item-wrap"
    mip-filter-enableHash="true">
    <sidebar class="filter">
        <div class="filter-result"></div>
        <ul class="filter-list">
            <li class="filter-title">
                <div class="filter-link" data-filtertype="all">(all)查看全部<span class="filter-num">3</span></div>
            </li>
            <li class="filter-title">
                <div class="filter-link" data-filtertype="widget">(widget)组件<span class="filter-num">2</span></div>
            </li>
            <li class="filter-title">
                <div class="filter-link" data-filtertype="layout">(layout)组件布局<span class="filter-num">1</span></div>
            </li>
        </ul>
    </sidebar>
    <div class="filter-item-wrap">
        <div class="filter-item" data-filtertype="widget">
            <span>(widget)组件新增</span>
        </div>
        <div class="filter-item" data-filtertype="layout">
            <span>(layout)广告组件 layout 升级</span> 
        </div>
        <div class="filter-item" data-filtertype="widget">
            <span>(widget)测试版发布</span>
        </div>
    </div>
</mip-filter>
```

### 自定义筛选文字
下方示例中，`mip-filter-filterText="您已经选择："`。

```html
<mip-filter 
    mip-filter-filterWrap=".filter"
    mip-filter-itemWrap=".filter-item-wrap"
    mip-filter-enableHash="true"
    mip-filter-filterText="您已经选择：">
    <sidebar class="filter">
        <div class="filter-result"></div>
        <ul class="filter-list">
            <li class="filter-title">
                <div class="filter-link" data-filtertype="all">(all)查看全部<span class="filter-num">3</span></div>
            </li>
            <li class="filter-title">
                <div class="filter-link" data-filtertype="widget">(widget)组件<span class="filter-num">2</span></div>
            </li>
            <li class="filter-title">
                <div class="filter-link" data-filtertype="layout">(layout)组件布局<span class="filter-num">1</span></div>
            </li>
        </ul>
    </sidebar>
    <div class="filter-item-wrap">
        <div class="filter-item" data-filtertype="widget">
            <span>(widget)组件新增</span>
        </div>
        <div class="filter-item" data-filtertype="layout">
            <span>(layout)广告组件 layout 升级</span> 
        </div>
        <div class="filter-item" data-filtertype="widget">
            <span>(widget)测试版发布</span>
        </div>
    </div>
</mip-filter>
```

## 属性

### mip-filter-filterWrap

说明：筛选按钮 DOM  
必选项：是  
类型：字符串  
取值：`document.querySelector()` 可填内容，如`".box"`  

### mip-filter-itemWrap

说明：筛选项 DOM  
必选项：是  
类型：字符串  
取值：`document.querySelector()` 可填内容，如`".box"`  

### mip-filter-enableHash

说明：是否支持 hash 控制  
必选项: 否 
类型：字符串  
取值：true, false  
默认值：true

### mip-filter-filterText

说明：筛选链接时，前面的文字。可以不填  
必选项：否 
类型：字符串  
取值：例如“筛选：”， “已选择”，“”  
