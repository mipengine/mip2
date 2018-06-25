/**
 * @file observer.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Deps from './deps'
import {isObj} from './util'
class Observer {
  _walk (data, depMap) {
    if (typeof data !== 'object' || typeof depMap !== 'object') {
      return
    }

    for (let key in data) {
      this._define(data, key, data[key], depMap)
    }
  }

  _define (data, key, value, depMap) {
    if (!depMap[key]) {
      return
    }

    // if value is object, define it's value
    let me = this
    let deep = false
    if (value && typeof value === 'object') {
      deep = true
      this._walk(value, depMap[key])
    }

    let property = Object.getOwnPropertyDescriptor(data, key)
    if (property && property.configurable === false) {
      return
    }
    let getter = property && property.get
    let setter = property && property.set

    let deps
    if (!deep && depMap[key] && depMap[key].isDep) {
      deps = depMap[key]
    } else if (deep && depMap[key] && depMap[key]._deps) {
      deps = depMap[key]._deps
    } else {
      deps = new Deps()
      if (!deep) {
        depMap[key] = deps
      } else {
        depMap[key]._deps = deps
      }
    }

    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get () {
        value = getter ? getter.call(data) : value
        if (Deps.target) {
          deps.addWatcher()
        }
        return value
      },
      set (newVal) {
        value = getter ? getter.call(data) : value
        if (newVal === value) {
          return
        }
        if (setter) {
          setter.call(data, newVal)
        } else {
          value = newVal
        }
        me._walk(newVal, depMap[key])
        if (depMap[key]._deps && !isObj(newVal)) {
          depMap[key] = depMap[key]._deps
        } else if (depMap[key].isDep && isObj(newVal)) {
          depMap[key]._deps = depMap[key]
        }
        deps.notify(key)
      }
    })
  }

  start (data) {
    this._depMap = {}
    for (let key in data) {
      this._depMap[key] = JSON.parse(JSON.stringify(data[key]))
    }
    this._walk(data, this._depMap)
  }
}

export default Observer
