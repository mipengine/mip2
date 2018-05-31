/**
 * @file observer.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Deps from './deps'

class Observer {
  _walk (data) {
    if (!data || typeof data !== 'object') {
      return
    }

    for (let key in data) {
      this._define(data, key, data[key])
    }
  }

  _define (data, key, value) {
    // // if value has observed, stop it
    // if (value && value.__ob__) {
    //     return;
    // }

    // if value is object, define it's value
    let me = this
    if (value && typeof value === 'object') {
      this.start(value)
    }

    let property = Object.getOwnPropertyDescriptor(data, key)
    if (property && property.configurable === false) {
      return
    }
    let getter = property && property.get
    let setter = property && property.set

    let deps = new Deps()
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
        me._walk(newVal)
        deps.notify()
      }
    })

    // try {
    //     value.__ob__ = this;
    // }
    // catch (e) {}
  }

  start (data) {
    this._walk(data)
  }
}

export default Observer
