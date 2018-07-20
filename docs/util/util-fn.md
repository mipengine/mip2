# 工具函数

我们封装了了一些通用的工具模块，在开发过程中可以直接进行调用。

## viewport

viewport 提供了视图相关的功能。
为什么要使用viewport?
1、提供一些视图相关的扩展功能
2、当页面被嵌入到iframe中，处理滚动事件时在页面的一些属性上会有一些bug

### 使用方式

```
const viewport = MIP.viewport;
// 获取 scrollTop
let scrollTop = viewport.getScrollTop();
// 设置 scrollTop
viewport.setScrollTop(20);
// 获取页面可视宽度
viewport.getWidth();
// 获取页面可视高度
viewport.getHeight();
// 获取页面实际宽度
viewport.getScrollwidth();
// 获取页面实际高度
viewport.getScrollHeight();
// 获取页面 Rect
viewport.getRect();

// 页面 scroll 事件
viewport.on('scroll', function () {
    // code
});

// 页面 changed 事件
// 当页面滚动结束，或者滚动速度比较低时，会触发 changed 事件
viewport.on('changed', function () {
    // code
});
```
## 通用工具函数

### 手机系统 & 浏览器内核 & 浏览器厂商判断

```
const util = MIP.util;
const platform = util.platform;

// Trident engine
platform.isTrident();
// Gecko engine
platform.isGecko();
// Webkit engine
platform.isWebkit();

// iOS system
platform.isIos();
// Android system
platform.isAndroid();

// Get system version
platform.getOsVersion();

// Uc browser
platform.isUc();
// Chrome browser
platform.isChrome();
// Android browser
platform.isAdr();
// Safari browser
platform.isSafari();
// QQ browser
platform.isQQ();
// Firefox browser
platform.isFireFox();
// Baidu browser
platform.isBaidu();

// Baidu application browser
platform.isBaiduApp();
// WeChat application browser
platform.isWechatApp();
// Weibo application browser
platform.isWeiboApp();
// QQ application browser
platform.isQQApp();
```

## 本地存储

存储模块为站点提供数据存储的功能，包括 localStorage 存储方式、通过 fetch 请求携带存储数据，站点自行在后端管理存储的方式。

示例

```
const util = MIP.util;
const CustomStorage = util.customStorage;
let storage = new CustomStorage([type]);
```

### API

#### **new util.customStorage(type)**

customStorage 类，用于初始化存储对象。

参数列表

参数|类型|必选|描述
---|---|---|---
type|number|是|type为存储类型，0表示 localStorage存储，1表示站点管理存储

示例

```
let CustomStorage = util.customStorage;
let storage = new CustomStorage(0);
```

#### **customStorage.set(name, value, [expire], [callback])**

设置当前站点下的存储。

参数列表

参数|类型|必选|描述
---|---|---|---
name|string|是|存储名称
value|string|是|存储值
expire|number|否|存储的过期时间，指的是当前站点整个存储的过期时间，单位为ms
callback|Function|否|存储出现问题时的回调

示例

```
btn.onclick = function() {
    customStorage.set('name', 'jake');
    customStorage.set('age', '22');
}
```

callback返回的error对象结构

参数|类型|描述
---|---|---
errCode|string|错误号，21为当前站点存储超限，22为整个localStorage存储空间不足
errMess|string|错误信息

### **customStorage.get(name)**

获取当前站点下的存储。

参数列表

参数|类型|必选|描述
---|---|---|---
name|string|是|存储名称

示例

```
let name = customStorage.get(name);
```

### **customStorage.rm(name)**

删除当前站点下的存储。

参数列表

参数|类型|必选|描述
---|---|---|---
name|string|是|存储名称

示例

```
customStorage.rm('name');
```

### **customStorage.rmExpires()**

删除整个localStorage存储中过期的站点存储数据。

示例

```
customStorage.rmExpires();
```

### **customStorage.clear()**

清空当前站点下数据存储。

示例

```
customStorage.clear();
```

#### **customStorage.request(opt)**

通过该方法发起请求，将数据通过请求传给站长，由站点自行对数据进行设置或获取；请求通过fetch的方式发出，具体可参考 mdn 提供的[使用fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)和[GlobalFetch.fetch()](https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalFetch/fetch)两篇文章。

参数列表

参数|类型|必选|描述
---|---|---|---
url|string|是|发送请求的地址
method|string|否|默认为get，请求方法 (GET, POST, or other)
mode|string|否|请求的模式，如 cors, no-cors,  same-origin
headers|Object|否|请求的头信息，形式为 Headers 对象或 yteString
body|Object|否|请求的 body 信息,可能是一个 Blob、BufferSource、FormData、URLSearchParams 或者 USVString 对象，注意 GET 或 HEAD 方法的请求不能包含 body 信息
credentials|string|否|请求的 credentials，如omit、same-origin 或者 include
cache|string|否|请求的 cache 模式: default, no-store, reload, no-cache, force-cache, or only-if-cached

示例

```
storage1.request({
    url: 'http://example.com/',
    type: 'POST',
    data: JSON.stringify({
      name: 'jack',
      age: 22
    }),
    success: function() {
      console.log('success');
    },
    error: function(e) {
      console.log(e);
    }
});
```

后端配置

请求采用 cors (跨域资源共享)的方式，需要站点后端配置 response header 才能使用，配置方式如下：

`Access-Control-Allow-origin: origin`，这个设置为允许跨站访问的域名，可以为百度 cache 域名和站长域名，不建议设置为`*`，目前百度 cache 域名需配置如下两个，分别为 `mipcache.bdstatic.com` 和 `*.mipcdn.com`。


