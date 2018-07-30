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
  // 1.0.17 新增 WebSocket
  'WebSocket',
  'WritableStream',
  // issue https://github.com/mipengine/mip2/issues/62
  'crypto',
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
  'fetchJsonp',
  // mip-data ready status
  'mipDataPromises'
]

var RESERVED = [
  'arguments',
  'require',
  'module',
  'exports',
  'define',
  'import',
  // process.env.NODE_ENV
  'process'
]

var SANDBOX_STRICT = {
  name: 'strict',
  access: 'readonly',
  host: 'window',
  mount: 'MIP.sandbox.strict',
  properties: ORIGINAL.concat([
    {
      name: 'document',
      host: 'document',
      properties: [
        'cookie',
        // https://github.com/mipengine/mip2/issues/95
        'domain'
      ]
    },
    {
      name: 'location',
      host: 'location',
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
    {
      name: 'MIP',
      host: 'MIP',
      access: 'readonly',
      properties: [
        'watch',
        'setData',
        'getData',
        'viewport',
        'util',
        'sandbox',
        {
          name: 'viewer',
          access: 'readonly',
          properties: [
            'isIframed',
            'sendMessage',
            'open'
          ]
        },
        // 'viewer',
        'MIP_ROOT_PAGE'
      ]
    },
    {
      name: 'window',
      getter: 'MIP.sandbox.strict'
    }
  ])
}

var SANDBOX = {
  name: 'sandbox',
  access: 'readonly',
  host: 'window',
  mount: 'MIP.sandbox',
  properties: ORIGINAL.concat([
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
      properties: [
        // https://github.com/mipengine/mip2/issues/95
        'domain',
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
      getter: 'MIP.sandbox'
    },
    {
      name: 'MIP',
      getter: 'MIP'
    },
    SANDBOX_STRICT
  ])
}

var WHITELIST = keys(SANDBOX.properties).concat(RESERVED)
var WHITELIST_STRICT = keys(SANDBOX_STRICT.properties).concat(RESERVED)
var WHITELIST_RESERVED = keys(SANDBOX.properties, true).concat(RESERVED)
var WHITELIST_STRICT_RESERVED = keys(SANDBOX_STRICT.properties, true).concat(RESERVED)

// 防止用户篡改数组，因此每次返回的都是数组浅拷贝

var whiteListProperties = [
  {
    name: 'WHITELIST',
    getter: function () {
      return WHITELIST.slice()
    }
  },
  {
    name: 'WHITELIST_STRICT',
    getter: function () {
      return WHITELIST_STRICT.slice()
    }
  },
  {
    name: 'WHITELIST_RESERVED',
    getter: function () {
      return WHITELIST_RESERVED.slice()
    }
  },
  {
    name: 'WHITELIST_STRICT_RESERVED',
    getter: function () {
      return WHITELIST_STRICT_RESERVED.slice()
    }
  }
]

SANDBOX.properties = SANDBOX.properties.concat(whiteListProperties)
SANDBOX_STRICT.properties = SANDBOX_STRICT.properties.concat(whiteListProperties)

module.exports = {
  ORIGINAL: ORIGINAL,
  RESERVED: RESERVED,
  SANDBOX: SANDBOX,
  SANDBOX_STRICT: SANDBOX_STRICT,
  WHITELIST: WHITELIST,
  WHITELIST_STRICT: WHITELIST_STRICT,
  WHITELIST_RESERVED: WHITELIST_RESERVED,
  WHITELIST_STRICT_RESERVED: WHITELIST_STRICT_RESERVED
}
