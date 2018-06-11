/**
 * @file def.js
 * @author clark-t (clarktanglei@163.com)
 */

var utils = {
  // 方便测试用
  globals: typeof window === 'object' ? window : {},
  traverse: traverse,
  def: def
}

function prop (obj, name) {
  var keys = name.split('.')
  for (var i = 0; i < keys.length; i++) {
    obj = obj[keys[i]]
  }
  return obj
}

// function merge (a, b) {
//   var keys = Object.keys(b)
//   for (var i = 0; i < keys.length; i++) {
//     a[keys[i]] = b[keys[i]]
//   }

//   return a
// }

function traverse (node, parent) {
  // if (!node.children) {
  //   def(parent, node.name, prop(utils.globals, node.host))
  //   return
  // }

  // if (!node.children.length) {
  //   return
  // }

  var obj = {}

  if (typeof node.host === 'string') {
    node._host = prop(utils.globals, node.host)
  } else {
    node._host = utils.globals
  }

  node.children.forEach(function (child) {
    if (typeof child === 'string') {
      def(obj, child, child, node)
    } else {
      traverse(child, obj)
    }
  })

  if (node.name) {
    def(parent, node.name, obj)
    return
  }

  return obj
}

function def (obj, name, props, options) {
  options = options || {}
  var descriptor

  if (options.type === 'raw') {
    descriptor = props
  } else if (typeof props === 'string' && options.type !== 'getter') {
    descriptor = {
      enumerable: true,
      configurable: false
    }

    var host = options._host || options.host || utils.globals

    if (typeof host[name] === 'function') {
      if (/^[A-Z]/.test(name)) {
        // class
        descriptor.value = host[name]
        descriptor.writable = false
      } else {
        // 不然直接 MIP.sandbox.setTimeout(() => {}) 会报错
        descriptor.get = function () {
          return host[name].bind(host)
        }
      }
    } else {
      descriptor.get = function () {
        return host[name]
      }

      descriptor.set = function (val) {
        // 只是防止用户篡改而不是不让用户写
        if (options.access !== 'readonly') {
          host[name] = val
        }
      }
    }
  } else {
    descriptor = {
      enumerable: true,
      get: function () {
        return props
      }
    }
  }

  Object.defineProperty(obj, name, descriptor)
}

module.exports = utils
