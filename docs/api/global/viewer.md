# viewer

`MIP.viewer` 解决了一些不同展现场景下的兼容性问题，同时为开发者提供了一些常用的方法或者属性，我们来大致了解一下。

## 与 SuperFrame 通信

一个 MIP 页面除了在独立站点中展示，也会在结果页中被 SuperFrame 嵌入展现。
因此，与 SuperFrame 的通信是必不可少的，这种通信通常是双向的。
例如在 MIP 中每次发生页面切换，都需要通知 SuperFrame 进行浏览器地址栏 URL 的修改，当 SuperFrame 监听到历史记录的前进后退，也会通知 MIP router 进行跳转。

下面将介绍向 SuperFrame 发送以及从 SuperFrame 接受消息的两个方法。

### sendMessage
- 参数：
  - {string} eventName 信息名称
  - {Object} data 信息内容
- 返回值：无
- 用法：

  用于向 __外部__ 发送信息 (postMessage)，仅在 MIP 页面被嵌入 SuperFrame 时生效。例如在百度搜索结果页中需要通知信息给外部的 SuperFrame 时可以使用。

  ```javascript
  MIP.viewer.sendMessage('mipMessage', {message: 'Hello SF! I am MIP'})
  ```

### onMessage
- 参数：
  - {string} eventName 信息名称
  - {Function} callback 收到特定信息后的回调函数。仅有一个参数：消息的具体信息。
- 返回值：无
- 用法：

  用于接收 __外部__ 发送的信息 (postMessage)，仅在 MIP 页面被嵌入 iframe 时生效。如在百度搜索结果页中需要接收外部的 SuperFrame 发来的信息时可以使用。

  ```javascript
  MIP.viewer.onMessage('sfMessage', ({message}) => console.log(message))
  ```

## open

在 MIP 页面中点击 `<a mip-link>` 链接会在当前页面进行具有切换效果的页面跳转，类似 SPA 中的效果。
除了这种方式，开发者也可以通过编程方式实现这一效果。

- 参数：
  - {string} to 目标页面的 URL
  - {Object} options 配置对象
    - {boolean} options.isMipLink 默认 `true`。目标页面是否是 MIP 页。如果不是，直接使用 `top.location.href` 进行跳转。
    - {boolean} options.replace 默认 `false`。目标页面是否采用 replace 方式打开。如果是，则不会新增一条历史记录。
- 返回值：无
- 用法：

  以 API 的方式进行页面跳转，效果和 `<a href="http://www.example.com" mip-link replace>` 相同。

  ```javascript
  // 替换当前历史记录，不新增
  MIP.viewer.open('http://www.example.com', {replace: true})
  ```

## page

`MIP.viewer.page` 作为 `MIP.viewer` 的重要组成部分，承担着页面切换，互相通信等等基本功能。
我们暴露了一些常用的 API 供开发者使用。

### 页面属性

#### standalone: `boolean`

MIP 页面的运行环境有两种：独立站点和百度搜索结果页。页面通过这个标志变量可以进行判断。

- 用法：

  常量，不能更改。表示当前是否处于独立站点运行环境。

  - `true`: 当前页面处于独立站点运行环境
  - `false`: 当前页面处于百度搜索结果页运行环境

  ```javascript
  if (MIP.viewer.page.standalone) {
    // 独立站点运行环境
  } else {
    // 百度搜索结果页中
  }
  ```

#### isRootPage: `boolean`

我们把打开的第一个页面称作“根页面”，后续打开新页面时，会在这个“根页面”中创建新的 iframe。
由于运行环境不同，我们需要一个标志变量来区分“根页面”和后续页面。

- 用法：

  常量，不能更改。表示当前页面是否是“根页面”。

  - `true`: 当前页面是根页面
  - `false`: 当前页面不是根页面

  ```javascript
  if (MIP.viewer.page.isRootPage) {
    // do something only in root page
  }
  ```

#### isCrossOrigin: `boolean`

我们支持打开一个跨域的 MIP 页面。
如果页面想知道当前是否处于跨域状态，可以访问这个变量。

- 用法：

  常量，不能更改。表示当前页面是否是跨域页面。

  - `true`: 当前页面是跨域页面
  - `false`: 当前页面不是跨域页面

  ```javascript
  if (MIP.viewer.page.isCrossOrigin) {
    // do something only in cross-origin page
  }
  ```

### 历史记录操作

对于历史记录的操作需要路由来完成。
我们通过 page 暴露了两个快速操作路由的方法供开发者使用。

#### back
- 参数：无
- 返回值：无
- 用法：
  对历史记录进行后退操作

  ```javascript
  MIP.viewer.page.back()
  ```

#### forward
- 参数：无
- 返回值：无
- 用法：
  对历史记录进行前进操作

  ```javascript
  MIP.viewer.page.forward()
  ```

### 滚动到锚点

在一些场景下，滚动到某个锚点并且具有平滑的效果是很有用的。

#### scrollToHash
- 参数：锚点字符串
- 返回值：无
- 用法：
  滚动到某个锚点，如果在当前页面中不存在则无效果

  ```javascript
  MIP.viewer.page.scrollToHash('#简介')
  ```

### 页面切换事件

在历史记录发生前进后退，即页面发生切换时，会在前后两个页面中触发切换事件，各个自定义组件可以监听这两个事件：
* `show-page` 页面展示
* `hide-page` 页面隐藏

由于触发的是 CustomEvent 自定义事件，监听方法如下：
```javascript
// MyCustomComponent
mounted() {
  window.addEventListener('show-page', () => {
    // do something when page show
  })
  window.addEventListener('hide-page', () => {
    // do something when page hide
  })
}
```

有一点需要注意，添加了监听处理之后，页面第一次展示时是不会触发 `show-page` 事件的。
如果要针对首次展现编写处理逻辑，应该放在组件 `mounted()` 生命周期中执行。

### 页面通信

除了之前介绍过的和 SuperFrame 的通信，已经打开的多个 MIP 页面之间也需要进行通信。
从发送的形式上看，可以分成向指定页面发送消息和向全部页面广播两种。
而从发送消息的实际内容上看，开发者可以指定自定义事件 CustomEvent 的名称和附带数据，MIP 会确保在目标页面中触发这个自定义事件。作为接收者，只需要监听这个自定义事件即可。

#### emitCustomEvent
- 参数：
  - {Window} targetWindow 目标页面 window
  - {boolean} isCrossOrigin 是否跨域
  - {Object} event 事件对象
    - {string} event.name 自定义事件名称
    - {Object} event.data 自定义事件数据
- 返回值：无
- 用法：

  向指定页面发送自定义事件，__此方法可跨域__。常用于页面向 Shell 通讯时使用（例如点击页面中的某个按钮，通知Shell弹出侧边栏）。

  ```javascript
  // 非跨域情况和 MIP Shell 进行通讯
  let page = window.MIP.viewer.page
  let target = page.isRootPage ? window : window.parent
  page.emitCustomEvent(target, false, {
    name: 'myShellEvent',
    data: {
        message: 'Hello MIP Shell'
    }
  })

  // MIP Shell 接收消息，可以实现在 MIP Shell 的继承子类中
  window.addEventListener('myShellEvent', e => {
    let data = e.detail[0]
    console.log(data.message) // Hello MIP Shell
  })
  ```

#### broadcastCustomEvent
- 参数：
  - {Object} event 事件对象
    - {string} event.name 自定义事件名称
    - {Object} event.data 自定义事件数据
- 返回值：无
- 用法：

  向所有页面广播自定义事件，__此方法可跨域__。常用于 Shell 向所有广播信息时使用（例如点击Shell底栏的夜间模式，通知所有窗口调整样式）。

  ```javascript
  // MIP Shell 向所有页面广播信息，如点击打开“夜间模式”
  let page = window.MIP.viewer.page
  page.broadcastCustomEvent({
    name: 'myShellEvent',
    data: {
      nightMode: true
    }
  })

  // 页面组件接受消息
  window.addEventListener('myShellEvent', e => {
    let data = e.detail[0]
    if (data.nightMode) {
      // 添加某些 class 到容器中，实现夜间模式
    }
  })
  ```

## isIframed

### isIframed: `boolean`

- 用法：

  常量，不能更改。表示当前页面是否被嵌入到 iframe 中。

  - `true`: 页面处于 iframe 内
  - `false`: 页面不处于 iframe 内

  ```javascript
  if (MIP.viewer.isIframed) {
    // Fix some iframe bugs
  }
  ```

> __`MIP.viewer.isIframed` 和 `MIP.viewer.page.standalone` 的区别__
>
> 百度搜索结果页的 SuperFrame 会创建 iframe 把目标页面嵌入其中进行展现。类似地 MIP 内部也会创建 iframe （用于多个 MIP 页之间的连接），因此使用 `isIframed` 只能判断当前页面是否被嵌入 iframe，而不能判断当前页面在不在搜索结果页，因为 MIP Page 的后续页面同样在 iframe 内部。
>
> 这两个变量正确的用法应该是：`isIframed` 用于增加针对 iframe 的一些兼容代码，如处理 iOS 下 iframe 的滚动 BUG 等等；而 `standalone` 则用于处理单独打开或者嵌入在搜索结果页（主要是和 SuperFrame 交互）两种情况的不同逻辑。

## fixedElement

在 iOS 的 `<iframe>` 中，如果页面中包含了使用 `display: fixed` 定位的元素，在页面发生滚动时，这些元素并不会遵循 fixed 的特性停留在页面的同一位置，而会发生明显的上下跳动，十分影响视觉效果。

为了解决这个问题，我们会使用一个相当 HACK 的做法：创建一个 `<body>` 的兄弟节点，将原有页面中所有的 fixed 元素移动到这个节点中，我们把这个节点叫做 **fixedlayer** 。此时原始的 HTML 结构会发生一个明显的改变，例如 `<mip-fixed>` 这样的元素被移动到了 fixedlayer 中，如下所示：

```html
<html>
  <body><!-- 原始内容 --></body>
  <body id="mip-fixedlayer">
    <!-- 所有 mip-fixed 元素被移动到了这里 -->
    <mip-fixed></mip-fixed>
  </body>
</html>
```

由于 HTML 结构的改变，在使用 `<mip-fixed>` 时有以下几点需要注意：
1. 调用 `MIP.viewer.fixedElement.init()`
2. 避免选择器嵌套
3. 委托事件时选择 `document.documentElement`

下面我们将依次介绍这些注意事项。

### 组件中使用 <mip-fixed>

在组件中使用 `<mip-fixed>` 时，一定要在 `mounted()` 生命周期中调用 `fixedElement.init()` 触发移动到 `<body>` 的操作。后续我们会将 `<mip-fixed>` 改造成真正的自定义组件，免去开发者手动调用的操作。

#### fixedElement.init
- 参数：无
- 返回值：无
- 用法：

  ```javascript
  MIP.registerVueCustomElement('my-component', {
    template: `
      <div>
        <mip-fixed type="bottom">
          <div @click="goToTop">Go to Top</div>
        </mip-fixed>
      </div>
    `,
    methods: {
      goToTop () {}
    },
    mounted () {
      MIP.viewer.fixedElement.init()
    }
  })
  ```

### 避免选择器嵌套

由于 `<mip-fixed>` 位置发生了移动，原本定义在组件中的 CSS 选择器可能出现无法匹配的现象。
例如选择器 `.container > mip-fixed` 无法匹配移动之后的 `<mip-fixed>` 元素，需要作出修改，取消嵌套规则。

  ```vue
  <template>
    <div class="container">
      <mip-fixed type="bottom"></mip-fixed>
    </div>
  </template>

  <style lang="stylus">
    // 不生效
    .container {
      mip-fixed {
        top: 100px
      }
    }
    // 生效
    mip-fixed {
      top: 100px
    }
  </style>
  ```

### 委托事件

`<mip-fixed>` 从 `<body>` 中移出带来的另一个问题就是原本委托 `document.body` 处理的事件。
例如 `<mip-fixed>` 中包含了一个按钮，我们将点击事件委托给 `document.body` 处理，实际运行后将发现事件并不会触发。

  ```html
  <mip-fixed>
    <button class="my-button">My Button</button>
  </mip-fixed>
  ```

  ```javascript
  // .my-button 已经不在 body 中了，因此并不会触发
  event.delegate(document.body, '.my-button', 'click', function (e) {}）
  ```

我们建议修改这类事件委托代码，可以参考 [ISSUE#80](https://github.com/mipengine/mip2/issues/80)。

  ```javascript
  // 代理到 html 根元素上
  event.delegate(document.documentElement, ...）
  // 代理到 document 上
  event.delegate(document, ...）
  ```
