/**
 * @file mip1-polyfill MIP2 兼容 MIP1 的方式之一
 * @author sekiyika(pengxing@baidu.com)
 */

import 'deps/esl.js'
import util from '../util/index'
import hash from '../util/hash'
import viewer from '../viewer'
import viewport from '../viewport'
import templates from '../util/templates'
import registerElement from './element'
import customElement from './customElement'
import performance from '../performance'
import fixedElement from '../fixed-element'
import cssLoader from '../util/dom/css-loader'
import eventAction from '../util/event-action'

// 将 jquery 配置为远程的，需要时才引入
window.require.config({
  paths: {
    'searchbox/openjs/aio': '//m.baidu.com/static/searchbox/openjs/aio.js?v=201606',
    jquery: '//c.mipcdn.com/static/deps/jquery',
    zepto: '//c.mipcdn.com/static/deps/zepto'
  }
})

window.define('util', () => util)
window.define('viewer', () => viewer)
window.define('viewport', () => viewport)
window.define('templates', () => templates)
window.define('customElement', () => customElement)
window.define('performance', () => performance)
window.define('utils/customStorage', () => util.customStorage)
window.define('fetch-jsonp', () => window.fetchJsonp)
window.define('fixed-element', () => fixedElement)
window.define('hash', () => hash)
window.define('dom/event', () => util.event)
window.define('mip', () => window.MIP)
window.define('naboo', () => util.naboo)
window.define('dom/css-loader', () => cssLoader)
window.define('dom/css', () => util.css)
window.define('dom/dom', () => util.dom)
window.define('dom/rect', () => util.rect)
window.define('utils/event-action', () => eventAction)
window.define('utils/event-emitter', () => util.EventEmitter)
window.define('utils/fn', () => util.fn)
window.define('utils/platform', () => util.platform)
window.define('utils/gesture', () => util.Gesture)

export default function install (mip) {
  Object.assign(mip, {
    /**
     * register mip1 element
     *
     * @deprecated
     * @param {string} name element tag name
     * @param {string} clazz class
     * @param {string} css css
     */
    registerMipElement (name, clazz, css) {
      if (templates.isTemplateClass(clazz)) {
        templates.register(name, clazz)
      } else {
        registerElement(name, clazz, css)
      }
    }
  })
}
