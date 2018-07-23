# MIP 中与服务端通信

使用 MIP 可以生成一个纯前端的 HTML 页面，同时，它也提供了很多与服务端通信的方案，可以通过 CORS 或者 jsonp 来与服务端进行通信，异步进行页面局部的更新。MIP 封装了 API 给服务端通信赋能，`Fetch` 和 `fetch-jsonp`，`Fetch` 采用浏览器原生的方法，通过 AJAX 的方式与服务端进行数据交互，需要通过 CORS 解决跨域问题，`fetch-jsonp` 通过 jsonp 的协议来实现。

## Fetch

`Fetch` 是一种新的致力于替代 `XMLHttpRequest` 的技术，因为 MIP 直接使用了这项技术，并没有进行特殊封装，所以本节接下来主要介绍一下它的 API、基本使用、解决的问题。

### Fetch API

`fetch` 方法集成在 `window` 这个全局的对象之中。通过这个方法向远程服务器发送数据请求，返回的是一个 `Promise` 对象，下面是一个最常见的 `fetch` 请求数据的写法，如下面代码所示。

```js
// AJAXurl fetch请求的URL 地址，res是服务端返回的数据
fetch(AJAXurl).then(function (res) {
  return res.text()
}).then(function (text) {
  // 成功回调
  fetchElement.innerHTML = 'fetch: ' + (text.search('mip-test') !== -1)
})
```

从上面代码可以看出，`fetch` 返回的是一个 `Promise`，所以可以直接通过 `Promise` 的回调处理服务端的返回值。

### Fetch 基本使用方法

使用 `Fetch` API 的过程中可以自定义请求头信息，通过 Headers 这个对象来配置，如下面代码所示。

```js
//创建一个 Request 对应，自定义 Headers
let request = new Request(url, {
  headers: new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  })
})
fetch(request).then(function() {
  // 处理响应数据
})
```

也可以创建一个 `Request` 对象，然后以参数形式传入 `fetch` 函数中，来发送一个自定义的 Request，如下面代码所示。

```js
// 创建一个Request对象
let req = new Request(URL, {
  method: 'GET',
  cache: 'reload'
})
// 将 Request 对象 req 作为 fetch 的参数
fetch(req).then(function (response) {
  return response.json()
}).then(function(json) {
  handleRes(json)
})
```

在这个示例里，我们明确了请求方法，要求它永远不要缓存响应。更有意思的是，Request 可以从一个已有的请求再创建一个新的请求，新 Request 和旧 Request 相同，不过我们可以调整，如下面代码所示。

```js
// 集成 req 的特征，并修改其 method 方式，变成 POST
let postReq = new Request(req, {
  method: 'POST'
})
```

关于 `Fetch` API 的其他更多特性就不一一介绍了，感兴趣的开发者们可以查阅 `Fetch` API相关资料进行了解更多。

### 浏览器支持情况

Chrome 42+、Opera 29+、Firefox 39+、Android Browser 5 和 Android Browser6 都已经支持 Fetch，具体可参看 [caniuse](http://caniuse.com/#search=fetch) 的官方数据。不过目前 IE 系浏览器还不支持 Fetch，如果用户使用的浏览器不支持 `Fetch` API也没关系，MIP 引入了 Fetch API Polyfill，对这些不支持的浏览器做了兼容。

### Fetch 解决的问题

提到获取资源我们都会想到 XHR(XMLHttpRequest)，以及通过这个接口实现的 AJAX。这是传统的获取数据请求资源的方法。XMLHttpRequest 并不是一个完美的 API，配置和调用显得有点混乱，加上是基于事件的异步模型，也没有现在的 `Promise`、`async/await` 优雅。`Fetch` API 的出现就是为了解决这个问题。

### AJAX 跨域问题的解决方案

通过 `Fetch` API来和服务端进行通信，如果域名不一致，就会涉及跨域问题，这个目前在 MIP 中，是通过 CORS 方案来解决的，主要原理是通过对服务端的响应头里面的 `Access-Control-Allow-Origin` 参数进行控制，从而克服了 AJAX 只能同源使用的限制。浏览器将 fetch 请求发送服务器，让我们来看看服务器 CORS 方案的响应情况，如下面代码所示。

```bash
# 请求头信息
GET /resources/public-data/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1b3pre) Gecko/20081130 Minefield/3.1b3pre
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
Referer: http://foo.example/examples/access-control/simpleXSInvocation.html
Origin: http://foo.example

# 响应头信息
Access-Control-Allow-Origin: *
```

上面代码的前半部分是 HTTP 头部信息发送的内容。Origin 信息表明 HTTP 调用是来自域名 `http://foo.example` 的内容。
代码的后半部分显示了 `http://bar.other` 服务器的 HTTP 响应信息，在代码中我们只放了关键的信息，将其他的无关信息都隐去了。作为响应，服务器发回一个 `Access-Control-Allow-Origin` 头部信息，如上述代码所示，`Access-Control-Allow-Origin` 使用了一种最简单的访问控制协议，在这种情况下，`Access-Control- Allow-Origin: *` 代表该资源可以被任何域访问。如果资源所有者 `http://bar.other` 希望将资源的访问权限只开放给 `http://foo.example`，可以修改返回的头部信息，如下面代码所示。

```bash
Access-Control-Allow-Origin: http://foo.example
```

请注意，现在只有 `http://foo.example` 这个外站的域可以以跨站点的方式访问资源。

## fetch-jsonp

前面一节，相信大家已经领略到 Fetch API 和普通 XHR 的差距了，而这种 AJAX 会遇到的跨域问题，上一节我们已经给出一种 CORS 的解决方案。同时，我们也可以使用 fetch-jsonp 来完美解决这个问题。jsonp 不支持标准的 fetch API，所以，MIP 采用了和 fetch 风格相似的fetch-jsonp 来解决跨域的问题。fetch-jsonp API 和 fetch API 完全一致。

### fetch-jsonp 的基本用法

接下来，给大家带来一个在MIP中使用时最简单的 fetch-jsonp 的例子。

```JS
// 引入 fetch-jsonp 模块 fetchJsonp 做为 Polyfill 已经被 MIP 挂在了 window 下
fetchJsonp('xxx', {
  jsonpCallback: 'callback'
}).then(function (res) {
  // 处理响应数据
  return res.json()
}).then(function (data) {
  // 处理parse 后的data数据
  console.log(data)
}).catch(function(ex) {
  // 捕获 parse的异常
  console.log('parsing failed', ex)
})
```

我们可以看到，在使用响应数据 data 之前，有一段代码 `return res.json()`，这个需要保留，fetch-jsonp 通过这种方式使其 API 和 fetch AIP 保持一致。自定义 jsonp 的回调函数名称，默认是 callback，如下面代码所示。

```js
fetchJsonp('xxx', {
  // 自定义 JSONP的回调函数名称为custom_callback
  jsonpCallback: 'custom_callback',
  jsonpCallbackFunction: '<name of your callback function>'
})
// ...
```

设置超时时间，单位默认是毫秒(ms)，如下面代码所示。

```js
fetchJsonp('xxx', {
  // 设置超时时间为3s
  timeout: 3000,
  jsonpCallback: 'custom_callback',
  jsonpCallbackFunction: '<name of your callback function>'
})
// ...
```

## 服务端返回的数据渲染

前面已经详细讲述了服务端的数据在 MIP 中可以通过 Fetch API 和 fetch-jsonp API 两种方式获取到客户端，当数据响应回来之后，客户端如何来进行渲染呢？在 MIP 组件开发中，我们可以直接在 MIP Custom Elements 对应的 Vue 组件中获取数据之后进行渲染。

如果需要实现一个 `mip-custom-list` 列表展现类型的组件，我们可以通过 fetch-jsonp API 从服务端获取数据，然后将数据渲染成`mip-custom-list` 组件的内容，`mip-custom-list` 组件在 MIP 页面中使用方式如下所示。

```html
<mip-custom-list src="http://xxx?a=a&b=b" id="mip-custom-list" has-more pnName="pageNum" pn=2>
</mip-custom-list>
```

MIP 组件提供了 src、pnName 等参数，通过 fetch-jsonp 的方式与服务端进行通信，通过对应的 template 模板标签内容，进行数据渲染。下面给出 `mip-custom-list` 组件实现的关键代码片段。根据标签属性的值来进行 URL 的拼装，通过 fetch-jsonp 方式获取数据，如下所示。

```html
<template>
  <div class="mip-custom-list">
  <div class="mip-custom-list-tr" v-for="item in listData">
      <div class="mip-custom-list-td">
        {{ item.name }}
      </div>
      <div class="mip-custom-list-td">
        {{ item.age }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['src', 'pnName', 'pn'],
  data() {
    return {
      listData: []
    }
  },
  created() {
    let me = this
    // 链接生成
    let url = getUrl(me.src, me.pnName, me.pn++)
    // 调用 fetch-jsonp
    fetchJsonp(url, {
      jsonpCallback: 'callback'
    }).then(function (res) {
      return res.json()
    }).then(function (data) {
      // 渲染逻辑,直接进行数据赋值就可以了
      // 假设 data 的值为 mip-custom-list 所需的数组数据 
      me.listData = data
    })
  }
}
</script>
```

我们可以看到，这个组件通过 fetch-jsonp API 和服务端进行通信，通信的参数信息，来自于 `mip-custom-list` 组件的参数，这些参数通过 JS 提供的 `getUrl` 函数拼接好 fetch-json 要请求的 URL 后，向服务器发送请求后，服务器将响应数据返回，当拿到服务端返回的数据之后就可以将数据和 Vue 实例数据进行绑定，结合 Vue 组件的模版，就可以将列表内容渲染出来了。

本节介绍了 MIP 中与服务端通信的方式，主要通过 Fetch API、fetch-jsonp API 来解决，同时也给出了一些在 MIP 组件中的应用。通过这节的学习，能够解决开发者在  MIP 页面上局部刷新的技术问题。
