# mip-sandbox

mip-sandbox 是一系列跟 MIP 沙盒相关的工具，包括沙盒对象定义、代码沙盒检测工具、代码沙盒替换工具等等。

## 安装

通过 `npm` 进行安装：

```shell
npm install --save-dev mip-sandbox
```

## 使用

### 沙盒对象

```javascript
var sandbox = require('mip-sandbox')

// setTimeout
sandbox.setTimeout(function () {}, 3000)

// document
sandbox.document.cookie

// ...
```

### 不安全全局变量检测

```javascript
var detect = require('mip-sandbox/lib/unsafe-detect')

var code = `
var a = 1
console.log(b)
`

var results = detect(code)

console.log(result)

// [
//   {
//      type: 'Identifier',
//      name: 'b',
//      range: [...]
//      loc: [...]
//   }
// ]
```

### 不安全全局变量替换

```javascript
var replace = require('mip-sandbox/lib/unsafe-replace')

var code = `
var a = 1
console.log(b)
window.console.log(a)
`

var result = replace(code)

console.log(result)

// `
// var a = 1
// console.log(MIP.sandbox.b)
// MIP.sandbox.window.console.log(a)
// `

```

该方法使用 [escodegen](https://github.com/estools/escodegen) 实现的 ast to string

该方法的第二个参数 options 将会透传给 escodegen 因此比如需要返回 sourcemap 的话，请于第二个参数传入 sourcemap 相关参数

如:

```javascript
var output = replace(code, {
  sourceMap: true
})

// output.code
// output.map
```

## 沙盒替换规则

沙盒替换采用白名单机制，即只允许开发者使用部分全局 API，不在白名单里的方法会在编译时自动将相关代码加上 `MIP.sandbox` 前缀，这样就会导致报错。

比如下面一段代码：

```javascript
const a = require('path/to/a')
console.log(a)
eval('console.log("b")')
window.console.log(b)

setTimeout(function () {
  console.log(this)
}.bind(undefined), 3000)
```

将会替换成：

```javascript
const a = require('path/to/a')
console.log(a)
MIP.sandbox.eval('console.log("b")')
MIP.sandbox.window.console.log(MIP.sandbox.b)

setTimeout(function () {
  console.log(MIP.sandbox.this(this))
}.bind(undefined), 3000)
```

**解释**

上述代码中 require、console、eval、window、setTimeout、undefined、b 属于全局变量，其中 require、console 属于安全全局变量，所以不做任何处理；eval、window、b 属于不安全全局变量，因此会加上 `MIP.sandbox` 前缀，其中 MIP.sandbox.window 是有定义的，而 MIP.sandbox.eval 和 MIP.sandbox.b 没有定义，因此上述代码会报错。

## this 沙盒替换

上述代码中经过对比可以看到 this 被替换成了 MIP.sandbox.this(this)，这是因为在类似 `function () {}.bind(undefined)` 的情况下，函数内的 this 指向 window，而 诸如 `document.addEventListener('scroll', function () {})`，的回调里的 this 指向 document,这些都是不安全全局变量，因此需要 MIP.sandbox.this() 方法将 window 和 document 替换掉：

```javascript
MIP.sandbox.this = function (that) {
  return that === window ? MIP.sandbox : that === document ? MIP.sandbox.document : that
}
```

## 可用全局变量

以下变量是 MIP sandbox 暴露给用户可直接使用的全局变量，后续会根据实际需要进行增加或减少：

```javascript
var WINDOW_ORIGINAL_KEYWORDS = [
  'Array',
  'ArrayBuffer',
  'Blob',
  'Boolean',
  'DOMError',
  'DOMException',
  'Date',
  'Error',
  'File',
  'FileList',
  'FileReader',
  'Float32Array',
  'Float64Array',
  'FormData',
  'Headers',
  'Image',
  'ImageBitmap',
  'Infinity',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'JSON',
  'Map',
  'Math',
  'MutationObserver',
  'NaN',
  'Notification',
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
  'addEventListener',
  'cancelAnimationFrame',
  'clearInterval',
  'clearTimeout',
  'console',
  'createImageBitmap',
  'decodeURI',
  'decodeURIComponent',
  'devicePixelRatio',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'fetch',
  'getComputedStyle',
  // 待定
  'history',
  'innerHeight',
  'innerWidth',
  'isFinite',
  'isNaN',
  'isSecureContext',
  'localStorage',
  // 待定
  'location',
  'length',
  'matchMedia',
  'navigator',
  'outerHeight',
  'outerWidth',
  'parseFloat',
  'parseInt',
  'removeEventListener',
  'requestAnimationFrame',
  'screen',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scroll',
  'scrollBy',
  'scrollTo',
  'scrollX',
  'scrollY',
  'scrollbars',
  'sessionStorage',
  'setInterval',
  'setTimeout',
  'undefined',
  'unescape',
  'webkitCancelAnimationFrame',
  'webkitRequestAnimationFrame'
]

var WINDOW_CUSTOM_KEYWORDS = [
  'document',
  'window',
  'MIP'
]

var RESERVED_KEYWORDS = [
  'arguments',
  'MIP',
  'require',
  'module',
  'exports',
  'define'
]

var DOCUMENT_ORIGINAL_KEYWORDS = [
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

```



