/**
 * @file data-watcher.js
 * @author clark-t (clarktanglei@163.com)
 */

import { getProperty } from './util'
import { nextTick } from '../../util/next-tick'
import log from '../../util/log'

const logger = log('MIP-bind Watcher')

export default class DataWatcher {
  constructor (data) {
    this.data = data
    this.watches = {}
    this.globalWatches = []
    this.changes = []
    this.pending = false
    this.flush = this._flush.bind(this)
  }

  notify (changes) {
    if (!changes.length) {
      return
    }

    this.merge(changes)

    if (!this.pending) {
      this.pending = true
      nextTick(this.flush)
    }
  }

  merge (changes) {
    // 合并修改
    for (let change of changes) {
      let i
      let max = this.changes.length
      for (i = 0; i < max; i++) {
        let stored = this.changes[i]
        if (change.expr.indexOf(stored.expr) === 0) {
          break
        }
        if (stored.expr.indexOf(change.expr) === 0) {
          this.changes.splice(i, 1)
          this.changes.push(change)
          break
        }
      }
      if (i === max) {
        this.changes.push(change)
      }
    }
  }

  watch (...args) {
    if (typeof args[0] === 'function') {
      this.globalWatches.push(args[0])
      return
    }

    let [expr, callback] = args

    this.watches[expr] = this.watches[expr] || []
    this.watches[expr].push(callback)
  }

  _flush () {
    this.pending = false
    // 清空 this.changes 数组，新增改动推入下个 microtask
    let changes = this.changes.slice()
    this.changes.length = 0

    let watchExprs = Object.keys(this.watches)
    for (let i = 0; i < changes.length; i++) {
      let change = changes[i]
      let { expr: changeExpr, value: oldValue } = change
      for (let j = 0; j < watchExprs.length; j++) {
        let watchExpr = watchExprs[j]
        if (watchExpr.indexOf(changeExpr) !== 0) {
          continue
        }
        watchExprs.splice(j, 1)
        let callbacks = this.watches[watchExpr]
        let newVal = getProperty(this.data, watchExpr)
        let oldVal
        if (watchExpr === changeExpr) {
          oldVal = oldValue
        } else {
          let restExpr = watchExpr.slice(changeExpr.length + 1)
          oldVal = getProperty(oldValue, restExpr)
        }
        for (let callback of callbacks) {
          try {
            callback(newVal, oldVal)
          } catch (e) {
            logger.error(e)
          }
        }
      }
    }
    for (let callback of this.globalWatches) {
      try {
        callback()
      } catch (e) {
        logger.error(e)
      }
    }
  }
}

