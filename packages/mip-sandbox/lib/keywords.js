/**
 * @file safe-keywords.js
 * @author clark-t (clarktanglei@163.com)
 */
var keys = require('./utils/keys')

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

var RESERVED = [
  'arguments',
  // 'MIP',
  'require',
  'module',
  'exports',
  'define'
]

var SANDBOX_STRICT = {
  name: 'strict',
  access: 'readyonly',
  host: 'window',
  mount: 'MIP.sandbox.strict',
  children: ORIGINAL.concat([
    {
      name: 'document',
      host: 'document',
      children: [
        'cookie'
      ]
    },
    {
      name: 'location',
      host: 'location',
      access: 'readonly',
      children: [
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
    {
      name: 'MIP',
      host: 'MIP',
      children: [
        'watch',
        'setData',
        'viewPort',
        'util',
        'sandbox'
      ]
    },
    {
      name: 'window',
      host: 'MIP.sandbox.strict'
    }
  ])
}

var SANDBOX = {
  access: 'readonly',
  host: 'window',
  mount: 'MIP.sandbox',
  children: ORIGINAL.concat([
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
    'webkitRequestAnimationFrame',
    {
      name: 'document',
      host: 'document',
      children: [
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
      host: 'MIP.sandbox'
    },
    {
      name: 'MIP',
      host: 'MIP'
    },
    SANDBOX_STRICT
  ])
}

module.exports = {
  ORIGINAL: ORIGINAL,
  RESERVED: RESERVED,
  SANDBOX: SANDBOX,
  SANDBOX_STRICT: SANDBOX_STRICT,
  WHITELIST: keys(SANDBOX.children).concat(RESERVED),
  WHITELIST_STRICT: keys(SANDBOX_STRICT.children).concat(RESERVED),
  WHITELIST_RESERVED: ORIGINAL.concat(RESERVED)
}
