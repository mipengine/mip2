/**
 * @file def.js
 * @author clark-t (clarktanglei@163.com)
 */

var globals = typeof window === 'object' ? window : {}

var utils = {
  // 方便测试用
  getGlobals: function (val) {
    globals = val
  },
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

function getProp (name) {
  return prop(globals, name)
}

function getRuntimeProp (name) {
  return function runtimeProp () {
    return prop(globals, name)
  }
}

function formatOptions (options, mount) {
  ['host', 'getter'].forEach(function (propName) {
    var propVal = options[propName]
    if (typeof propVal !== 'string') {
      return
    }

    if (mount) {
      options[propName] = mount[propVal]
      if (options[propName] != null) {
        return
      }
    }

    options[propName] = getProp(propVal)
    if (options[propName] != null) {
      return
    }

    options[propName] = getRuntimeProp(propVal)
  })

  if (!options.host) {
    options.host = globals
  }
}

function traverse (node, parent, mount) {
  mount = mount || {}
  var options = merge({}, node, ['properties'])
  formatOptions(options, mount)

  if (!node.properties) {
    parent &&
    def(
      parent,
      node.name,
      typeof options.getter === 'function' ? options.getter : function () {
        return options.getter
      }
    )
    return
  }

  var obj = {}

  if (node.mount) {
    mount[node.mount] = obj
  }

  node.properties.forEach(function (child) {
    if (typeof child === 'string') {
      def(obj, child, child, options)
    } else {
      traverse(child, obj, mount)
    }
  })

  if (parent) {
    def(parent, node.name, function () {
      return obj
    })
    return
  }

  return obj
}

function noop () {}

function formatDescriptor (props, options) {
  var descriptor = {
    enumerable: true,
    configurable: false
  }

  if (typeof props === 'function') {
    descriptor.get = props
    descriptor.set = noop
    return descriptor
  }

  if (options.type === 'raw') {
    return props
  }

  if (typeof options.host === 'function' && options.host.name === 'runtimeProp') {
    descriptor.get = function () {
      var runtimeHost = options.host()
      return runtimeHost[props]
    }

    descriptor.set = function (val) {
      if (options.access !== 'readonly') {
        var runtimeHost = options.host()
        runtimeHost[props] = val
      }
    }

    return descriptor
  }

  if (typeof options.host[props] === 'function') {
    if (/^[A-Z]/.test(props)) {
      descriptor.value = options.host[props]
      descriptor.writable = false
    } else {
      // 不然直接 MIP.sandbox.setTimeout(() => {}) 会报错
      descriptor.get = function () {
        return options.host[props].bind(options.host)
      }
    }
  } else {
    descriptor.get = function () {
      return options.host[props]
    }

    descriptor.set = function (val) {
      // 只是防止用户篡改而不是不让用户写
      if (options.access !== 'readonly') {
        options.host[props] = val
      }
    }
  }

  return descriptor
}

/**
 * define property
 *
 * @param {Object} obj 待定义属性的对象
 * @param {string} name 属性名
 * @param {Function|string} props 属性
 * @param {Object} options 参数
 * @param {string=} options.type 'raw'
 * @param {Object|string=} options.host 原属性的宿主 默认为 window
 * @param {string=} options.access 属性的读写权限 默认不做限制 可传值 readonly 只读权限
 */
function def (obj, name, props, options) {
  options = options || {}

  formatOptions(options)

  var descriptor = formatDescriptor(props, options)

  Object.defineProperty(obj, name, descriptor)
}

module.exports = utils
