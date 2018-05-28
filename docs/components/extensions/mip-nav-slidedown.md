# mip-nav-slidedown 菜单

响应式菜单，在 MIP 官网有引用。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-nav-slidedown/mip-nav-slidedown.js

## 示例
### 基本使用
```html
<div class="mip-nav-wrapper">
    <mip-nav-slidedown
        data-id="bs-navbar"
        class="mip-element-sidebar container"
        data-showbrand="1"
        data-brandname="MIP官网">
        <nav id="bs-navbar" class="navbar-collapse collapse navbar navbar-static-top">
            <ul class="nav navbar-nav navbar-right">
                <li>
                    <a href="//www.mipengine.org/">首页</a>
                </li>
                <li>
                    <a href="//www.mipengine.org/timeline.html">动态</a>
                </li>
                <li>
                    <a href="http://www.cnblogs.com/mipengine/">博客</a>
                </li>
                <li class="navbar-wise-close">
                    <span id="navbar-wise-close-btn"></span>
                </li>
            </ul>
        </nav>
    </mip-nav-slidedown>
</div>
```

### 导航菜单个数多
导航菜单个数较多时，菜单展开可以上下滚动。
```html
<div class="mip-nav-wrapper">
    <mip-nav-slidedown
        data-id="bs-navbar"
        class="mip-element-sidebar container"
        data-showbrand="1"
        data-brandname="MIP官网">
        <nav id="bs-navbar" class="navbar-collapse collapse navbar navbar-static-top">
            <ul class="nav navbar-nav navbar-right">
                <li><a href="//www.mipengine.org/">菜单1</a></li>
                <li><a href="//www.mipengine.org/">菜单2</a></li>
                <li><a href="//www.mipengine.org/">菜单3</a></li>
                <li><a href="//www.mipengine.org/">菜单4</a></li>
                <li><a href="//www.mipengine.org/">菜单5</a></li>
                <li><a href="//www.mipengine.org/">菜单6</a></li>
                <li><a href="//www.mipengine.org/">菜单7</a></li>
                <li><a href="//www.mipengine.org/">菜单8</a></li>
                <li><a href="//www.mipengine.org/">菜单9</a></li>
                <li><a href="//www.mipengine.org/">菜单10</a></li>
                <li><a href="//www.mipengine.org/">菜单11</a></li>
                <li class="navbar-wise-close">
                    <span id="navbar-wise-close-btn"></span>
                </li>
            </ul>
        </nav>
    </mip-nav-slidedown>
</div>
```

### 增加二级菜单
直接添加`<ul>`可以展现二级菜单效果。
```html
<div class="mip-nav-wrapper">
    <mip-nav-slidedown 
        data-id="bs-navbar"
        class="mip-element-sidebar container"
        data-showbrand="1"
        data-brandname="MIP官网">
        <nav id="bs-navbar" class="navbar-collapse collapse navbar navbar-static-top">
            <ul class="nav navbar-nav navbar-right">
                <li>
                    <a href="//www.mipengine.org/">首页</a>
                </li>
                <li>
                    <span class="navbar-more">常用工具</span>
                    <ul>
                        <li> <a href="//www.mipengine.org/">子菜单01</a> </li>
                        <li> <a href="//www.mipengine.org/">子菜单02</a> </li>
                        <li> <a href="//www.mipengine.org/">子菜单03</a> </li>
                        <li> <a href="//www.mipengine.org/">子菜单04</a> </li>
                    </ul>
                </li>
                <li>
                    <a href="//www.mipengine.org/timeline.html">动态</a>
                </li>
                <li>
                    <span class="navbar-more">下拉菜单</span>
                    <ul>
                        <li> <a href="//www.mipengine.org/">子菜单01</a> </li>
                        <li> <a href="//www.mipengine.org/">子菜单02</a> </li>
                        <li> <a href="//www.mipengine.org/">子菜单03</a> </li>
                        <li> <a href="//www.mipengine.org/">子菜单04</a> </li>
                    </ul>
                </li>
                <li class="navbar-wise-close">
                    <span id="navbar-wise-close-btn"></span>
                </li>
            </ul>
        </nav>
    </mip-nav-slidedown>
</div>
```

## 属性

### data-id  
说明：内部菜单 `id`  
必选项：是  
类型：字符串  

### data-showbrand  
说明：是否需要左上角显示可点击区域  
必选项：否  
类型：数字  
取值：0（不显示），1（显示）  
默认值：1

### data-brandname  
说明：左上角显示可点击区域文字，仅在 `data-showbrand=1` 时显示  
必选项：否  
类型：字符串，如 "MIP官网"  

### data-brandhref  
说明：左上角图标跳转链接，在 `data-showbrand` 为 1 时有效  
必选项：否  
类型：URL  
默认：'/'

## 注意事项
1. 一个页面内，只能存在一个下拉菜单，`data-id="bs-navbar"`。
