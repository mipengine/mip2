/**
 * @file mixin.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

import {mergeOptions} from '../util/index'

export function initMixin (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
