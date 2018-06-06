/**
 * @file sandbox.js
 * @author clark-t (clarktanglei@163.com)
 */

var KEYWORDS = require('./safe-keywords')

var WINDOW_ORIGINAL_KEYWORDS = KEYWORDS.WINDOW_ORIGINAL_KEYWORDS
var DOCUMENT_ORIGINAL_KEYWORDS = KEYWORDS.DOCUMENT_ORIGINAL_KEYWORDS

function defs (obj, props, {original = window, writable = false} = {}) {
  Object.defineProperties(
    obj,
    props.reduce(function (obj, key) {
      obj[key] = {
        enumberable: true,
        configurable: false
      }

      if (typeof original[key] === 'function') {
        if (/^[A-Z]/.test(key)) {
          // class
          obj[key].value = original[key]
          obj[key].writable = false
        } else {
          // 不然直接 MIP.sandbox.setTimeout(() => {}) 会报错
          obj[key].get = function () {
            return original[key].bind(original)
          }
        }
      } else {
        obj[key].get = function () {
          return original[key]
        }

        obj[key].set = function (val) {
          // 只是防止用户篡改而不是不让用户写
          if (writable) {
            original[key] = val
          }
        }
      }

      return obj
    }, {})
  )
}

function def (obj, prop, options) {
  var descriptor
  if (typeof options === 'function') {
    descriptor = {
      enumberable: true,
      get: options
    }
  } else {
    descriptor = options
  }

  Object.defineProperty(obj, prop, descriptor)
}

/**
 * this sandbox，避免诸如 (function () {console.log(this)}).call(undefined) this 指向 window
 *
 * @param {Object} that 外部的 this
 * @return {Object} safe this
 */
function safeThis (that) {
  return that === window ? sandbox : that === document ? sandbox.document : that
}

var sandbox = {}

defs(sandbox, WINDOW_ORIGINAL_KEYWORDS)

def(sandbox, 'window', function () {
  return sandbox
})

var sandboxDocument = {}

defs(sandboxDocument, DOCUMENT_ORIGINAL_KEYWORDS, {original: document, setter: true})

def(sandbox, 'document', function () {
  return sandboxDocument
})

def(sandbox, 'MIP', function () {
  return window.MIP
})

def(sandbox, 'this', function () {
  return safeThis
})

export default sandbox
