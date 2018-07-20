## Page API

MIP Page 对外部提供了两个 API 方法，供开发者调用以控制页面上的一些效果。

开发者可以通过 `window.MIP.viewer.page` 获取到 Page 对象。目前对外提供的属性或者 API 有：

### isRootPage

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

### togglePageMask

展现/隐藏头部遮罩

如果页面需要展现全页面级别的遮罩层（如弹出对话框时），因为 iframe 的关系，并不能遮挡头部，如下图左边所示。

![Page Mask](http://boscdn.bpc.baidu.com/assets/mip2/page/page-mask.png)

而调用 `togglePageMask` 方法可以就通知 Page 把头部也进行遮挡，从而完成全页面的遮罩，如上图右边所示。

因为在首个页面 (`isRootPage = true`) 中所有的 DOM 均未处于 iframe 之内，因此头部也能够成功被遮罩，所以在首个页面中其实并不需要这个辅助遮罩。但 Page 对此已经做了判断，因此开发者可以在任意页面调用此方法，不必额外判断。

这个方法接收两个参数，具体如下：

* toggle: __boolean__, `true` 为展现，`false` 为隐藏
* options: __Object__, 配置项
* options.skipTransition: __boolean__, `true` 为跳过动画直接展现/隐藏，`false` 为进行动画。默认值 `false`。如果开发者的遮罩层包含动画且始终无法和 Page 提供的头部辅助遮罩层保持同步，跳过动画可能是一个保险的选择。

示例代码：

```javascript
window.MIP.viewer.page.togglePageMask(true, {skipTransition: true})
```

### toggleDropdown

展现/隐藏“更多”按钮的浮层。效果如图：

![Drop Down](http://boscdn.bpc.baidu.com/assets/mip2/page/dropdown-2.png)

这个方法接收一个参数，具体如下：

* toggle: __boolean__, `true` 为展现，`false` 为隐藏

示例代码：

```javascript
window.MIP.viewer.page.toggleDropdown(true)
```

### forward/back

用于控制前进/后退的路由操作。由于路由信息只保存在首个页面的 Page 对象中，因此调用路由操作需要获取首个页面的 Page 对象。为了避免开发者进行判断和获取时的繁琐，Page 包装了快速 API 供开发者调用。示例代码：

```javascript
window.MIP.viewer.page.forward()
window.MIP.viewer.page.back()
```

### emitCustomEvent

向指定页面发送自定义事件，__此方法可跨域__。常用于页面向 Shell 通讯时使用（例如点击页面中的某个按钮，通知Shell弹出侧边栏）。接收参数如下：

* targetWindow: __Object__，必填。需要发送事件的页面的 `window` 对象。通常情况下取值为 `window` （向当前页面发送）或者 `window.parent` （向首个页面或者Shell发送）；
* isCrossOrigin: __boolean__，必填。是否跨域。跨域模式下使用 `postMessage` 进行通讯，否则使用 `dispatch`
* event: __Object__, 需要发送的信息（事件）对象。包含两个属性：`name` 用于描述信息名称；`data` 记录信息本身

示例代码如下

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

### broadcastCustomEvent

向所有页面广播自定义事件，__此方法可跨域__。常用于 Shell 向所有广播信息时使用（例如点击Shell底栏的夜间模式，通知所有窗口调整样式）。接收参数如下：

* event: __Object__, 需要发送的信息（事件）对象。包含两个属性：`name` 用于描述信息名称；`data` 记录信息本身

示例代码如下

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

### 页面切换事件

在页面切换，也就是 `<iframe>` 展现/隐藏时，会在页面中触发切换事件，各个自定义组件可以监听这两个事件：
* `show-page` 页面展示
* `hide-page` 页面隐藏

由于触发的是 CustomEvent 自定义事件，监听方法如下：
```javascript
mounted() {
    window.addEventListener('show-page', () => {
      // do something
    })
    window.addEventListener('hide-page', () => {
      // do something
    })
}
```

有一点需要注意，添加了监听处理之后，页面第一次展示时是不会触发 `show-page` 事件的。
如果要针对首次展现编写处理逻辑，应该放在 `mounted()` 生命周期中执行。
