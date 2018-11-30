/**
 * @file def.js
 * @author clark-t (clarktanglei@163.com)
 */

var constant = require('./constant')

function noop () {}

function getGlobals () {
  return window
}

function propFactory (name, origin) {
  return function () {
    return origin()[name]
  }
}

function bindedPropFactory (name, origin) {
  return function () {
    var parent = origin()
    var fn = parent[name]
    return fn && fn.bind(parent)
  }
}

function propProxy (name, type, access, origin) {
  return {
    get: type === constant.TYPE.FUNCTION
      ? bindedPropFactory(name, origin)
      : propFactory(name, origin),
    set: access === constant.ACCESS.READONLY
      ? noop
      : function (val) {
        var parent = origin()
        parent[name] = val
      }
  }
}

function mockProxy (access) {
  var mock = {}
  return {
    get: function () {
      return mock
    },
    set: access === constant.ACCESS.READONLY
      ? noop
      : function (value) {
        mock = value
      }
  }
}

function setterGetterProxy (getter, setter) {
  return {
    get: getter,
    set: setter || noop
  }
}

function proxyFactory (name, desc, type, access, origin) {
  if (typeof desc.getter === 'function') {
    return setterGetterProxy(desc.getter, desc.setter)
  }

  if (desc.properties) {
    return mockProxy(access)
  }

  return propProxy(name, type, access, origin)
}

function getDescriptor (name, desc, type, mode, access, origin) {
  if (desc.descriptor) {
    return desc.descriptor
  }

  var descriptor = {
    enumerable: true,
    configurable: false
  }

  if (typeof desc === 'function') {
    descriptor.get = desc
    descriptor.set = noop
    return descriptor
  }

  type = desc.type || type || constant.TYPE.PROPS
  mode = desc.mode || mode || constant.MODE.NORMAL
  access = desc.access || access || constant.ACCESS.READONLY
  origin = origin || getGlobals

  var proxy = proxyFactory(name, desc, type, access, origin)

  var getter

  if (desc.properties) {
    var properties = desc.properties
    var childOrigin = desc.origin || propFactory(name, origin)

    getter = function () {
      var mock = proxy.get()

      for (var i = 0; i < properties.length; i++) {
        var group = properties[i]

        var childType = group.type
        var childMode = group.mode
        var childAccess = group.access
        var props = group.props

        for (var j = 0; j < props.length; j++) {
          var prop = props[j]
          def(mock, prop.name || prop, prop, childType, childMode, childAccess, childOrigin)
        }
      }

      return mock
    }
  } else {
    getter = proxy.get
  }

  // 普通的节点可以进行缓存
  if (mode === constant.MODE.NORMAL) {
    var cache
    var runtimeGetter = getter
    getter = function () {
      if (cache) {
        return cache
      }
      cache = runtimeGetter()
      return cache
    }
  }

  descriptor.get = getter
  descriptor.set = proxy.set

  return descriptor
}

function def (obj, name, desc, type, mode, access, origin) {
  var descriptor = getDescriptor(name, desc, type, mode, access, origin)

  if (obj) {
    Object.defineProperty(obj, name, descriptor)
  }

  return descriptor
}

module.exports = def
