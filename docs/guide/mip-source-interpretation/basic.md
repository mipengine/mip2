# MIP 基础模块

MIP 页面基础模块由 `MIP.viewer` 和 `MIP.viewport` 两部分组成，它们为 MIP 页面展现提供了很好的兼容策略和强有力的功能函数。其中 viewport 为开发者提供了一系列便捷的访问页面视口的 API，而 viewer 处理了大量平台兼容性的难题，同时实现了一些页面全局性的功能。

## viewport 模块 - 获取视口信息

在开发自定义组件的过程中，经常会出现获取当前视口信息的需求。例如开发一个向上滑动加载的长列表，需要实时获取当前视口的滚动距离。MIP 的 viewport 模块封装了一系列视口相关的 API 供组件开发者方便地使用，大致可以分成获取视口尺寸和获取、设置滚动位置两类，主要方法如下。

### 视口尺寸

通过 `MIP.viewport.getWidth()` 和 `MIP.viewport.getHeight()` 获取视口的宽和高，MIP 的 viewport 模块内部实际使用了 `window` 或者 `document.documentElement` 上的宽高属性来计算视口的宽高，如下面代码所示。

```js
// 获取视口宽度
getWidth () {
  return win.innerWidth || docElem.clientWidth
},
// 获取视口高度
getHeight () {
  return win.innerHeight || docElem.clientHeight
}
```

### 滚动位置

对于滚动位置信息，MIP 的 viewport 模块既提供了类似视口尺寸这样的获取方法，也提供了直接设置当前滚动距离，让页面发生滚动行为的方法。
例如开发者可以获取水平和垂直方向的滚动距离，以及当前滚动区域的宽高尺寸，如下面代码所示。

```js
// 获取垂直方向滚动距离
getScrollTop () {
  return rect.getScrollTop()
},
// 获取水平方向滚动距离
getScrollLeft () {
  return rect.getScrollLeft()
},
// 获取滚动区域宽度
getScrollWidth () {
  return rect.getScrollWidth()
},
// 获取滚动区域总高度
getScrollHeight () {
  return rect.getScrollHeight()
}
```

> 细心的读者肯定已经发现了，在 viewport 模块中这些滚动位置信息都是通过 rect 这个对象得到的。在 rect 中，特别处理了iOS `<iframe>` 下的滚动兼容问题，对外暴露的接口已经隐藏了具体实现细节。

除了读取滚动位置，在开发「**回到顶部**」这样的组件时，直接设置滚动距离，让页面滚动到指定位置是一个常见的需求。为此 viewport 模块也提供了`MIP.viewport.setScrollTop()` 方法，如代码如下所示：

```js
// 滚动到指定位置
setScrollTop (top) {
  rect.setScrollTop(top)
}
```

### 监听视口事件

除了直接获取视口相关信息，监听视口的改变事件，做出相应操作也是一个常见的需求。为此，viewport 在滚动过程以及自身尺寸发生改变时，会触发相应的事件，自定义组件可以监听这些事件，做出相应操作。

viewport 模块在初始化阶段会注册对于两类事件的监听函数：滚动容器的 `scroll` 事件以及 `window` 的 `resize` 事件，如下面代码所示。

```js
init () {
  // 监听滚动事件
  this.scroller.addEventListener('scroll', scrollHandle.bind(this))
  // 监听窗口尺寸变化事件
  win.addEventListener('resize', resizeEvent.bind(this))
}
```

MIP 的 viewport 模块自身继承了 `EventEmitter` 对象，拥有了触发和监听事件的能力。在接收到这两类事件时，会通过 `trigger` 触发他们。例如对于 `scroll` 事件，在处理函数中调用 `trigger` 触发了同名事件，另外为了避免事件频繁触发，这里使用了 `fn.throttle` 进行了节流，设置了最小触发间隔也就是 16.7 ms，如下面代码所示。

```js
let scrollHandle = fn.throttle(function (event) {
  this.trigger('scroll', event)
}, 1000 / 60)
```

对于 MIP 的[自定义组件](./3-mip-components.md)来说，只需要通过 `MIP.viewport.on` 监听 `scroll` 和 `resize` 事件即可，下面我们来看看具体的使用方法。

### 滚动事件

组件可以监听 `scroll` 事件，在事件处理函数中通过上一小节介绍的 `MIP.viewport.getScrollTop()` 方法获取当前的滚动距离，如下面代码所示。

```js
viewport.on('scroll', function () {
  // 获取当前滚动距离，做出相应操作
  let scrollTop = viewport.getScrollTop()
})}
```

### 视口尺寸改变事件

组件也可以监听 `resize` 事件，例如在手机发生横竖屏切换时，可以获取当前最新的视口尺寸，改变组件当前的展示状态，如下面代码所示。

```js
viewport.on('resize', function () {
  // 获取当前视口宽度
  let width = viewport.getWidth()
})}
```

以上就是 viewport 模块提供的全部功能，下面我们将介绍页面基础模块中另一个重要的组成部分 viewer 模块。

## viewer 功能简介

通过前两小节的介绍我们已经知道，当需要获取页面视口相关的信息时，只需要访问 `MIP.viewport` 提供的 API。但是实际运行情况要复杂得多，一个 MIP 页面可能在搜索结果页中展示，也有可能在独立站点中展示，再加上不同平台上的各种浏览器，如何保证在这些差异化场景下类似 viewport 模块提供的 API 还能正常访问，甚至整个页面依然能够稳定流畅呢？

对于 MIP 页面和组件的开发者，是不需要考虑这些问题的。但是 viewer 模块则需要兼容这些情况，尽可能抹平这些差异，保证页面的一致化展现。除此之外，viewer 模块还需要处理页面上的一些全局性行为，例如点击 `<a>` 链接进行跳转等等。

在这一节中，我们不会详细介绍 viewer 模块所做的全部工作，viewer 模块的绝大多数内容可以认为是对开发者透明的，主要集中在兼容性和处理全局行为两个方面。在本节接下来的内容中，我们将从这两个方面各取一例进行示例介绍。
首先，我们介绍一个处理兼容性过程中遇到的问题。

### fixed 元素滚动问题

在 iOS 的 iframe 中，如果页面中包含了使用 `display: fixed` 定位的元素，在页面发生滚动时，这些元素并不会遵循 fixed 的特性停留在页面的同一位置，而会发生明显的上下跳动，十分影响视觉效果。

为了解决这个问题，我们会使用一个相当 **HACK** 的做法：创建一个 body 的兄弟节点，将原有页面中所有的 fixed 元素移动到这个节点中，我们把这个节点叫做 fixedlayer。打开 iframe 中的 MIP 页面，我们将看到原始的 HTML 结构发生了一个明显的改变，例如 `<mip-fixed>` 这样的元素被移动到了 fixedlayer 中，如下面代码所示。

```html
<html>
  <body>...</body>
  <body class="mip-fixedlayer" style="position: absolute; top: 0px; left: 0px; height: 0px; width: 0px;...">
    <mip-fixed type="top"></mip-fixed>
  </body>
</html>
```

为了找出页面中所有的 fixed 元素，viewer 模块会通过选择器查询所有 `<mip-fixed>` 元素，如下面代码所示。

```js
  let mipFixedElements = document.querySelectorAll('mip-fixed')
```

因此作为开发者，如果开发的自定义组件中需要使用 fixed 元素，请务必使用 `<mip-fixed>` 进行包裹，以保证在 iOS iframe 下的展现效果。
看完了一个处理兼容性的场景，接下来我们将介绍一个 viewer 模块处理页面全局性行为的问题。

### MIP 链接跳转

在 MIP 页面中，当需要编写一个跳转到其他 MIP 页面的链接时，并不需要使用类似 `<mip-link>` 这样的自定义组件，只需要在普通的 `<a>` 上增加 mip-link 属性，如下面代码所示。

```html
<a href="http://www.example.com/home.html" mip-link>回到主页</a>
```

在 viewer 模块中，需要代理页面中所有的 `<a>` 链接点击事件，具体在 `_proxyLink()` 方法中实现。从下划线开头的命名约定也能看出，这个方法是不需要开发者来调用的。在具体实现中用到了 MIP utils 中的 event 模块中的事件委托方法，如下面代码所示。

```js
_proxyLink (page = {}) {
  let self = this
  // 代理所有 <a> 元素的 click 事件
  event.delegate(document, 'a', 'click', function (event) {
    let $a = this // <a> 元素
    let to = $a.href // 跳转地址
    let isMipLink = $a.hasAttribute('mip-link') // 是否是 MIP 链接
    self.open(to, {isMipLink}) // 打开 MIP 链接
  }
}
```

接下来，对于包含 mip-link 属性的 `<a>` 链接，会调用 `MIP.viewer.open()` 以 iframe 的方式打开这个 MIP 页面。以上就是 viewer 模块处理MIP 链接的全过程。

最后总结一下，作为页面基础模块，viewport 模块为开发者提供了一系列便捷的访问页面视口的 API，保证覆盖到这部分开发组件的需求。而 viewer 模块处理了大量平台兼容性的难题，同时实现了一些页面全局性的功能，让页面浏览更加稳定顺畅，保证了稳定的用户体验，让用户可以在 MIP 技术的支撑下，自由阅读页面提供的优质内容。
