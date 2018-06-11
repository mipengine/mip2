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

使用 `mip-sandbox/lib/unsafe-detect` 方法进行不安全全局变量检测，该函数的定义如下

```javascript
/**
 * 不安全全局变量检测
 *
 * @params {string|AST} code 代码字符串或代码 AST
 * @params {Array=} keywords 安全全局变量声明列表，
 *                           在默认情况下，所有全局变量包括 window document 等均认为不安全，
 *                           需要传入该参数进行条件过滤
 * @return {Array.<ASTNode>} 不安全全局变量列表
 */
```

```javascript
var detect = require('mip-sandbox/lib/unsafe-detect')
var keywords = require('mip-sandbox/lib/keywords')

var code = `
var a = 1
console.log(b)
`

// 严格模式 请使用 keywords.WHITLIST_STRICT
// 在前端使用时，可通过 MIP.sandbox.WHITELIST 去拿该列表
var results = detect(code, keywords.WHITELIST)

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
var generate = require('mip-sandbox/lib/generate')
var keywords = require('mip-sandbox/lib/keywords')

var code = `
var a = 1
console.log(b)
window.console.log(a)
`

var result = generate(code, keywords.WHITELIST)

console.log(result)

// var a = 1
// console.log(MIP.sandbox.b)
// MIP.sandbox.window.console.log(a)
```

对于严格模式下 window 需要替换成 `MIP.sandbox.strict.window` 在这种情况下，需要传入第三个参数：

**options.prefix**

默认的 options.prefix === 'MIP.sandbox'，在严格下可以传入 MIP.sandbox.strict，得到的结果将如下所示：

```javascript
var result = generate(code, keywords.WHITELIST, {prefix: 'MIP.sandbox.strict'})

// var a = 1
// console.log(MIP.sandbox.b)
// MIP.sandbox.strict.window.console.log(a)
```

该方法使用 [escodegen](https://github.com/estools/escodegen) 实现的 ast to string

该方法的第三个参数 options.escodegen 将会透传给 escodegen 因此比如需要返回 sourcemap 的话，请于第二个参数传入 sourcemap 相关参数

如:

```javascript
var output = generate(code, {
  escodegen: {
    sourceMap: 'name',
    sourceMapWithCode: true
  }
})

// output.code
// output.map
```

对于不需要生成 sourceMap 的情况，可以使用 generate-lite 来去掉 source-map 相关代码以减小打包体积：

```javascript
var generate = require('mip-sandbox/lib/generate-lite')
var keywords = require('mip-sandbox/lib/keywords')
var code = generate(code, keywords.WHITELIST)
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

## 严格模式

在 mip-script 中，理论上只允许进行数据运算和发请求等等操作，不允许直接操作 DOM ，因此在 mip-script 中写的 js 将会以沙盒的严格模式进行全局变量替换，比如 window 会被替换成 `MIP.sandbox.strict.window`、 this 将会替换成 `MIP..strict.this(this)`。

其中 MIP.sandbox.strict 是 MIP.sandbox 的子集。

## 可用全局变量

以下变量是 MIP sandbox 暴露给用户可直接使用的全局变量，后续会根据实际需要进行增加或减少：

```javascript
var WINDOW_ORIGINAL = [
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

var WINDOW_CUSTOM = [
  'document',
  'window',
  'MIP'
]

var RESERVED = [
  'arguments',
  'MIP',
  'require',
  'module',
  'exports',
  'define'
]

var DOCUMENT_ORIGINAL = [
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



