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

使用例子如下：

```javascript
var detect = require('mip-sandbox/lib/unsafe-detect')
var keywords = require('mip-sandbox/lib/keywords')

var code = `
var a = 1
console.log(b)
`

// 严格模式 请使用 keywords.WHITELIST_STRICT
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

使用 `mip-sandbox/lib/generate` 方法进行不安全全局变量替换，该函数的定义如下

```javascript
/**
 * 不安全全局变量替换
 *
 * @param {string|AST} code 代码字符串或代码 AST
 * @param {Array=} keywords 安全全局变量声明列表，
 *                           在默认情况下，所有全局变量包括 window document 等均认为不安全，
 *                           需要传入该参数进行条件过滤
 * @param {Object=} options options
 * @param {string=} options.prefix 默认全局变量注入的前缀，默认为 MIP.sandbox
 * @param {Object=} options.escodegen 透传给 escodegen 的参数
 * @return {string} 替换后的代码字符串
 */
```

使用例子如下：

```javascript
var generate = require('mip-sandbox/lib/generate')
var keywords = require('mip-sandbox/lib/keywords')

var code = `
var a = 1
console.log(b)
window.console.log(a)
`

var result = generate(code, keywords.WHITELIST_RESERVED)

console.log(result)

// var a = 1
// console.log(MIP.sandbox.b)
// MIP.sandbox.window.console.log(a)
```

对于严格模式下 window 需要替换成 `MIP.sandbox.strict.window` 在这种情况下，需要传入第三个参数：

**options.prefix**

默认的 options.prefix === 'MIP.sandbox'，在严格下可以传入 MIP.sandbox.strict，得到的结果将如下所示：

```javascript
var result = generate(code, keywords.WHITELIST_STRICT_RESERVED, {prefix: 'MIP.sandbox.strict'})

// var a = 1
// console.log(MIP.sandbox.b)
// MIP.sandbox.strict.window.console.log(a)
```

该方法使用 [escodegen](https://github.com/estools/escodegen) 实现的 ast to string

该方法的第三个参数 options.escodegen 将会透传给 escodegen 因此比如需要返回 sourcemap 的话，请于第二个参数传入 sourcemap 相关参数

如:

```javascript
var output = generate(code, keywords.WHITELIST_RESERVED, {
  escodegen: {
    sourceMap: 'name',
    sourceMapWithCode: true
  }
})

// output.code
// output.map
```

对于不需要生成 sourceMap 的情况，可以使用 generate-lite 来去掉 source-map 相关代码以减小打包体积。

该方法的定义如下：

```javascript
/**
 * 不安全全局变量替换
 *
 * @param {string|AST} code 代码字符串或代码 AST
 * @param {Array=} keywords 安全全局变量声明列表，
 *                           在默认情况下，所有全局变量包括 window document 等均认为不安全，
 *                           需要传入该参数进行条件过滤
 * @return {string} 替换后的代码字符串
 */
```

```javascript
var generate = require('mip-sandbox/lib/generate-lite')
var keywords = require('mip-sandbox/lib/keywords')
var code = generate(code, keywords.WHITELIST_RESERVED)
```

### 沙盒检测替换优化

在某些场景下需要同时使用 detect 和 generate 去实现功能，这时，如果对这两个方法传入的 code 都是字符串的话，就需要对字符串做两次 ast 解析和标记，为了解决这个问题，可以调用 global-mark 生成解析标记好的 ast，再将 ast 传入 detect 和 generate 中，从而提高效率：

```javascript
var mark = require('mip-sandbox/lib/global-mark')
var detect = require('mip-sandbox/lib/unsafe-detect')
var generate = require('mip-sandbox/lib/generate')
var keywords = require('mip-sandbox/lib/keywords')

var ast = mark(code)
var unsafeList = detect(ast, keywords.WHITELIST)
var generated = generated(ast, keywords.WHITELIST_RESERVED)
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

在 mip-script 中，理论上只允许进行数据运算和发请求等等操作，不允许直接操作 DOM ，因此在 mip-script 中写的 js 将会以沙盒的严格模式进行全局变量替换，比如 window 会被替换成 `MIP.sandbox.strict.window`、 this 将会替换成 `MIP.sandbox.strict.this(this)`。

其中 MIP.sandbox.strict 是 MIP.sandbox 的子集。

## 可用全局变量

以下变量是 MIP sandbox 暴露给用户可直接使用的全局变量，后续会根据实际需要进行增加或减少。


### 原生安全的全局变量

以下全局变量被认为是安全的，在沙盒注入过程中不会加上任何沙盒前缀：

```javascript

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
  'unescape',
  // mip1 polyfill
  'fetchJsonp'
]

var RESERVED = [
  'arguments',
  'require',
  'module',
  'exports',
  'define',
  'import'
]

```

### 普通模式的沙盒安全变量

普通模式下的沙盒安全变量包含原生安全变量的全部，并且添加了以下变量：

```javascript
// 全局安全变量
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

// 自定义安全变量
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

因此，白名单的定义为，普通模式下的全局安全变量与自定义安全变量的集合：

```javascript
var WHITELIST = WHITELIST_ORIGINAL.concat(WHITELIST_CUSTOM.map(item => item.name))
var WHITELIST_RESERVED = WHITELIST_ORIGINAL
```

### 严格模式下的沙盒安全变量
严格模式下的沙盒安全变量包含原生安全变量的全部，并且添加了以下变量：

```javascript
// 安全原生全局变量
var WHITELIST_STRICT_ORIGINAL = [
  ...ORIGINAL,
  ...RESERVED
]

// 安全自定义全局变量
var WHITELIST_STRICT_CUSTOM = [
  // 只允许访问 document.cookie
  {
    name: 'document',
    properties: [
      'cookie'
    ]
  },
  // location 只放开读权限
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

因此，严格模式下白名单的定义为，普通模式下的全局安全变量与自定义安全变量的集合：

```javascript
var WHITELIST_STRICT = WHITELIST_STRICT_ORIGINAL.concat(WHITELIST_STRICT_CUSTOM.map(item => item.name))
var WHITELIST_STRICT_RESERVED = WHITELIST_STRICT_ORIGINAL
```

