# 页面切换方案

MIP Page 最大的工作在于将多个独立的页面融合在一起，让它们拥有像单页应用 (SPA) 那样的切换效果和使用体验，解决“第二跳”的问题。这一部分简单讨论一下它的实现方案。

方案核心主要有以下几点：

1. MIP Page 借助 iframe 实现了页面之间的互相隔离
2. 通过 iframe 和外界的通讯来实现页面之间的通讯和传递数据
3. 为了加载性能考虑，第一个页面维持原状，不放入 iframe 之中。

在页面结构上，除了首个页面的 DOM 全部保留之外，后续页面均以 iframe 的形式存在。因为 DOM 结构的原因，在后续说明中，__首个页面__ 等价于 __外部页面__ 或者 __外部__，__后续页面__ 等价于 __内部页面__ 或者 __内部__，这里的“内外”指的就是代码执行于 iframe 的内部或者外部。

我们以第一个页面和后续页面两种情况来分开讨论一下 Page 的工作机理。

## 首个页面

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

## 后续页面

在首个页面执行的 Page 会在检测到路由变化时，创建一个 iframe 以加载目标页面。目标页面同时也是一个 MIP 页面，因此也有 Page 代码在其内部执行。在 iframe 内部的 Page 主要做了如下的工作：

1. 将当前页面信息添加到外部(首个页面)的路由信息中。

2. 在 `<body>` 上设置 `mip-ready` 属性，以表示初始化完成

## 最终渲染的页面结构

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
