# mip-vd-tabs tab 切换组件

在网页中显示标签。标签页内元素较多时不建议使用，会影响页面性能。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v1/mip-vd-tabs/mip-vd-tabs.js

## 示例

一共支持5种样式

### 等分固定标签页

```html
<mip-vd-tabs>
    <section>
        <li>第一页</li>
        <li>第二页</li>
        <li>第三页</li>
        <li>第四页</li>
    </section>
    <div>内容1</div>
    <div>内容2</div>
    <div>内容3</div>
    <div>内容4</div>
</mip-vd-tabs>
```
### 横滑标签页

```html
<mip-vd-tabs allow-scroll>
    <section>
        <li>第一季</li>
        <li>第二季</li>
        <li>第三季</li>
        <li>第四季</li>
        <li>第五季</li>
        <li>第六季更新至09</li>
    </section>
    <div>内容1</div>
    <div>内容2</div>
    <div>内容3</div>
    <div>内容4</div>
    <div>内容5</div>
    <div>内容6</div>
</mip-vd-tabs>
```

### 带下拉按钮的横滑标签页

```html
<mip-vd-tabs allow-scroll toggle-more toggle-label="自定义文字">
    <section>
        <li>第一季</li>
        <li>第二季</li>
        <li>第三季</li>
        <li>第四季更新至09</li>
    </section>
    <div>内容1</div>
    <div>内容2</div>
    <div>内容3</div>
    <div>内容4</div>
</mip-vd-tabs>
```

### 底部标签页

```html
<mip-vd-tabs allow-scroll type="bottom" current="3">
    <div>内容1</div>
    <div>内容2</div>
    <div>内容3</div>
    <div>内容4</div>
    <section>
        <li>第一季</li>
        <li>第二季</li>
        <li>第三季</li>
        <li>第四季更新至09</li>
    </section>
</mip-vd-tabs>
```

### 剧情展开标签页
```html
<mip-vd-tabs
    type="episode"
    toggle-more
    toggle-label="老九门剧情选集"
    allow-scroll
    total="23"
    current="11"
    text-tpl="看第{{x}}集"
    link-tpl="https://www.baidu.com/s?wd=老九门第{{x}}集">
</mip-vd-tabs>
```

## 属性

### type

说明：一共有三种特型，`bottom`（底部选项卡），`episode`（剧情选项卡），不填则为默认特型  
必填项：否

### allow-scroll

说明：允许滑动  
必填项：否

### toggle-more

说明：是否显示下拉按钮。前置依赖于 `allow-scroll` 属性  
必填项：否

### toggle-label

说明：下拉说明文字。前置依赖于 `toggle-more` 属性  
必填项：否

### current

说明：当前已选标签页, 从 0 开始计数（`current="3"` 表示第 4 个标签页）。当 `type="episode"` 时，表示当前剧集，从 1 开始计数（`current="4"` 表示第 4 集），默认为 1  
必填项：否

### total

说明：剧集总数。前置依赖于 `type="episode"`，并且当 `type="episode"` 为必填  
必填项：否

### page-size

说明：每页显示剧集数。前置依赖于 `type="episode"`，默认为 50  
必填项：否

### text-tpl

说明：显示在标签页上的剧集文案，"第 {{x}} 集"里的" {{x}} "将被替换成表示集数的数字。前置依赖于 `type="episode"`  
必填项：否

### link-tpl

说明：标签页和下拉菜单里的剧集跳转链接, 链接里的 "{{x}}" 将被替换成表示集数的数字 前置依赖于 `type="episode"`，当 `type="episode"` 为必填  
必填项：否

### head-title

说明：标签页和下拉菜单里的剧集跳转新页面的头部标题。前置依赖于 `type="episode"`，当 `type="episode"` 为必填  
必填项：否
