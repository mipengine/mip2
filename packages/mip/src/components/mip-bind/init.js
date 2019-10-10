/**
 * @file mip-bind init
 * @author clark-t (clarktanglei@163.com)
 * @description m-bind 机制初始化
 */

/* global MIP */

import {def} from './util'
import DataStore from './data-store'
import {applyBinding} from './binding'
import {instance as domWatcher} from './binding-dom-watcher'

import {addInputListener} from './binding-value'

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

  // 监听页面的节点增减情况，并通知 domWatcher 对增减节点做绑定和移除处理
  document.addEventListener(DOM_CHANGE_EVENT, e => {
    let changeInfo = e.detail && e.detail[0]
    changeInfo &&
      Array.isArray(changeInfo.add) &&
      domWatcher.update(changeInfo)
  })

  domWatcher.watch((changed) => {
    addInputListener(changed.add, store)
    applyBindings(changed.add)
  })

  // 数据更改触发所有 binding 节点的绑定属性计算，并且只有当计算结果存在变化时才会触发属性修改
  store.watcher.watch(() => {
    applyBindings(domWatcher.doms)
  })

  /**
   * 写入数据的同时重新遍历查找 binding 节点
   *
   * @deprecated
   * @param {Object} data 数据
   */
  const $set = data => {
    domWatcher.update({
      add: [document.documentElement]
    })
    setData(data)
  }

  // 将方法绑到 MIP 对象上，不能直接用 . 运算符定义的原因是
  // MIP1 polyfill 会重复引入 mip.js 导致 MIP.setData / getData 的数据写歪到一边去
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
