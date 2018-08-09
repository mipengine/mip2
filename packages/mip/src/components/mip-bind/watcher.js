/**
 * @file watcher.js
 * @author qiusiqi (qiusiqi@baidu.com)
 */

import Deps from './deps'
import * as util from './util'

import {MAX_UPDATE_COUNT} from '../../vue/core/observer/scheduler'

const queue = []
let has = {}
let circular = {}
let flushing = false
let index = 0
let lock = false

// Record watcher id, avoid add repeatly
let uid = 0

class Watcher {
  /*
   * @constructor
   * params {NODE} node DOM NODE
   * params {Object} data pageData
   * params {string} dir directive
   * params {string} exp expression
   * params {Function} cb watcher callback
   */
  constructor (node, data, dir, exp, cb) {
    this.data = data
    this.dir = dir
    this.exp = exp
    this.id = uid++
    let specPrefix
    if ((specPrefix = exp.slice(0, 6)) === 'Class:' ||
      specPrefix === 'Style:' ||
      specPrefix === 'Watch:'
    ) {
      this.specWatcher = specPrefix.slice(0, 5)
      this.exp = exp = exp.slice(6)
    }
    this.node = node
    this.depIds = {}
    let fn = util.getWithResult.bind(this, this.exp)
    this.getter = fn.call(this.data)
    this.cb = cb
    this.value = this.get()
  }

  /*
   * scheduler to update
   */
  update () {
    if (lock) {
      const id = this.id
      if (has[id] != null) {
        return
      }
      has[id] = true

      if (flushing) {
        queue.push(this)
      } else {
        let i = queue.length - 1
        /* istanbul ignore next */
        while (i > index && queue[i].id > id) {
          i--
        }
        queue.splice(i + 1, 0, this)
      }
    } else {
      this.run()
    }
  }

  /*
   * controller to update dom or call callbacks of watchers
   */
  run () {
    let oldVal = this.value
    let newVal = this.get(oldVal)
    if (newVal !== oldVal) {
      this.value = newVal
      if (this.dir) {
        this.cb.call(this.data, this.dir, newVal)
      } else {
        this.cb.call(this.data, newVal)
      }
    }
  }

  /*
   * get new val for comparing
   * @param {*} oldVal oldValue used to build new value
   */
  get (oldVal) {
    let value
    Deps.target = this
    // get new value
    value = this.getter.call(this.data, this.data).value
    // parse class/style with spectial parser
    if (this.specWatcher && this.specWatcher !== 'Watch') {
      value = util['parse' + this.specWatcher](value, oldVal)
    }
    Deps.target = null
    return value
  }

  /*
   * save dependencies
   */
  addWatcher (dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.subs.push(this)
      this.depIds[dep.id] = dep
    }
  }
}

export default Watcher

/**
 * Reset the scheduler's state.
 */
function resetState () {
  index = queue.length = 0
  has = {}
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  flushing = false
}

/**
 * Flush queues and run the watchers.
 */
function flushWatcherQueue () {
  flushing = true
  let watcher
  let id

  queue.sort((a, b) => a.id - b.id)

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production') {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        console.error(
          `[MIP warn]:You may have an infinite update loop in watcher with expression "${watcher.exp}"`
        )
        break
      }
    }
  }

  resetState()
}

export function locker (status) {
  // avoid flushing again, watcher had queued
  if (queue.length && !status && flushing) {
    return
  }
  // set lock status
  lock = status
  // when unlock, do flushing
  if (!status) {
    flushWatcherQueue()
  }
}
