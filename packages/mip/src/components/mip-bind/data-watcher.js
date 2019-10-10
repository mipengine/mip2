/**
 * @file data-watcher.js
 * @author clark-t (clarktanglei@163.com)
 */

import {getProperty} from './util'
import {nextTick} from '../../util/next-tick'
import log from '../../util/log'

const logger = log('MIP-bind Watcher')

/**
 * 变化描述对象
 *
 * @typedef {Object} ChangeDesc
 * @property {string} expr 属性访问表达式字符串
 * @property {*} newVal 新值
 * @property {*} oldVal 旧值
 */


/**
 * 数据改动监视器
 *
 * @class
 */
export default class DataWatcher {

  /**
   * 构造函数
   *
   * @constructor
   * @param {Object} data 数据仓库
   */
  constructor (data) {
    this.data = data
    this.watches = {}
    this.globalWatches = []
    this.changes = []
    this.pending = false
    this.flush = this._flush.bind(this)
  }

  /**
   * 通知监视器哪些数据发生变化，并在下一个 micro task 执行监听数据变化的函数
   *
   * @param {Array.<ChangeDesc>} changes 变化的数据列表
   */
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

  /**
   * 将变化的数据合入数据仓库当中
   *
   * @param {Array.<ChangeDesc>} changes 变化的数据列表
   */
  merge (changes) {
    // 合并修改
    for (let change of changes) {
      let i
      let max = this.changes.length
      for (i = 0; i < max; i++) {
        let stored = this.changes[i]
        if (change.expr === stored.expr) {
          stored.newVal =  change.newVal
          break
        }
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

  /**
   * 注册数据变化的监听函数
   *
   * @param {Array} args 参数列表 可以为 [callback] 或 [expr, callback]，其中
   *        {string} expr 数据属性访问字符串表达式
   *        {Function} callback 监听函数
   *
   */
  watch (...args) {
    // 没有制定属性访问表达式时，任何数据更改都会触发该回调
    if (typeof args[0] === 'function') {
      this.globalWatches.push(args[0])
      return
    }

    let [expr, callback] = args
    let exprs = Array.isArray(expr) ? expr : [expr]
    for (let exp of exprs) {
      this.watches[exp] = this.watches[exp] || []
      this.watches[exp].push(callback)
    }
  }

  /**
   * 下一个 micro task 执行所有改动的监听函数
   */
  _flush () {
    this.pending = false
    // 清空 this.changes 数组，新增改动推入下个 microtask
    let changes = this.changes.slice()
    this.changes.length = 0

    // 配合下面的倒序遍历做反转，确保监听函数触发的顺序为注册时的顺序
    let watchExprs = Object.keys(this.watches).reverse()

    for (let i = 0; i < changes.length; i++) {
      let change = changes[i]
      let {
        expr: changeExpr,
        oldVal: oldValue,
        newVal: newValue
      } = change

      // 遍历过程会不断删除一部分满足条件的列表项因此采用倒序遍历
      for (let j = watchExprs.length - 1; j > -1; j--) {
        let watchExpr = watchExprs[j]
        // 当某项数据更改时，应同时通知其监听函数和它的属性监听函数
        // 因此此处使用 indexOf 做表达式前缀匹配
        if (watchExpr.indexOf(changeExpr) !== 0) {
          continue
        }
        // 当某项数据的监听已经被触发执行过，那就没必要在一次 flush 里面重复触发
        watchExprs.splice(j, 1)
        let callbacks = this.watches[watchExpr]

        let oldVal
        let newVal
        if (watchExpr === changeExpr) {
          // 当前数据的值
          oldVal = oldValue
          newVal = newValue
        } else {
          // 子属性的值
          let restExpr = watchExpr.slice(changeExpr.length + 1)
          oldVal = getProperty(oldValue, restExpr)
          newVal = getProperty(newValue, restExpr)
        }
        // 执行监听回调
        for (let callback of callbacks) {
          try {
            callback(newVal, oldVal)
          } catch (e) {
            logger.error(e)
          }
        }
      }
    }
    // 全局回调的优先级最低，最后再执行
    for (let callback of this.globalWatches) {
      try {
        callback()
      } catch (e) {
        logger.error(e)
      }
    }
  }
}

