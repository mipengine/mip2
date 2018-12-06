/**
 * @file def.js
 * @author clark-t (clarktanglei@163.com)
 */

var constant = require('./constant')

var TYPE_PROPS = constant.TYPE.PROPS
var TYPE_FUNCTION = constant.TYPE.FUNCTION
var ACCESS_READONLY = constant.ACCESS.READONLY

function noop () {}

function getGlobals () {
  return window
}

function propFactory (name, origin) {
  return function () {
    return origin()[name]
  }
}

function funcFactory (name, origin) {
  return function () {
    var parent = origin()
    var fn = parent[name]
    return fn && fn.bind(parent)
  }
}

function propGetter (name, type, origin) {
  return type === TYPE_FUNCTION
    ? funcFactory(name, origin)
    : propFactory(name, origin)
}

function mockGetter (name, desc, origin) {
  var mock = {}
  var isDefined = false

  var properties = desc.properties
  var childOrigin = desc.origin || propFactory(name, origin)

  return function () {
    if (isDefined) {
      return mock
    }

    for (var i = 0; i < properties.length; i++) {
      var group = properties[i]

      var childType = group.type
      var childAccess = group.access
      var props = group.props

      for (var j = 0; j < props.length; j++) {
        var prop = props[j]
        def(mock, prop.name || prop, prop, childType, childAccess, childOrigin)
      }
    }

    isDefined = true
    return mock
  }
}

function proxyFactory (name, desc, type, access, origin) {
  return {
    get: typeof desc.getter === 'function'
      ? desc.getter
      : desc.properties
        ? mockGetter(name, desc, origin)
        : propGetter(name, type, origin),
    set: typeof desc.setter === 'function'
      ? desc.setter
      : access === ACCESS_READONLY
        ? noop
        : function (val) {
          var parent = origin()
          parent[name] = val
        }
  }
}

function getDescriptor (name, desc, type, access, origin) {
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

  var proxy = proxyFactory(
    name,
    desc,
    desc.type || type || TYPE_PROPS,
    desc.access || access || ACCESS_READONLY,
    origin || getGlobals
  )

  descriptor.get = proxy.get
  descriptor.set = proxy.set

  return descriptor
}

function def (obj, name, desc, type, access, origin) {
  var descriptor = getDescriptor(name, desc, type, access, origin)

  if (obj) {
    Object.defineProperty(obj, name, descriptor)
  }

  return descriptor
}

module.exports = def
