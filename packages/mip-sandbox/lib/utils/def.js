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
    if (!obj) {
      return
    }
    obj = obj[keys[i]]
  }
  return obj
}

function merge (a, b, exclude) {
  var keys = Object.keys(b)
  for (var i = 0; i < keys.length; i++) {
    if (!exclude || exclude.indexOf(keys[i]) === -1) {
      a[keys[i]] = b[keys[i]]
    }
  }

  return a
}

function traverse (node, parent, mount) {
  mount = mount || {}

  var host

  if (typeof node.host === 'string') {
    host = prop(utils.globals, node.host)
    if (host == null) {
      host = mount[node.host]
    }

    if (host == null) {
      throw Error('host ' + node.host + ' not found.')
    }
  } else {
    host = utils.globals
  }

  if (!node.children && parent) {
    def(parent, node.name, host)
    return
  }

  var options = merge({}, node, ['children'])
  merge(options, {host: host})

  var obj = {}

  if (node.mount) {
    mount[node.mount] = obj
  }

  node.children.forEach(function (child) {
    if (typeof child === 'string') {
      def(obj, child, child, options)
    } else {
      traverse(child, obj, mount)
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

    var host = options.host || utils.globals

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
