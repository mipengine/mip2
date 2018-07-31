/**
 * @file watcher.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Deps from './deps'
import * as util from './util'

class Watcher {
  constructor (node, data, dir, exp, cb) {
    this._data = data
    this._dir = dir
    this._exp = exp
    let specPrefix
    if ((specPrefix = exp.slice(0, 6)) === 'Class:' ||
      specPrefix === 'Style:' ||
      specPrefix === 'Watch:'
    ) {
      this._specWatcher = specPrefix.slice(0, 5)
      this._exp = exp = exp.slice(6)
    }
    this._node = node
    this._depIds = {}
    let fn = util.getWithResult.bind(this, this._exp)
    this._getter = fn.call(this._data)
    this._cb = cb
    this._value = this._get()
  }

  update () {
    let oldVal = this._value
    let newVal = this._get(oldVal)
    if (newVal !== oldVal) {
      this._value = newVal
      if (this._dir) {
        this._cb.call(this._data, this._dir, newVal)
      } else {
        this._cb.call(this._data, newVal)
      }
    }
  }

  _get (oldVal) {
    let value
    Deps.target = this
    value = this._getter.call(this._data, this._data)
    if (this._specWatcher && this._specWatcher !== 'Watch') {
      value = util['parse' + this._specWatcher](value, oldVal)
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
}

export default Watcher
