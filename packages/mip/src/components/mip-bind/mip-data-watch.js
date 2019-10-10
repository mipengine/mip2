/**
 * @file mip-data-watch.js
 * @author clark-t (clarktanglei@163.com)
 */

import CustomElement from '../../custom-element'
import viewer from '../../viewer'

/**
 * <mip-data-watch> 组件，提供数据监听功能
 *
 * @class
 * @extends CustomElement
 */
export default class MIPDataWatch extends CustomElement {
  build () {
    let key = this.element.getAttribute('watch')

    key && MIP.watch(key, (newValue, oldValue) => {
      viewer.eventAction.execute('change', this.element, { oldValue, newValue })
    })
  }

  prerenderAllowed () {
    return true
  }
}

