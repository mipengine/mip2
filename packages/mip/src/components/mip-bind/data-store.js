/**
 * @file data-storage.js
 * @author clark-t (clarktanglei@163.com)
 */

import DataWatcher from './data-watcher'
import GlobalData from './global-data'
import { merge, getProperty } from './util'

export default class DataStore {
  constructor () {
    const storage = {}
    this.data = storage
    this.watcher = new DataWatcher(storage)
    this.global = new GlobalData()
  }

  set (data) {
    let {global, page} = this.global.classify(data)
    let changes = merge(this.data, page)
    this.watcher.notify(changes)
    this.global.update(global)
  }

  get (expr) {
    return getProperty(this.data, expr)
  }
}

