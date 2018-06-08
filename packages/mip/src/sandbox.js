/**
 * @file sandbox.js 提供组件内部使用的沙盒环境，主要用于隔离全局环境和限制部分API能力
 * @author clark-t (clarktanglei@163.com)
 */

export {default} from 'mip-sandbox'

// const WINDOW_ORIGINAL_KEYWORDS = [
//   'Array',
//   'ArrayBuffer',
//   'Blob',
//   'Boolean',
//   'DOMError',
//   'DOMException',
//   'Date',
//   'Error',
//   'File',
//   'FileList',
//   'FileReader',
//   'Float32Array',
//   'Float64Array',
//   'FormData',
//   'Headers',
//   'Image',
//   'ImageBitmap',
//   'Infinity',
//   'Int16Array',
//   'Int32Array',
//   'Int8Array',
//   'JSON',
//   'Map',
//   'Math',
//   'MutationObserver',
//   'NaN',
//   'Notification',
//   'Number',
//   'Object',
//   'Promise',
//   'Proxy',
//   'ReadableStream',
//   'ReferenceError',
//   'Reflect',
//   'RegExp',
//   'Request',
//   'Response',
//   'Set',
//   'String',
//   'Symbol',
//   'SyntaxError',
//   'TypeError',
//   'URIError',
//   'URL',
//   'URLSearchParams',
//   'Uint16Array',
//   'Uint32Array',
//   'Uint8Array',
//   'Uint8ClampedArray',
//   'WritableStream',
//   'addEventListener',
//   'cancelAnimationFrame',
//   'clearInterval',
//   'clearTimeout',
//   'console',
//   'createImageBitmap',
//   'decodeURI',
//   'decodeURIComponent',
//   'devicePixelRatio',
//   'encodeURI',
//   'encodeURIComponent',
//   'escape',
//   'fetch',
//   'getComputedStyle',
//   // 待定
//   'history',
//   'innerHeight',
//   'innerWidth',
//   'isFinite',
//   'isNaN',
//   'isSecureContext',
//   'localStorage',
//   // 待定
//   'location',
//   'length',
//   'matchMedia',
//   'navigator',
//   'outerHeight',
//   'outerWidth',
//   'parseFloat',
//   'parseInt',
//   'removeEventListener',
//   'requestAnimationFrame',
//   'screen',
//   'screenLeft',
//   'screenTop',
//   'screenX',
//   'screenY',
//   'scroll',
//   'scrollBy',
//   'scrollTo',
//   'scrollX',
//   'scrollY',
//   'scrollbars',
//   'sessionStorage',
//   'setInterval',
//   'setTimeout',
//   'undefined',
//   'unescape',
//   'webkitCancelAnimationFrame',
//   'webkitRequestAnimationFrame'
// ]

// const DOCUMENT_ORIGINAL_KEYWORDS = [
//   'head',
//   'body',
//   'title',
//   'cookie',
//   'referrer',
//   'readyState',
//   'documentElement',
//   'createElement',
//   'createDcoumentFragment',
//   'getElementById',
//   'getElementsByClassName',
//   'getElementsByTagName',
//   'querySelector',
//   'querySelectorAll'
// ]

// // 修复:
// // 1. strict 模式在部分浏览器下使用 arguments caller 等关键字报错的问题
// // 2. name 和 length 属性在部分浏览器上 redefineProperty 报错的问题
// const SKIP_WORDS = ['arguments', 'caller', 'callee', 'length', 'name']

// function defs (obj, props, {original = window, writable = false} = {}) {
//   props = props.filter(name => SKIP_WORDS.indexOf(name) === -1)

//   Object.defineProperties(
//     obj,
//     props.reduce((obj, key) => {
//       obj[key] = {
//         enumberable: true,
//         configurable: false
//       }

//       if (isFunc(original[key])) {
//         // 不然直接 MIP.sandbox.setTimeout(() => {}) 会报错
//         let func = original[key].bind(original)
//         // 在上面的 .bind() 的情况下 MIP.sandbox.Promise.resolve 会拿不到
//         // 因此需要这么定义一下
//         let ownPropertyNames = Object.getOwnPropertyNames(original[key])
//         defs(func, ownPropertyNames, {original: original[key]})

//         obj[key].get = function () {
//           return func
//         }
//       } else {
//         obj[key].get = function () {
//           return original[key]
//         }

//         obj[key].set = function (val) {
//           // 只是防止用户篡改而不是不让用户写
//           if (writable) {
//             original[key] = val
//           }
//         }
//       }

//       return obj
//     }, {})
//   )
// }

// function def (obj, prop, options) {
//   let descriptor
//   if (isFunc(options)) {
//     descriptor = {
//       enumberable: true,
//       get: options
//     }
//   } else {
//     descriptor = options
//   }

//   Object.defineProperty(obj, prop, descriptor)
// }

// /**
//  * 是否为函数
//  *
//  * @param  {Function} fn 数据
//  * @return {boolean}     是否为函数
//  */
// function isFunc (fn) {
//   return typeof fn === 'function'
// }

// let sandbox = {}

// defs(sandbox, WINDOW_ORIGINAL_KEYWORDS)

// def(sandbox, 'window', function () {
//   return sandbox
// })

// let sandboxDocument = {}

// defs(sandboxDocument, DOCUMENT_ORIGINAL_KEYWORDS, {original: document, setter: true})

// def(sandbox, 'document', function () {
//   return sandboxDocument
// })

// def(sandbox, 'MIP', function () {
//   return window.MIP
// })

// def(sandbox, 'this', function () {
//   return safeThis
// })

// function safeThis (that) {
//   return that === window ? sandbox : that === document ? sandbox.document : that
// }

// export default sandbox
