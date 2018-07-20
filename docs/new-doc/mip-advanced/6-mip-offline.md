# 离线可用在 MIP 中的实现

Web 相比于 Native APP 来说，有一个比较明显的缺陷，那就是离线的能力，如果你没有连接到网络想必网页一定是打不开的。为了拥有离线能力Web也有过很多的尝试，比如很多浏览器提供 Reading List，HTML5 的 APPCache，indexDB、localStorage、sessionStorage 等一系列的存储API，以及本文要介绍的 **Service Worker**，MIP 目前已封装了 Service Worker 功能组件作为官方组件。

## 概述

Service Worker 属于一种共享的 Web Worker(shared worker)，运行在页面进程之外。因此 Service Worker 天生和页面脚本没有耦合，在引入 Service Worker 的同时无须重构既有代码。

Service Worker 进程采用较为现代的接口。Web Worker 是事件驱动的 JS 进程，而 Service Worker 可以监听到更多的功能事件(Functional Events)，比如资源请求(fetch)、 推送通知(push)、 后台同步(sync)。这些事件大多基于 ExtendableEvent 实现，并采取Promise 接口，用起来相当舒服。

## 生命周期

Service Worker 的使用方式很简单，在页面脚本中注册 Service Worker 文件所在的 URL，Service Worker 就开始安装和激活了。激活后的Service Worker 就可以监听到功能事件了。同一页面中，新注册的 Service Worker 会在旧的 Service Worker 没人在使用时被激活。MDN 给出了很漂亮的生命周期图示，如图下图所示。

![Service Worker 生命周期图示](./images/sw-life-cycle.png)

图中表示了 Service Worker 运行过程中的完整生命周期，包括了 Installing(加载阶段)、Installed(加载完成，等待被激活)、Activating(激活阶段)、Activated(已经被激活，此时 Service Worker 可以监听并处理相应事件)、Redundant(销毁阶段)等阶段，开发者可以通过这些阶段清晰地了解 Service Worker的运作流程，并且可以在不同阶段加入自己需要的逻辑和策略。

## Fetch API

随着 PWA 进入我们的视野，Fetch 作为除了 AJAX 之外的第二个 JavaScript HTTP API 开始引起人们的关注。Service Worker 中通常利用该 API 进行真正的网络请求并应用相应的缓存策略。下面简要介绍 Fetch API 的使用情况，Service Worker 与 window 中的实现差异，以及跨域 Fetch 的问题。

### Fetch 示例

Fetch 方法是 Fetch API 的核心方法，同时定义在 `window` 和 `WorkerGlobalScope`，因此可以作为通用的方法来使用。在 Fetch 标准中该方法的声明如下面代码所示。

```js
partial interface WindowOrWorkerGlobalScope {
  [NewObject] Promise<Response> fetch(RequestInfo input, optional RequestInit init);
};
```

`fetch` 方法返回一个 Promise，因此使用起来非常有现代感，如下面代码所示：

```js
fetch('http://somehost.com')
  .then(function(res) {
    // 使用该 HTTP 响应
  }).catch(function(err) {
    // 处理错误 err
  })
```

### 跨域 Fetch

Service Worker 实现离线缓存时，通常需要监听 fetch 事件并应用缓存。fetch 事件作用于当前受控制的页面时，既可以拦截同域的请求也可以拦截跨域的请求。以 mipengine.org 为例，这意味着 mipengine.org 的页面请求 example.com 中的资源时，mipengine.org 的 Service Worker 会收到 fetch 事件，但 mipengine.com的Service Worker不会(在启用了 Foreign Fetch 的 Service Worker 中，情况可能略有不同)。

在跨域资源请求的情况下，Service Worker 中进行 Fetch 和写 CacheStorage 操作都可以成功。但需要注意的是 Fetch API 的设计比 AJAX 更为底层，但二者的 CORS 策略是一致的。具体来说，如果 Fetch 时声明了 `no-cors` 就可以跨域 Fetch，其代价是无法读取响应状态码和响应体内容。

虽然跨域情况下无法知晓响应体和状态码，但考虑到 Service Worker 需要了解 Fetch 是否成功来进行缓存，Response 给出了 ok 属性来判断获取成功与否，如下面代码所示。

```js
fetch('http://somehost.com/foo.jpg', {mode: 'no-cors'})
  .then(function (res) {
    if (!res.ok) {
      return
    }
    caches.open('a-cache-name').then(function (cache) {
      cache.put('http://somehost.com/foo.jpg', res)
    })
  })
```

我们在[服务器通信那一章中](./2-data-from-server.md)详细的对 fetch 请求方式也做了详细讲解，这里就不再展开，开发者可以根据对应章节对fetch 功能进行详细了解。

## MIP中使用 Service Worker

从上面可以了解到 Service Worker 的基本情况和强大的功能，那么在MIP中应该如何进行使用？如何让我们的页面具有离线效果呢？根据下面展示的一段MIP Service Worker组件的源码实例我们可以比较直观的进行了解，如下面代码所示。

```html
<mip-install-serviceworker
  src="/service-worker.js"
  data-iframe-src="https://example.com/dist/static/sw.html"
  data-no-service-worker-fallback-url-match=".*\/(doc|guide)\/.*"
    data-no-service-worker-fallback-shell-url="https://example.com/dist/static/shell.html"
  layout="nodisplay" >
</mip-install-serviceworker>
```

### 引入Service Worker 脚本

```html
<script async src="http://c.mipcdn.com/static/v1/mip-install-serviceworker/mip-install-serviceworker.js"></script>
```

### 参数列表

下表展示了在使用 MIP Service Worker 离线功能时，所需要设置的参数列表。

参   数 | 类    型 | 必    填 | 详细说明
---|---|---|---
src | String | 否 | Service Worker 文件的路径，如果不在缓存路径下打开，会采用 src 注册 Service Worker
data-iframe-src | String | 否 | 安装 Service Workder 的页面地址，在缓存下打开，由于不同域，无法直接注册，所以采用 iframe 实现
data-no-service-worker-fallback-url-match | String | 否 | 当前环境不支持 Service Worker 的时候，可以通过制定一个特殊的同源 shell 页面，提前加载这个 shell 页面进行浏览器缓存，可以通过 `data-no-service-worker-fallback-url-match` 属性指定需要跳转到该 shell 页面的规则，该属性为正则表达式
data-no-service-worker-fallback-shell-url | String | 否 | 指定的 shell 页面的 url,需要和 MIP 页面保持同源，当该 shell 页面加载完成之后，有必须通过 url hash 后的参数 redirect 回到原页面的逻辑

目前S ervice Worker 标准虽然仍处于草案阶段，但浏览器厂商已经在快速地跟进实现了。目前 Firefox、Chrome、Safari 均已发布支持Service Worker 的版本。国内的厂商大多基于 Webkit 内核进行包装或二次开发，因此这些浏览器的支持问题并不大。所以开发者也可以实时关注目前 Service Worker 的动态并根据需求进行使用。
