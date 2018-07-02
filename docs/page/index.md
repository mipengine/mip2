# MIP 页面和组织方式

> wangyisheng (wangyisheng@outlook.com)
>
> panyuqi (panyuqi@baidu.com)

熟悉 MIP 的开发者可能了解，MIP 全称 Mobile Instant Pages，因此是以 __页面 (Page)__ 为单位来运行的。开发者通过改造/提交一个个页面，继而被百度收录并展示。

但以页面为单位带来一个问题：当一个 MIP 页面中存在往其他页面跳转的链接时，就会使浏览器使用加载页面的默认行为来加载新页面。这“第二跳”的体验比起从搜索结果页到 MIP 页面的“第一跳”来说相去甚远。

新版本的 MIP 为了解决这个问题，引入了 Page 模块。它的作用是 __把多个页面以一定的形式组织起来，让它们互相切换时拥有和单页应用一样的切换效果__，而不是浏览器默认的切换效果。这个功能大部分对开发者是透明的，但也需要开发者遵守一些页面的编写规范，这也是本篇文档的主要内容。

## MIP页面编写规范

1. 所有页面 __必须__ 包含 `<html>`, `<head>`, `<body>`，组织方式和常规 HTML 相同：

    ```html
    <html>
        <head></head>
        <body></body>
    </html>
    ```

2. 所有页面 __必须__ 在 `<body>` 的 __最后__ 编写或引用 mip 相关的 js。其中顺序是：
    1. mip.js
    2. 各组件的 js。如有相互依赖，把被依赖项写在前面。

    举例来说，一个页面引用了两个组件 `component-a` 和 `component-b`，并且 `component-b` 依赖 `component-a` （例如在 `component-b` 的模板中出现了 `<mip-component-a>`），那么这个页面的组织结构应该是：

    ```html
    <body>
        <!-- DOM or MIP Component -->
        <script type="text/javascript" src="https://somecdn/mip.js"></script>
        <script type="text/javascript" src="https://somecdn/mip-component-a.js"></script>
        <script type="text/javascript" src="https://somecdn/mip-component-b.js"></script>
    </body>
    ```

3. MIP 页面中的链接依然使用 `<a>`，具体如下：

    1. 如果跳转到其他 __同域名的 MIP 页面__，使用 `mip-link` 属性或者 `data-type="mip"`：
        ```html
        <a href="https://somesite.com/mip/anotherMIPPage.html" mip-link>xxx</a>
        <a href="https://somesite.com/mip/anotherMIPPage.html" data-type="mip">xxx</a>
        ```
        1. `href` 指向当前域名的页面，暂时不允许跨域
        2. 不允许使用 `target` 属性

    2. 如果跳转到其他页面 ，不添加 `mip-link` 属性或者 `data-type="mip"`，进行普通跳转：
        ```html
        <a href="https://www.another-site.com/">Jump Out</a>
        ```

    3. `href` 属性值沿用[旧版 mip-link 规范](https://www.mipengine.org/examples/mip-extensions/mip-link.html)，取值范围：`https?://.*`, `mailto:.*`, `tel:.*`，__不允许使用相对路径或者绝对路径__。(如 `./relativePage.html`, `/absolutePage.html`)

    4. 和默认浏览器行为相同， `<a>` 也可以用作页面内部的快速定位滚动，只需要将 `href` 中包含 `#` 即可，如 `http://somesite.com/mip/page.html#second`。特别地，`#second` 作为 `href` 取值范围的例外也被认为合法，可以用作当前页面的快速定位。

    5. 默认情况下点击链接后会向 History 中 `push` 一条记录。如果想覆盖当前记录，可以在 `<a>` 元素上增加 `replace` 属性。

    6. 通过 `data-title` 和 `innerHTML` 可以设置下一个页面的标题。(详情可见 [MIP Shell 相关章节](./shell.md))

4. 页面内元素的样式中 `z-index` 不能超过 10000，否则会引起页面切换时的样式遮盖问题。

## 页面切换方案

MIP Page 最大的工作在于将多个独立的页面融合在一起，让它们拥有像单页应用 (SPA) 那样的切换效果和使用体验，解决“第二跳”的问题。这一部分简单讨论一下它的实现方案。

*阅读以下内容能够帮助您更好地理解和使用 MIP PAGE 的相关属性和 API。*

方案核心主要有以下几点：

1. MIP Page 借助 iframe 实现了页面之间的互相隔离
2. 通过 iframe 和外界的通讯来实现页面之间的通讯和传递数据
3. 为了加载性能考虑，第一个页面维持原状，不放入 iframe 之中。

在页面结构上，除了首个页面的 DOM 全部保留之外，后续页面均以 iframe 的形式存在。因为 DOM 结构的原因，在后续说明中，__首个页面__ 等价于 __外部页面__ 或者 __外部__，__后续页面__ 等价于 __内部页面__ 或者 __内部__，这里的“内外”指的就是代码执行于 iframe 的内部或者外部。

我们以第一个页面和后续页面两种情况来分开讨论一下 Page 的工作机理。

### 首个页面

因为 MIP 页面是由普通 HTML 标签(如 `<div>`, `<span>` 等)和自定义标签(主要是各类 MIP 组件，如 `<mip-data>`, `<mip-img>` 等)组成，因此两者都具有 __加载到 DOM 树中立刻能够由浏览器渲染__ 的能力（即无需等待其他 JS 执行。与之相对的如 Vue 的容器 `<div id="app"></div>` 在 Vue 生命周期执行之前只是一个空节点）。

正因为这种能力，在 Page 实际运行之前页面已经渲染成功了，因此如果 Page 再将内容放入 iframe 或者重新加载一个 iframe 只会减慢或者重复请求数据，影响页面性能。所以 MIP 采取了第一个页面不在 iframe 中的方案。

Page 在首个页面加载时，主要做了如下的工作：

1. 初始化路由相关的内容。这其中可分为几个步骤：
    1. 注册路由变化的回调函数 `this.render()`，路由变化时调用这个方法渲染下一个页面和过场动画
    2. 监听 iframe 内部发出的 `message` 事件，根据事件内容选择 `history.push`, `history.replace` 和 `location.href` 的某一种进行操作。
    3. 监听外部 (主要是百度 SuperFrame) 发来的 `message` 事件，进行 `history.replace` 操作

2. 初始化 Shell 相关的内容。这里又分为两步：
    1. 读取 `<mip-shell>` 的配置，渲染头部标题栏，插入为 `<body>` 的第一个子节点
    2. 监听 iframe 内部发出的 `message` 事件，包括设置/更新 MIP Shell 配置，同步页面配置等等。

3. 在 `<body>` 上设置 `mip-ready` 属性，以表示初始化完成

### 后续页面

在首个页面执行的 Page 会在检测到路由变化时，创建一个 iframe 以加载目标页面。目标页面同时也是一个 MIP 页面，因此也有 Page 代码在其内部执行。在 iframe 内部的 Page 主要做了如下的工作：

1. 将当前页面信息添加到外部(首个页面)的路由信息中。(`addChild`)

2. 在 `<body>` 上设置 `mip-ready` 属性，以表示初始化完成

### 最终渲染的页面结构

被 MIP Page 管理的页面将会被渲染为如下的结构。从这里可以很直观地看出首个页面和后续页面的结构。

```html
<html>
    <head></head>
    <body mip-ready>
        <h2>First Page</h2>
        <!-- Other Root Page Content -->

        <script src="mip.js"></script>
        <script src="mip-component-a.js"></script>
        <!-- Other Component Js -->

        <iframe src="http://some-site.com/second-page.html"></iframe>
        <iframe src="http://some-site.com/third-page.html"></iframe>
        <!-- Other Iframes -->
    </body>
</html>
```

值得注意的是，不论是首个页面还是后续页面，每个页面都引入了 `mip.js`。也因此，`mip.js` 中的每个操作都可能需要区分是首个页面还是后续页面，以进行不同的操作。

## Page API

MIP Page 对外部提供了两个 API 方法，供开发者调用以控制页面上的一些效果。

开发者可以通过 `window.MIP.viewer.page` 获取到 Page 对象。目前对外提供的属性或者 API 有：

### isRootPage (属性)

__boolean__, 用来判断当前页面是否在首个页面。

示例代码：

```javascript
let isRootPage = window.MIP.viewer.page.isRootPage
if (isRootPage) {
  // In Root Page
} else {
  // In Other Pages
}
```

### togglePageMask (方法)

展现/隐藏头部遮罩

如果页面需要展现全页面级别的遮罩层（如弹出对话框时），因为 iframe 的关系，并不能遮挡头部，如下图左边所示。

![Page Mask](http://boscdn.bpc.baidu.com/assets/mip2/page/page-mask.png)

如果调用这个方法可以通知 Page 把头部也进行遮挡，从而完成全页面的遮罩，如上图右边所示。

参数如下：

* toggle: __boolean__, `true` 为展现，`false` 为隐藏
* options: __Object__, 配置项
* options.skipTransition: __boolean__, `true` 为跳过动画直接展现/隐藏，`false` 为进行动画。默认值 `false`。

示例代码：

```javascript
window.MIP.viewer.page.togglePageMask(true, {skipTransition: true})
```

### toggleDropdown (方法)

展现/隐藏“更多”按钮的浮层。效果如图：

![Drop Down](http://boscdn.bpc.baidu.com/assets/mip2/page/dropdown.png)

参数如下：

* toggle: __boolean__, `true` 为展现，`false` 为隐藏

示例代码：

```javascript
window.MIP.viewer.page.toggleDropdown(true)
```

### 页面切换事件

在页面切换，也就是 `<iframe>` 展现/隐藏时，会在页面中触发切换事件，各个自定义组件可以监听这两个事件：
* `show-page` 页面展示
* `hide-page` 页面隐藏

由于触发的是 CustomEvent 自定义事件，监听方法如下：
```javascript
mounted() {
    window.addEventListener('show-page', () => {})
    window.addEventListener('hide-page', () => {})
}
```

有一点需要注意，添加了监听处理之后，页面第一次展示时是不会触发 `show-page` 事件的。
如果要针对首次展现编写处理逻辑，应该放在 `mounted()` 生命周期中执行。

## MIP Shell

在通过 MIP Page 将多个 MIP 页面融合到一起之后，在不同页面之间跳转可以获得如单页应用的效果。但在实际项目中，还可能有一些元素是游离于每个页面之外的（或者说每个页面都包含的内容）。这些元素包括头部标题栏，底部菜单，侧边栏等等。

如果让这些共有元素跟随页面一起进行切换动画显然不太恰当，因此最佳的做法是把他们提取到 iframe 之外独立渲染和更新。MIP Shell 就是用来解决这些共有元素的问题的。如果您对这块内容感兴趣，欢迎继续阅读 MIP Shell 的[相关文档](./shell.md)。

## viewer

MIP Page 对象是通过 `window.MIP.viewer.page` 来获取的。实际上除了 `page` 对象之外，`viewer` 还包含其他一些方法，可供开发者调用。

关于 `viewer` 的详情，可以参阅[这篇文档](./viewer.md)。
