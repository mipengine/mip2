# 沙盒机制

MIP 允许开发者通过提交 MIP 组件和写 `<mip-script>` 等方式去写 JS，但是从性能和代码维护的层面考虑，部分 `API` 是不应该使用的，比如 `alert`、`confirm` 等等，因此我们提供了沙盒机制，去屏蔽和限制这类 API/属性 的使用。

## 沙盒注入对象

相关工具：

1. [mip-cli](https://github.com/mipengine/mip2/tree/master/packages/mip-cli)
2. [mip-sandbox](https://github.com/mipengine/mip2/tree/master/packages/mip-sandbox)

会被沙盒注入的对象为**全部白名单以外的原生对象**和**全部作用域链上未定义的变量**。我们通过**白名单**的机制对原生对象进行限制，即开发者只能使用白名单上的对象，如果调用白名单以外的，会拿不到对象。在具体实现上，我们使用 MIP 编译工具 mip-cli 在组件调试和编译上线的时候调用 mip-sandbox 工具，将白名单之外的对象代码注入 `MIP.sandbox` 前缀，比如 `window` 将会编译得到 `MIP.sandbox.window`，然后通过控制对 MIP.sandbox 上属性或方法的定义，从而实现沙盒的白名单机制。

举个例子，假设 js 代码如下所示：

```javascript
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export default {
  async mounted() {
    await sleep(3000)
    console.log('mounted')
    window.setTimeout(() => {
      console.log('mounted')
    }, 3000)
    a = 1 + 1
    alert('mounted')
  }
}
```

将会编译生成：

```javascript
function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

export default {
  async mounted() {
    await sleep(3000)
    console.log('mounted')
    MIP.sandbox.window.setTimeout(() => {
      console.log('mounted')
    }, 3000)
    MIP.sandbox.a = 1 + 1
    MIP.sandbox.alert('mounted')
  }
}
```

可以看到 alert window 全被注入了 MIP.sandbox 前缀，a 由于没有在作用域链上声明，因此也被注入 MIP.sandbox 前缀。由于 MIP.sandbox.alert 不在白名单里，因此程序执行到此处将报错并且控制台打印以下错误信息：

```shell
> Uncaught TypeError: MIP.sandbox.alert is not a function
```

## 白名单

白名单分为普通模式和严格模式，其中严格模式是普通模式的子集，在开发组件的时候使用普通模式，在 HTML 页面写 mip-script 的时候使用严格模式。

### 安全原生对象

当原生对象被认为是安全原生对象时，在沙盒注入过程中不会加上任何沙盒前缀，比如：

```javascript
var util = require('path/to/util')

new Promise(function (resolve) {
  setTimeout(resolve, 3000)
})
.then(function () {
  console.log('after 3s')
})

```

以上代码使用到了 require、Promise、setTimeout、console 四个原生对象，由于这四个对象均被认为是安全的，所以不做任何沙盒注入的操作。

以下原生对象被认为是安全的：

```javascript
var RESERVED = [
  'arguments',
  'require',
  'module',
  'exports',
  'define'
]

var ORIGINAL = [
  'Array',
  'ArrayBuffer',
  'Blob',
  'Boolean',
  'DOMError',
  'DOMException',
  'Date',
  'Error',
  'Float32Array',
  'Float64Array',
  'FormData',
  'Headers',
  'Infinity',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'JSON',
  'Map',
  'Math',
  'NaN',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'ReadableStream',
  'ReferenceError',
  'Reflect',
  'RegExp',
  'Request',
  'Response',
  'Set',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'URIError',
  'URL',
  'URLSearchParams',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'WritableStream',
  'clearInterval',
  'clearTimeout',
  'console',
  'decodeURI',
  'decodeURIComponent',
  'devicePixelRatio',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'fetch',
  'getComputedStyle',
  'innerHeight',
  'innerWidth',
  'isFinite',
  'isNaN',
  'isSecureContext',
  'localStorage',
  'length',
  'matchMedia',
  'navigator',
  'outerHeight',
  'outerWidth',
  'parseFloat',
  'parseInt',
  'screen',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scrollX',
  'scrollY',
  'sessionStorage',
  'setInterval',
  'setTimeout',
  'undefined',
  'unescape'
]
```

其中 ORIGINAL 数组内的变量会在 MIP.sandbox 上定义一份，而 RESERVED 不会，因此：

```javascript
typeof MIP.sandbox.Promise === 'function'
typeof MIP.sandbox.arguments === 'undefined'
```

### 普通模式

普通模式下的沙盒安全变量包含原生安全变量的全部，并且添加了以下变量：

```javascript
var WHITELIST_ORIGINAL = [
  ...ORIGINAL,
  ...RESERVED,
  'File',
  'FileList',
  'FileReader',
  'Image',
  'ImageBitmap',
  'MutationObserver',
  'Notification',
  'addEventListener',
  'cancelAnimationFrame',
  'createImageBitmap',
  // 待定
  'history',
  // 待定
  'location',
  'removeEventListener',
  'requestAnimationFrame',
  'scrollBy',
  'scrollTo',
  'scroll',
  'scrollbars',
  'webkitCancelAnimationFrame',
  'webkitRequestAnimationFrame'
]
```

以上对象在普通模式下均不会注入沙盒。

在普通模式下自定义了以下对象：

```javascript
var WHITELIST_CUSTOM = [
  {
    name: 'document',
    // document 允许使用以下属性或方法
    properties: [
      'head',
      'body',
      'title',
      'cookie',
      'referrer',
      'readyState',
      'documentElement',
      'createElement',
      'createDcoumentFragment',
      'getElementById',
      'getElementsByClassName',
      'getElementsByTagName',
      'querySelector',
      'querySelectorAll'
    ]
  },
  {
    name: 'window',
    // window 指向 window.MIP.sandbox
    getter: 'MIP.sandbox'
  },
  {
    name: 'MIP',
    // MIP 指向 window.MIP
    getter: 'MIP'
  }
]
```

以上对象会被沙盒注入 MIP.sandbox 前缀，但由于这些对象是存在定义的，因此可以使用自定义后的功能：

```javascript
document.cookie // => MIP.sandbox.document OK
window.Promise // => MIP.sandbox.Promise OK
window.eval // => MIP.sandbox.eval undefined
MIP // => MIP.sandbox.MIP OK
```

### 严格模式

严格模式是普通模式的子集，其安全沙盒变量仅包含了安全原生对象的全部：

```javascript
var WHITELIST_STRICT_ORIGINAL = [
  ...ORIGINAL,
  ...RESERVED
]
```

严格模式下自定义了以下对象：

```javascript
// 安全自定义全局变量
var WHITELIST_STRICT_CUSTOM = [
  // document 只允许访问 document.cookie
  {
    name: 'document',
    properties: [
      'cookie'
    ]
  },
  // location 只放开以下属性的读权限
  {
    name: 'location',
    access: 'readonly',
    properties: [
      'href',
      'protocol',
      'host',
      'hostname',
      'port',
      'pathname',
      'search',
      'hash',
      'origin'
    ]
  },
  // MIP 对象只开放部分工具函数
  {
    name: 'MIP',
    access: 'readonly',
    properties: [
      'watch',
      'setData',
      'viewPort',
      'util',
      'sandbox'
    ]
  },
  // 严格模式下的 window 对象指向 MIP.sandbox.strict
  {
    name: 'window',
    getter: 'MIP.sandbox.strict'
  }
]
```
