# mip-scrollbox

横向滑动组件，支持自动适合屏幕宽度、栅格化（12列和两端 `17px` 边距）等特性，常用于图片横滑、文本链接横滑等场景。

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-scrollbox/mip-scrollbox.js

## 示例

### 不换行文字链

```html
<style>
    .demo1 a {
        display: block;
        border: 1px solid #ccc;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        margin-right: 20px;
        border-radius: 5px;
        white-space: nowrap;
    }
    .demo1 [data-item]:last-child a {
        margin-right: 0;
    }
</style>
<mip-scrollbox class="demo1" height="32" layout="fixed-height">
    <div data-wrapper>
        <div data-inner>
            <div data-scroller>
                <div data-item>
                    <a href="https://www.baidu.com">百度一下，你就知道。</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">MIP 是移动网页加速器。</a>
                </div>
                <div data-item>
                    <a href="https://github.com/mipengine">MIP 的 GitHub 地址是： https://github.com/mipengine</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">点击查看更多精彩内容>></a>
                </div>
            </div>
        </div>
    </div>
</mip-scrollbox>
```

### 固定宽度换行链接

```html
<style>
    .demo2 [data-item] {
        width: 100px;
        border: 1px solid #ccc;
        margin-right: 10px;
        height: 100px;
        overflow: hidden;
    }
    .demo2 [data-item] a {
        display: block;
        height: 100px;
        padding: 0 3px;
        color: #555;
    }
    .demo2 [data-item]:last-child {
        margin-right: 0;
    }
</style>
<mip-scrollbox class="demo2" height="100" layout="fixed-height">
    <div data-wrapper>
        <div data-inner>
            <div data-scroller>
                <div data-item>
                    <a href="https://www.mipengine.org">使用 MIP 无需等待加载，页面内容将以更友好的方式瞬时到达用户。</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">MIP 提供实用、强大的基础组件，开发者可根据需求任意选择。</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">MIP 是一项永久的开源计划，提供持续优化的解决方案。</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">MIP 语法基于 HTML 并提供详细的示例，开发者仅需做简单开发。</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">MIP HTML 规范中有两类标签，一类是 HTML 常规标签，另一类是 MIP 标签。MIP 标签也被称作 MIP HTML 组件，使用它们来替代 HTML 常规标签可以大幅提升页面性能。</a>
                </div>
                <div data-item>
                    <a href="https://www.mipengine.org">用户在访问 MIP 页面的时候，请求首先会发到 CDN 服务器，如果页面存在，则从 CDN 返回，如果 CDN 上不存在，则会请求第三方服务器。同时 MIP-Cache 服务器会将页面缓存到 CDN 上。</a>
                </div>
            </div>
        </div>
    </div>
</mip-scrollbox>
```

### 栅格化
```html
<style>
    .demo3 [data-item] > div {
        height: 100px;
        background-color: #ccc;
    }
</style>
<mip-scrollbox data-type="row" class="demo3" layout="fixed-height">
    <div data-wrapper>
        <div data-inner>
            <div data-scroller>
                <div data-item>
                    <div>1的内容，span3</div>
                </div>
                <div data-item>
                    <div>2的内容，span3</div>
                </div>
                <div data-item>
                    <div>3的内容，span3</div>
                </div>
                <div data-item>
                    <div>4的内容，span3</div>
                </div>
                <div data-item>
                    <div>5的内容，span3</div>
                </div>
                <div data-item>
                    <div>6的内容，span3</div>
                </div>
                <div data-item>
                    <div>7的内容，span3</div>
                </div>
            </div>
        </div>
    </div>
</mip-scrollbox>
```

### 不规则栅格化
```html
<style>
    .demo4 [data-item] {
        height: 100px;
    }
    .demo4 [data-item] a {
        display: block;
        height: 100px;
        padding: 0 3px;
        color: #555;
        border: 1px solid #ccc;
                box-sizing: border-box;
        -webkit-box-sizing: border-box;
    }
</style>
<mip-scrollbox data-type="row" class="demo4">
    <div data-wrapper>
        <div data-inner>
            <div data-scroller>
                <div data-item data-col="6">
                    <a href="https://www.mipengine.org">使用 MIP 无需等待加载，页面内容将以更友好的方式瞬时到达用户。</a>
                </div>
                <div data-item data-col="4">
                    <a href="https://www.mipengine.org">MIP 提供实用、强大的基础组件，开发者可根据需求任意选择。</a>
                </div>
                <div data-item data-col="6">
                    <a href="https://www.mipengine.org">MIP 是一项永久的开源计划，提供持续优化的解决方案。</a>
                </div>
                <div data-item data-col="4">
                    <a href="https://www.mipengine.org">MIP 语法基于 HTML 并提供详细的示例，开发者仅需做简单开发。</a>
                </div>
                <div data-item data-col="6">
                    <a href="https://www.mipengine.org">MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。</a>
                </div>
            </div>
        </div>
    </div>
</mip-scrollbox>
```

### 图片栅格

```html
<mip-scrollbox data-type="row" class="demo5">
    <div data-wrapper>
        <div data-inner>
            <div data-scroller>
                <div data-item data-col="4">
                    <mip-img
                        src="https://dummyimage.com/300x400?a"
                        width="300"
                        height="400"
                        layout="responsive"
                    >
                    </mip-img>
                    <p>这是 col4 的容器</p>
                </div>
                <div data-item data-col="4">
                    <mip-img
                        src="https://dummyimage.com/300x400?b"
                        width="300"
                        height="400"
                        layout="responsive"
                    >
                    </mip-img>
                    <p>这是 col4 的容器</p>
                </div>
                <div data-item data-col="4">
                    <mip-img
                        src="https://dummyimage.com/300x400?c"
                        width="300"
                        height="400"
                        layout="responsive"
                    >
                    </mip-img>
                    <p>这是 col4 的容器</p>
                </div>
                <div data-item data-col="4">
                    <mip-img
                        src="https://dummyimage.com/300x400?d"
                        width="300"
                        height="400"
                        layout="responsive"
                    >
                    </mip-img>
                    <p>这是 col4 的容器</p>
                </div>
                <div data-item data-col="4">
                    <mip-img
                        src="https://dummyimage.com/300x400?e"
                        width="300"
                        height="400"
                        layout="responsive"
                    >
                    </mip-img>
                    <p>这是 col4 的容器</p>
                </div>
                <div data-item data-col="4">
                    <mip-img
                        src="https://dummyimage.com/300x400?f"
                        width="300"
                        height="400"
                        layout="responsive"
                    >
                    </mip-img>
                    <p>这是 col4 的容器</p>
                </div>
            </div>
        </div>
    </div>
</mip-scrollbox>
```

## 组件属性

### data-type
说明：横滑类型   
必选项：否  
类型：字符串  
取值范围：`row` 栅格化（分为12列 ，两端外边距为 `17px` ），为空则默认自适应横滑  
默认值：空值  

### data-col
说明：横滑子容器 `[data-item]` 元素上设置的栅格列数，必须组件的 `data-type="row"` 才生效  
必选项：否  
类型：属性节点 
默认值：3

## 组件内部属性元素

### [data-wrapper]
说明：横滑包裹容器，每个滑动组件内只能存在一个  
必选项：是  
类型：HTML 节点  

### [data-inner]
说明：横滑内部容器，每个滑动组件内只能存在一个  
必选项：是  
类型：HTML 节点  

### [data-scroller]
说明：横滑滚动容器，每个滑动组件内只能存在一个  
必选项：是  
类型：HTML 节点  

### [data-item]
说明：横滑子容器，可以包含多个子容器  
必选项：是  
类型：HTML 节点 

## 注意事项

### 布局设置说明

如果已知滑动容器的高度，请设置该组件的 `layout` 和 `height` 以让页面渲染时组件的位置固定，从而加速页面渲染，例如已知滑动组件高度为 `100px` ，那么可以设置：

```
<mip-scrollbox height="100" layout="fixed-height">
</mip-scrollbox>
```

### 内部元素 box-sizing 说明

由于栅格化需要计算宽度，对 `<mip-scrollbox>` 组件中的 `[data-scroller], [data-inner], [data-item]` 属性元素设置了 `box-sizing: border-box;` 样式，如有特殊需求请自动覆盖。

### 元素字号问题

由于 `[data-item]` 属性元素使用了 `display: inline-block` 样式，会引发元素之间有约 `3px` 左右的间距，组件内设置了 `[data-scroller] {font-size: 0}` 和 `[data-item] {font-size: 12px}` 来解决间距问题，如有需要可以覆盖相对应的字号大小。
