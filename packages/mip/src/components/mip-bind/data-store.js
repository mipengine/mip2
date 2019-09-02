/**
 * @file data-storage.js
 * @author clark-t (clarktanglei@163.com)
 */

import DataWatcher from './data-watcher'
import GlobalData from './global-data'
import { merge, getProperty } from './util'
import { isObject } from '../../util/fn'

export default class DataStore {
  constructor () {
    const storage = {}
    this.data = storage
    this.watcher = new DataWatcher(storage)
    this.global = new GlobalData()
  }

  set (data) {
    if (!isObject(data)) {
      throw new Error('setData method MUST accept an object! Check your input:' + data)
    }
    let {global, page} = this.global.classify(data)
    let changes = merge(this.data, page)
    this.watcher.notify(changes)
    this.global.update(global)
  }

  get (expr) {
    return getProperty(this.data, expr)
  }
}

