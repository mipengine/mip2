/**
 * @file mip-bind init
 * @author clark-t (clarktanglei@163.com)
 * @description m-bind 机制初始化
 */

import {isElementNode} from '../../util/dom/dom'
import {traverse, throttle} from '../../util/fn'
import {
  createSetDataObject,
  def
} from './util'
import {
  instance as store,
  getData,
  setData,
  watch
} from './data-store'
import {
  applyBinding,
  isBindingAttr
} from './binding'
import {
  instance as domWather
} from './dom-watcher'

import log from '../../util/log'

const logger = log('MIP-bind')

export default function () {
  domWatcher.watch(({ add, removed }) => {
    addInputListener(add, store)
  })

  store.watcher.watch(() => {
    for (let info of )
  })

  const $set = data => {
    domWatcher.update(document.documentElement)
    setData(data)
  }

  // let bindingDOMs = []

  // const $set = data => {
  //   let bindings = queryBindings(document.documentElement)
  //   let {add} = diffBindingDOMs(bindingDOMs, bindings)

  //   if (bindingDOMs.length > 0 && add.length > 0) {
  //     logger.warn(`请勿在动态创建的节点上使用 m-bind`)
  //   }
  //   addInputListener(add, store)
  //   for (let item of add) {
  //     bindingDOMs.push(item)
  //   }
  //   setData(data)
  // }

  // store.watcher.watch(() => {
  //   for (let info of bindingDOMs) {
  //     try {
  //       applyBinding(info, store.data)
  //     } catch (e) /* istanbul ignore next */ {
  //       logger.error(e)
  //     }
  //   }
  // })

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

