/**
 * @file mip-data-watch.js
 * @author clark-t (clarktanglei@163.com)
 */

import CustomElement from '../../custom-element'
import viewer from '../../viewer'

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
