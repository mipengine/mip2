/**
 * @file observer.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Deps from './deps'

class Observer {
  _walk (data, depMap) {
    if (typeof data !== 'object' || typeof depMap !== 'object') {
      return
    }

    Object.keys(data).forEach(key => this._define(data, key, data[key], depMap))
  }

  _define (data, key, value, depMap) {
    if (typeof depMap[key] === 'undefined') {
      return
    }

    let me = this
    let deep = value && typeof value === 'object'
    // if value is object, define it's value
    if (deep) {
      this._walk(value, depMap[key])
    }

    let property = Object.getOwnPropertyDescriptor(data, key)
    /* istanbul ignore if */
    if (property && property.configurable === false) {
      return
    }
    let getter = property && property.get
    let setter = property && property.set

    // save or reset deps
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

    // observe
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
        if (depMap[key]._deps && typeof newVal !== 'object') {
          depMap[key] = depMap[key]._deps
        } else if (depMap[key].isDep && typeof newVal === 'object') {
          depMap[key]._deps = depMap[key]
        }
        deps.notify(key)
      }
    })
  }

  start (data) {
    this._depMap = this._depMap || {}
    for (let key in data) {
      this._depMap[key] = JSON.parse(JSON.stringify(data[key]))
    }
    this._walk(data, this._depMap)
  }
}

export default Observer
