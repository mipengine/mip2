/**
 * @file global-data.js
 * @author clark-t (clarktanglei@163.com)
 */

import {isEmptyObject} from '../../util/fn'
import {nextTick} from '../../util/next-tick'
import {merge} from './util'

/**
 * MIP 页面之间的全局数据共享管理类
 *
 * @class
 */
export default class GlobalData {
  constructor () {
    let page = window.MIP.viewer.page
    this.isRoot = page.isRootPage || /* istanbul ignore next */ page.isCrossOrigin
    this.rootWin = this.isRoot ? window : window.parent
    if (this.isRoot) {
      window.g = {}
    }
    this.data = this.rootWin.g
  }

  /**
   * 更新其他 MIP 页面的全局数据，流程为：
   *     二级页更新本地数据
   *     -> 通知 root page 更新数据
   *     -> root page 通知其他二级页更新数据
   *
   * @param {Object} data 全局数据
   */
  update (data) {
    if (isEmptyObject(data)) {
      return
    }

    let pageId = window.location.href.replace(window.location.hash, '')
    nextTick(() => {
      !this.isRoot && this.rootWin.MIP.setData(data)
      merge(this.data, data)
      this.broadcast(data, pageId)
    })
  }

  /**
   * root page 通知其他二级页更新数据
   *
   * @param {Object} data 数据
   * @param {string} pageId 页面标识符
   */
  broadcast (data, pageId) {
    let frames = this.rootWin.document.getElementsByTagName('iframe')
    for (let i = 0; i < frames.length; i++) {
      let frame = frames[i]
      let framePageId = frame.getAttribute('data-page-id')
      if (frame.classList.contains('mip-page__iframe') &&
        framePageId &&
        pageId !== framePageId
      ) {
        let subwin = frame.contentWindow
        subwin && subwin.MIP && subwin.MIP.setData(data)
      }
    }
  }

  /**
   * 将 global data 的数据分类出来，它们的特征是带 #号，如：
   * {a: 1, '#b': 2} 中的 '#b' 就是 global data
   * 同时 global data 也是 page data 的一部分，因此分类的结果是：
   * page -> {a: 1, b: 2} global -> {b: 2}
   *
   * @param {Object} data 数据
   */
  classify (data) {
    return Object.keys(data).reduce((result, key) => {
      if (typeof data[key] === 'function') {
        // 兼容旧版 MIP 的报错信息
        /* eslint-disable no-throw-literal */
        throw `setData method MUST NOT be Function: ${key}`
        /* eslint-enable no-throw-literal */
      }
      let realKey
      if (key[0] === '#') {
        realKey = key.substr(1)
        result.global[realKey] = data[key]
      } else {
        realKey = key
      }
      result.page[realKey] = data[key]
      return result
    }, {global: {}, page: {}})
  }
}
