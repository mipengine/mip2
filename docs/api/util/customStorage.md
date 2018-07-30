# MIP.util.customStorage

MIP 提供了一套 MIP 站点内容储解决方案，其中包含 localStorage，request 到服务端，cookie 等方案，调用 `MIP.util.customStorage()` 方法将得到对应的存储对象，开发者可以用这些对象完成 MIP 站点内容存储的需求。

- 用法

```js
MIP.util.customStorage(type)
```

- 参数

类型|参数名|是否必选|描述
---|---|---|---
number|type|是|存储对象的类型，取值为 0, 1, 2 中的一个

- 0: 表示返回的是 localStorage 对象
- 1: 表示返回的是 asyncStorage 对象
- 2: 表示返回的是 cookieStorage 对象

下面我们详细介绍 localStorage, asyncStorage, cookieStorage 的具体 API 和用法。

## localStorage

通过调用 `MIP.util.customStorage(0)` 返回的对象，该对象封装了 localStorage 对象，提供了几个方法给开发者使用，下面我们详细介绍下这些方法。

### 方法

#### localStorage.set

- 描述

使用当前 MIP 站点域下的 MIP localStorage 存储内容

- 参数

类型|参数名|是否必选|描述
---|---|---|---
string|name|是|localStorage 存储的 key
string|value|是|localStorage 存储的内容
string|expire|否|localStorage 存储的过期时间
Function|callback|否|localStorage 存储成功后的回调

- 返回

`undefined`

- 用法

```js
let lsObject = MIP.util.customStorage(0)
lsObject.set('test-ls-key', 'storage content', 24 * 60 * 60 , function (err) {
  // 如果发生错误，将会执行回调
  console.log(err)
})
```

> 注意：
> 使用 MIP 提供的 localStorage 封装的对象存储的内容应该控制在 4K 以内

#### localStorage.get

- 描述

从当前 MIP 站点域下的 MIP localStorage 中获取内容

- 参数

类型|参数名|是否必选|描述
---|---|---|---
string|name|是|localStorage 存储的 key

- 返回

类型|描述
---|---
string|返回的对应的 key 的 localStorage 存储的内容

- 用法

```js
// 结合前面的例子
let lsObject = MIP.util.customStorage(0)
let content = lsObject.get('test-ls-key')
console.log(content)
// 返回的是存储的内容
```

#### localStorage.rm

- 描述

删除当前 MIP 站点域下的 MIP localStorage 中某一个存储的内容

- 参数

类型|参数名|是否必选|描述
---|---|---|---
string|name|是|localStorage 存储的 key

- 返回

`undefined`

- 用法

```js
// 结合前面的例子
let lsObject = MIP.util.customStorage(0)
lsObject.set('test-ls-key2', 'storage content2')
console.log(lsObject.get('test-ls-key2')) // 这里返回 `storage content2`
lsObject.rm('test-ls-key2')
console.log(lsObject.get('test-ls-key2')) // 这里返回 undefined
```

#### localStorage.clear

- 描述

清空当前 MIP 站点域下的所有的存储内容

- 参数

无

- 返回

`undefined`

- 用法

```js
// 结合前面的例子
let lsObject = MIP.util.customStorage(0)
console.log(lsObject.get('test-ls-key')) // 返回 'storage content'
lsObject.clear()
console.log(lsObject.get('test-ls-key')) // 返回 undefined
```

#### localStorage.rmExpires

- 描述

删除当前 MIP 站点域下的 MIP localStorage 中所有过期的内容

- 参数

无

- 返回

`undefined`

- 用法

```js
let lsObject = MIP.util.customStorage(0)
lsObject.rmExpires() // 如果当前的 MIP localStorage 中含有过期的内容，就会被删除
```

## asyncStorage

asyncStorage 是一个 MIP 封装的请求服务端的对象，用来和服务端交互，让服务端帮助前端进行持久化存储。

### 方法

#### asyncStorage.request

- 描述

MIP 页面域下，异步请求服务端接口。

- 参数

类型|参数名|是否必选|描述
---|---|---|---
Object|opt|是|请求参数对象
string|opt.utl|是|请求的 URL
string|opt.mode|否|请求的模式，默认为 `null`， 可取值：`no-cors`, `cors`, `*same-origin` 等
string|opt.method|否|请求的方法，默认为 `GET`, 可取值 `POST`, `PUT`, `DELETE` 等
string|opt.credentials|否|请求的凭证，默认为 `omit` 可取值 `include` 等
string|opt.cache|否|请求的缓存类型，默认为 `default`，可取值 `no-cache`, `reload`, `force-cache`, `only-if-cached`等
string|opt.headers|否|请求的请求头，默认为浏览器自带请求头，可以通过该参数指定自定义的请求头
string|opt.body|否|请求发送给服务端的内容
Function|opt.success|否|请求成功后的回调
Function|opt.error|否|请求失败后的回调

> `asyncStorage.request()` 方法是基于 `fetch()` 方法的封装，的参数基本和 `fetch()` 方法保持一致，详见：[https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)

- 返回

`undefined`

- 用法

```js
let asObject = MIP.util.customStorage(1)
asObject.request({
  url: 'https://same-origin-host.com/some/path',
  mode: null,
  method: 'POST',
  body: JSON.stringify({a: 1}),
  success(ret) {
    console.log(ret)
    // 请求成功后的返回内容
  },
  error(err) {
    console.log(err)
    // 请求失败后的内容
  }
})
```

> 提示：
> 通常我们与服务端通信，不太会借助 `MIP.util.customStorage(1)` 提供的 asyncStorage，可以直接使用 `fetch()` 方法，MIP 已经集成了 `fetch()` 方法的 polyfil 保证所有浏览器都能使用。

## cookieStorage

cookieStorage 是 MIP 提供的一个在前端操作 cookie 的对象，MIP 为了保证 web 安全，不建议直接在前端操作 cookie，所以在 cookieStorage 中只提供了一个清除过期 cookie 的方法。

### 方法

#### cookieStorage.delExceedCookie

- 描述

清除 MIP 页面域下的过期 cookie

- 参数

无

- 返回

`undefined`

- 用法

```js
let cookieStorage = MIP.util.customStorage(2)
cookieStorage.delExceedCookie()
// 当前域下的所有过期的 cookie 都会被删除
```
