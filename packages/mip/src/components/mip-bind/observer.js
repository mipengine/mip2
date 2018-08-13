/**
 * @file observer.js
 * @author qiusiqi (qiusiqi@baidu.com)
 */

import Deps from './deps'
import {isObject} from './util'

class Observer {
  /*
   * start to defineProperty
   * @param {Object} data target to be defined
   */
  start (data) {
    // supporting dependencies map
    this.depMap = this.depMap || {}
    for (let key in data) {
      this.depMap[key] = JSON.parse(JSON.stringify(data[key]))
    }
    this.walk(data, this.depMap)
  }

  /*
   * to traverse
   * @param {Object} data target to be defined
   * @param {Object} depMap supporting dependencies map
   */
  walk (data, depMap) {
    if (!isObject(data) || !isObject(depMap)) {
      return
    }

    Object.keys(data).forEach(key => this.define(data, key, data[key], depMap))
  }

  /*
   * to define
   * @param {Object} data target to be defined
   * @param {string} key key
   * @param {*} value value
   * @param {Object} depMap supporting dependencies map
   */
  define (data, key, value, depMap) {
    if (typeof depMap[key] === 'undefined') {
      return
    }

    let me = this
    let deep = value && typeof value === 'object'
    // if value is object, define it's value
    if (deep) {
      this.walk(value, depMap[key])
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
        me.walk(newVal, depMap[key])
        if (depMap[key]._deps && typeof newVal !== 'object') {
          depMap[key] = depMap[key]._deps
        } else if (depMap[key].isDep && typeof newVal === 'object') {
          depMap[key]._deps = depMap[key]
        }
        deps.notify(key)
      }
    })
  }
}

export default Observer
