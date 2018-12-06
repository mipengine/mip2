/**
 * @file safe-keywords.js
 * @author clark-t (clarktanglei@163.com)
 */

/* globals MIP, location */
var keys = require('./utils/keys')
var flatten = require('./utils/flatten')
var constant = require('./utils/constant')
var safeThis = require('./utils/safe-this')

var TYPE_PROPS = constant.TYPE.PROPS
var TYPE_FUNCTION = constant.TYPE.FUNCTION
var ACCESS_READONLY = constant.ACCESS.READONLY
var ACCESS_READWRITE = constant.ACCESS.READWRITE

function flat (properties) {
  return flatten(properties.map(function (prop) {
    return prop.props
  }))
}

module.exports = function () {
  var ORIGINAL = [
    {
      type: TYPE_PROPS,
      access: ACCESS_READONLY,
      props: [
        'Array',
        'ArrayBuffer',
        'Blob',
        'Boolean',
        'DOMError',
        'DOMException',
        // https://github.com/mipengine/mip2/issues/336
        'DataView',
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
        // https://github.com/mipengine/mip2/issues/347
        'TextDecoder',
        'TextEncoder',
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
        'console',
        'decodeURI',
        'decodeURIComponent',
        'localStorage',
        'navigator',
        'sessionStorage',
        'screen',
        'undefined'
      ]
    },
    {
      type: TYPE_PROPS,
      access: ACCESS_READONLY,
      props: [
        'devicePixelRatio',
        'innerHeight',
        'innerWidth',
        'isSecureContext',
        'length',
        'outerHeight',
        'outerWidth',
        'screenLeft',
        'screenTop',
        'screenX',
        'screenY',
        'scrollX',
        'scrollY',
        // mip-data ready status
        'mipDataPromises'
      ]
    },
    {
      type: TYPE_FUNCTION,
      access: ACCESS_READONLY,
      props: [
        // https://github.com/mipengine/mip2/issues/347
        'atob',
        'clearInterval',
        'clearTimeout',
        'encodeURI',
        'encodeURIComponent',
        'escape',
        'fetch',
        'getComputedStyle',
        'isFinite',
        'isNaN',
        'matchMedia',
        'parseFloat',
        'parseInt',
        'setInterval',
        'setTimeout',
        'unescape',
        // mip1 polyfill
        'fetchJsonp'
      ]
    }
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
    access: ACCESS_READONLY,
    origin: function () {
      return window
    },
    properties: ORIGINAL.concat([
      {
        type: TYPE_PROPS,
        access: ACCESS_READONLY,
        props: [
          {
            name: 'document',
            origin: function () {
              return document
            },
            properties: [
              {
                type: TYPE_PROPS,
                access: ACCESS_READWRITE,
                props: [
                  'cookie',
                  // https://github.com/mipengine/mip2/issues/95
                  'domain'
                ]
              }
            ]
          },
          {
            name: 'location',
            // host: 'location',
            origin: function () {
              return location
            },
            properties: [
              {
                type: TYPE_PROPS,
                access: ACCESS_READONLY,
                props: [
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
              }
            ]
          },
          {
            name: 'MIP',
            // host: 'MIP',
            origin: function () {
              return MIP
            },
            properties: [
              {
                type: TYPE_PROPS,
                access: ACCESS_READONLY,
                props: [
                  'viewport',
                  'util',
                  'sandbox',
                  {
                    name: 'viewer',
                    origin: function () {
                      return MIP.viewer
                    },
                    properties: [
                      {
                        type: TYPE_PROPS,
                        access: ACCESS_READONLY,
                        props: [
                          'isIframed'
                        ]
                      },
                      {
                        type: TYPE_FUNCTION,
                        access: ACCESS_READONLY,
                        props: [
                          'sendMessage',
                          'open'
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                type: TYPE_PROPS,
                access: ACCESS_READONLY,
                props: [
                  'MIP_ROOT_PAGE'
                ]
              },
              {
                type: TYPE_FUNCTION,
                access: ACCESS_READONLY,
                props: [
                  'watch',
                  'setData',
                  'getData'
                ]
              }
            ]
          },
          {
            name: 'window',
            getter: function () {
              return MIP.sandbox.strict
            }
          }
        ]
      },
      {
        type: TYPE_FUNCTION,
        access: ACCESS_READONLY,
        props: [
          {
            name: 'this',
            getter: function () {
              return safeThis(MIP.sandbox.strict)
            }
          }
        ]
      }
    ])
  }

  var SANDBOX = {
    name: 'sandbox',
    access: ACCESS_READONLY,
    origin: function () {
      return window
    },
    properties: ORIGINAL.concat([
      {
        type: TYPE_PROPS,
        access: ACCESS_READONLY,
        props: [
          // https://github.com/mipengine/mip2/issues/143
          'CustomEvent',
          'File',
          'FileList',
          'FileReader',
          'Image',
          'ImageBitmap',
          'MutationObserver',
          'Notification',
          // 待定
          'history',
          // 待定
          'location',
          'scrollbars',
          {
            name: 'document',
            origin: function () {
              return document
            },
            properties: [
              {
                type: TYPE_PROPS,
                access: ACCESS_READWRITE,
                props: [
                  // https://github.com/mipengine/mip2/issues/95
                  'domain',
                  'head',
                  'body',
                  'title',
                  'cookie',
                  'referrer',
                  'readyState',
                  'documentElement'
                ]
              },
              {
                type: TYPE_FUNCTION,
                access: ACCESS_READONLY,
                props: [
                  'createElement',
                  'createDocumentFragment',
                  'getElementById',
                  'getElementsByClassName',
                  'getElementsByTagName',
                  'querySelector',
                  'querySelectorAll'
                ]
              }
            ]
          },
          {
            name: 'window',
            getter: function () {
              return MIP.sandbox
            }
          },
          {
            name: 'MIP',
            getter: function () {
              return MIP
            }
          },
          SANDBOX_STRICT
        ]
      },
      {
        type: TYPE_FUNCTION,
        access: ACCESS_READONLY,
        props: [
          'addEventListener',
          'cancelAnimationFrame',
          'createImageBitmap',
          'removeEventListener',
          'requestAnimationFrame',
          'scrollBy',
          'scrollTo',
          'scroll',
          'webkitCancelAnimationFrame',
          'webkitRequestAnimationFrame',
          {
            name: 'this',
            getter: function () {
              return safeThis(MIP.sandbox)
            }
          }
        ]
      }
    ])
  }

  var sandboxProperties = flat(SANDBOX.properties)
  var sandboxStrictProperties = flat(SANDBOX_STRICT.properties)

  var WHITELIST = keys(sandboxProperties).concat(RESERVED)
  var WHITELIST_STRICT = keys(sandboxStrictProperties).concat(RESERVED)
  var WHITELIST_RESERVED = keys(sandboxProperties, true).concat(RESERVED)
  var WHITELIST_STRICT_RESERVED = keys(sandboxStrictProperties, true).concat(RESERVED)

  // 防止用户篡改数组，因此每次返回的都是数组浅拷贝

  var whiteListProperties = {
    type: TYPE_PROPS,
    access: ACCESS_READONLY,
    props: [
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
  }

  SANDBOX.properties = SANDBOX.properties.concat(whiteListProperties)
  SANDBOX_STRICT.properties = SANDBOX_STRICT.properties.concat(whiteListProperties)

  return {
    ORIGINAL: ORIGINAL,
    RESERVED: RESERVED,
    SANDBOX: SANDBOX,
    SANDBOX_STRICT: SANDBOX_STRICT,
    WHITELIST: WHITELIST,
    WHITELIST_STRICT: WHITELIST_STRICT,
    WHITELIST_RESERVED: WHITELIST_RESERVED,
    WHITELIST_STRICT_RESERVED: WHITELIST_STRICT_RESERVED
  }
}
