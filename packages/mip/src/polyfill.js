/**
 * @file polyfill
 * @author clark-t (clarktanglei@163.com)
 */

import 'core-js/modules/es6.promise'
// import 'core-js/modules/es6.map'
// import 'core-js/modules/es6/set'
// import 'core-js/modules/es6.set-prototype-of'
import 'core-js/modules/es6.object.assign'
import 'document-register-element/build/document-register-element.esm'
// import 'deps/document-register-element'

import 'deps/fetch-jsonp'
import {
  fetch as polyfillFetch,
  Headers as polyfillHeaders,
  Request as polyfillRequest,
  Response as polyfillResponse
} from 'whatwg-fetch/fetch'

import platform from './util/platform'

// 增加 QQ 浏览器的判断，
// 因为 QQ 浏览器的早起版本 fetch 实现有问题，
// 发送请求会漏掉 cookie，
// 因为在 QQ 浏览器中也通过 polyfill 的方式覆盖 fetch
if (platform.isQQ) {
  window.fetch = polyfillFetch
  window.Headers = polyfillHeaders
  window.Request = polyfillRequest
  window.Response = polyfillResponse
}
