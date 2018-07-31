/**
 * @file 数据上报处理
 * @author schoeu
 */

export default {
  data: {},

  /**
   * 数据上报逻辑
   *
   * @param {string} type type
   * @param {*} msg msg
   */
  sendLog (type, msg = {}) {
    /* istanbul ignore if */
    if (!type) {
      return
    }
    msg.type = type
    this.data.event = 'log'
    this.data.data = msg || {}

    /* istanbul ignore if */
    if (window !== window.top) {
      window.parent.postMessage(this.data, '*')
    }
  }
}
