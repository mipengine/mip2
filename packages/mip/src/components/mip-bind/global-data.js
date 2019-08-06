/**
 * @file global-data.js
 * @author clark-t (clarktanglei@163.com)
 */

import {isEmptyObject} from '../../util/fn'
import {nextTick} from '../../util/next-tick'
import {merge} from './util'

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

  update (data) {
    if (isEmptyObject(data)) {
      return
    }

    let pageId = location.href.replace(location.hash, '')
    nextTick(() => {
      !this.isRoot && this.rootWin.MIP.setData(data)
      merge(this.data, data)
      this.broadcast(data, pageId)
    })
  }

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

  classify (data) {
    return Object.keys(data).reduce((result, key) => {
      if (typeof data[key] === 'function') {
        throw `setData method MUST NOT be Function: ${key}`
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
    },
      { global: {}, page: {} }
    )
  }
}

