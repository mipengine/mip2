# mip-sidebar 侧边栏

侧边栏组件，点击按钮，侧边栏滑入屏幕。

标题|内容
----|----
类型|通用
支持布局| N/S
所需脚本|https://c.mipcdn.com/static/v1/mip-sidebar/mip-sidebar.js

## 示例

### 基本使用

```html
<header>
    <div id="logo" on="tap:sidebar.open">Open mip-sidebar</div>
</header>
<mip-sidebar 
    id="sidebar"
    layout="nodisplay"
    class="mip-hidden">
    <ul>
        <li>
            <a href="https://www.mipengine.org/">MIP官网</a>
            <button on="tap:sidebar.close"> X </button>
        </li>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>
            Nav item 4 - Image
            <mip-img
                src="https://www.mipengine.org/favicon.ico"
                width="32"
                height="32"
                alt="mipengine ico"></mip-img>
        </li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
    </ul>
</mip-sidebar>
```

### 右侧侧边栏

```html
<header>
    <div id="logo" on="tap:right-sidebar.open">Open mip-sidebar</div>
</header>
<mip-sidebar 
    id="right-sidebar"
    layout="nodisplay"
    side="right"
    class="mip-hidden">
    <ul>
        <li>
            <a href="https://www.mipengine.org/">MIP官网</a>
            <button on="tap:right-sidebar.close"> X </button>
        </li>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>
            Nav item 4 - Image
            <mip-img
                src="https://www.mipengine.org/favicon.ico"
                width="32"
                height="32"
                alt="mipengine ico"></mip-img>
        </li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
        <li>placeholder</li>
    </ul>
</mip-sidebar>
```

## 属性

### id

说明：id    
必填：是    
格式：字符串      
单位：无   
默认值：无  
使用限制：无

### layout

说明：布局设定    
必填：是    
格式：字符串      
单位：无   
取值：`nodisplay`

### side

说明：侧边栏位置设定，左边或者右边   
必填：否    
格式：字符串      
单位：无   
取值：`left`, `right`  
默认值：`left`
