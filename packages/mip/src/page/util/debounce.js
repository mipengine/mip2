/**
 * @file 控制回调次数
 * @deprecated 这个功能本来使用在 bouncy header，不过因为使用很少，为了代码体积考虑删除了
 * @author panyuqi@baidu.com (panyuqi)
 */

import {raf} from './feature-detect'

export default class Debouncer {
  constructor (callback) {
    this.callback = callback
    this.ticking = false
  }

  /**
   * dispatches the event to the supplied callback
   * @private
   */
  update () {
    this.callback && this.callback()
    this.ticking = false
  }

  /**
   * ensures events don't get stacked
   * @private
   */
  requestTick () {
    if (!this.ticking) {
      raf(this.rafCallback || (this.rafCallback = this.update.bind(this)))
      this.ticking = true
    }
  }

  /**
   * Attach this as the event listeners
   */
  handleEvent () {
    this.requestTick()
  }
}
