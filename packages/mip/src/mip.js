/**
 * @file mip exports
 * @author sfe
 */

import Vue from 'vue'
import vueCustomElement from './vue-custom-element/index'
import util from './util'
import sandbox from './sandbox'
import layout from './layout'
import viewer from './viewer'
import viewport from './viewport'
import Resources from './resources'
import builtinComponents from './components'
import registerElement from './register-element'
import sleepWakeModule from './sleepWakeModule'
import performance from './performance'

// mip version
export let version = 2

/**
 * register vue as custom element v1
 *
 * @param {string} tag custom elment name, mip-*
 * @param {*} component vue component
 */
export function registerVueCustomElement (tag, component) {
  Vue.customElement(tag, component)
}

/**
 * register custom element v1
 *
 * @param {string} tag custom element name, mip-*
 * @param {HTMLElement} component component clazz
 */
export function registerCustomElement(tag, component) {
  registerElement(tag, component)
}

export {util} from 'util'

let mip = {

  ,
  util,
  viewer,
  viewport,
  hash: util.hash,
  sandbox,
  css: {},
  prerenderElement: Resources.prerenderElement
}

if (window.MIP) {
  let exts = window.MIP
  mip.extensions = exts
}

window.MIP = mip

// 当前是否是独立站，这种判断方法还不太准确，判断不出
try {
  mip.standalone = typeof window.top.MIP !== 'undefined'
} catch (e) {
  mip.standalone = false
}

// init viewport
mip.viewport.init()

// before document ready
mip.push = function (extensions) {
  if (!mip.extensions) {
    mip.extensions = []
  }

  mip.extensions.push(extensions)
}

// install mip1 polyfill
mip1PolyfillInstall(mip)
// add custom element to Vue
Vue.use(vueCustomElement)

util.dom.waitDocumentReady(() => {
  // Initialize sleepWakeModule
  sleepWakeModule.init()

  // Initialize viewer
  viewer.init()

  // Find the default-hidden elements.
  let hiddenElements = Array.prototype.slice.call(document.getElementsByClassName('mip-hidden'))

  // Regular for checking mip elements.
  let mipTagReg = /mip-/i

  // Apply layout for default-hidden elements.
  hiddenElements.forEach(element => element.tagName.search(mipTagReg) > -1 && layout.applyLayout(element))

  // register buildin components
  builtinComponents.register()

  performance.start(Date.now())

  // send performance data until the data collection is completed
  performance.on('update', timing => {
    if (timing.MIPDomContentLoaded &&
      timing.MIPStart &&
      timing.MIPPageShow &&
      timing.MIPFirstScreen
    ) {
      viewer.sendMessage('performance_update', timing)
    }
  })

  // Show page
  viewer.show()

  // clear cookie
  let storage = util.customStorage(2)
  storage.delExceedCookie()
})

