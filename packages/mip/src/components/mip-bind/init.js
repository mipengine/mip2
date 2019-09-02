/**
 * @file mip-bind init
 * @author clark-t (clarktanglei@163.com)
 * @description m-bind 机制初始化
 */

import { def } from './util'
import DataStore from './data-store'
import { applyBinding } from './binding'
import { instance as domWatcher } from './binding-dom-watcher'

import {
  addInputListener
} from './binding-value'

import log from '../../util/log'

const logger = log('MIP-bind')

export const DOM_CHANGE_EVENT = 'dom-change'

export default function () {
  const store = new DataStore()
  const getData = store.get.bind(store)
  const setData = store.set.bind(store)
  const watch = store.watcher.watch.bind(store.watcher)

  const applyBindings = domInfos => {
    for (let info of domInfos) {
      try {
        applyBinding(info, store.data)
      } catch (e) /* istanbul ignore next */ {
        logger.error(e)
      }
    }
  }

  domWatcher.watch((changed) => {
    addInputListener(changed.add, store)
    applyBindings(changed.add)
  })

  document.addEventListener(DOM_CHANGE_EVENT, e => {
    let changeInfo = e.detail && e.detail[0]
    changeInfo &&
      Array.isArray(changeInfo.add) &&
      domWatcher.update(changeInfo)
  })

  store.watcher.watch(() => {
    applyBindings(domWatcher.doms)
  })

  const $set = data => {
    domWatcher.update({
      add: [document.documentElement]
    })
    setData(data)
  }

  def(MIP, 'setData', setData)
  def(MIP, '$set', $set)
  def(MIP, 'getData', getData)
  def(MIP, 'watch', watch)

  /**
   * 用于判断页面上 mip-data 是否完全加载
   *
   * @type {Array.<Promise>}
   * @deprecated
   */
  window.mipDataPromises = []

  /**
   * 全局 mip-data 存储对象，之前用于 on/bind 表达式获取数据，现已通过直接使用
   * store.data 变量的方式获取数据，为确保第三方组件使用 window.m 而暂时挂回 window
   *
   * @type {Object}
   * @deprecated
   */
  window.m = store.data

  /**
   * MIP 全局数据通知机制
   *
   * @type {Function}
   * @deprecated
   */
  MIP.$update = store.global.broadcast.bind(store.global)

  // 设置初始化数据
  MIP.$set(store.global.data)
}

