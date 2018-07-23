# MIP Viewer

除了 Page 对象，`window.MIP.viewer` 为开发者提供了一些常用的方法或者属性，我们来大致了解一下。

## isIframed

属性类型 __boolean__，表示是否被嵌入到 iframe 中。

```javascript
if (window.MIP.viewer.isIframed) {
  // Fix some iframe bugs
}
```

> __`window.MIP.viewer.isIframed` 和 `window.MIP.viewer.page.standalone` 的区别__
>
> 百度搜索结果页的 SuperFrame 会创建 iframe 把目标页面嵌入其中进行展现。类似地 MIP 内部也会创建 iframe （用于多个 MIP 页之间的连接），因此使用 `isIframed` 只能判断当前页面是否被嵌入 iframe，而不能判断当前页面在不在搜索结果页，因为 MIP Page 的后续页面同样在 iframe 内部。
>
> 这两个变量正确的用法应该是：`isIframed` 用于增加针对 iframe 的一些兼容代码，如处理 iOS 下 iframe 的滚动 BUG 等等；而 `standalone` 则用于处理单独打开或者嵌入在搜索结果页（主要是和 SuperFrame 交互）两种情况的不同逻辑。

## sendMessage

* __参数__：
  * `eventName`, __string__, 信息名称
  * `data`, __Object__, 信息内容
* __返回值__：无。

用于向 __外部__ 发送信息 (postMessage)，仅在 MIP 页面被嵌入 SuperFrame 时生效。如在百度搜索结果页中需要通知信息给外部的 SuperFrame 时可以使用。

```javascript
window.MIP.viewer.sendMessage('mipMessage', {message: 'Hello SF! I am MIP'})
```

## onMessage

* __参数__：
  * `eventName`, __string__, 信息名称
  * `callback`, __Function__, 收到特定信息后的回调函数。仅有一个参数：消息的具体信息。
* __返回值__：无。

用于接收 __外部__ 发送的信息 (postMessage)，仅在 MIP 页面被嵌入 iframe 时生效。如在百度搜索结果页中需要接收外部的 SuperFrame 发来的信息时可以使用。

```javascript
window.MIP.viewer.onMessage('sfMessage', ({message}) => console.log(message))
```

## open

* __参数__：
  * `to`, __string__, 目标页面的 URL
  * `options`, __Object__, 一些配置项
    * `options.isMipLink`, __boolean__, 默认 `true`。目标页面是否是 MIP 页。如果不是，直接使用 `top.location.href` 进行跳转。
    * `options.replace`, __boolean__, 默认 `false`。目标页面是否采用 replace 方式打开。如果是，则不会新增一条历史记录。
* __返回值__：无。

以 API 的方式进行页面跳转，效果和 `<a href="xxx" mip-link>` 相同。如果目标页是 MIP 页，则会使用 MIP Page 的方式进行页面切换动画。
