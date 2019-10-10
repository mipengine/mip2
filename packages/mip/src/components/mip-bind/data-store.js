/**
 * @file data-storage.js
 * @author clark-t (clarktanglei@163.com)
 */

import DataWatcher from './data-watcher'
import GlobalData from './global-data'
import {merge, getProperty} from './util'
import {isObject} from '../../util/fn'

/**
 * 数据存储类
 *
 * @class
 */
export default class DataStore {
  constructor () {
    /**
     * 数据存储对象
     *
     * @type {Object}
     */
    const storage = {}
    this.data = storage

    /**
     * 数据修改监视器
     *
     * @type {DataWatcher}
     */
    this.watcher = new DataWatcher(storage)

    /**
     * 全局数据管理对象
     *
     * @type {GlobalData}
     */
    this.global = new GlobalData()
  }

  /**
   * 写入数据
   *
   * @param {Object} data 数据
   */
  set (data) {
    if (!isObject(data)) {
      throw new Error('setData method MUST accept an object! Check your input:' + data)
    }
    // 分类出全局数据和本页数据
    let {global, page} = this.global.classify(data)
    // 将本页数据合入数据存储对象中
    let changes = merge(this.data, page)
    // 通知数据修改监视器哪些数据发生变化
    this.watcher.notify(changes)
    // 通知更新全局数据
    this.global.update(global)
  }

  /**
   * 读取数据
   *
   * @param {string} 数据读取表达式，仅支持 . 运算符
   * @return {*} 数据
   */
  get (expr) {
    return getProperty(this.data, expr)
  }
}
