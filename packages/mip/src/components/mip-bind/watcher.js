/**
 * @file watcher.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Deps from './deps'

class Watcher {
  constructor (node, data, dir, exp, cb) {
    this._data = data
    this._dir = dir
    this._exp = exp
    this._node = node
    this._depIds = {}
    if (typeof exp === 'function') {
      this._getter = exp
    } else {
      let fn = this.getWithResult.bind(this, exp)
      this._getter = fn.call(this._data)
    }
    this._cb = cb
    this._value = this._get()
  }

  getWithResult (exp) {
    /* eslint-disable */
    return new Function((`with(this){try {return ${exp}} catch(e) {}}`))
    /* eslint-enable */
  }

  update () {
    let newVal = this._get()
    let oldVal = this._value
    if (newVal !== oldVal) {
      this._value = newVal
      if (this._dir) {
        this._cb.call(this._data, this._dir, newVal, oldVal)
      } else {
        this._cb.call(this._data, newVal, oldVal)
      }
    }
  }

  _get () {
    let value
    Deps.target = this
    if (this._getter) {
      value = this._getter.call(this._data, this._data)
    }
    Deps.target = null
    return value
  }

  addWatcher (dep) {
    if (!this._depIds.hasOwnProperty(dep.id)) {
      dep.subs.push(this)
      this._depIds[dep.id] = dep
    }
  }

  teardown () {
    for (let key of Object.keys(this._depIds)) {
      this._depIds[key].subs = []
    }
  }
}

export default Watcher
