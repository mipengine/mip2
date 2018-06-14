/**
 * @file mip entry
 * @author sfe
 */

/* eslint-disable import/no-webpack-loader-syntax */
import 'script-loader!deps/fetch.js'
import 'script-loader!fetch-jsonp'
import 'script-loader!document-register-element/build/document-register-element'
/* eslint-enable import/no-webpack-loader-syntax */

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
import mip1PolyfillInstall from './mip1-polyfill'
import componentHelpers from './component-helpers'

import './log/monitor'

/**
 * register vue as custom element v1
 *
 * @param {string} tag custom elment name, mip-*
 * @param {*} component vue component
 */
function registerVueCustomElement (tag, component) {
  Vue.customElement(tag, component)
}

/**
 * register custom element v1
 *
 * @param {string} tag custom element name, mip-*
 * @param {HTMLElement} component component clazz
 */
function registerCustomElement (tag, component) {
  registerElement(tag, component)
}

// 当前是否是独立站，这种判断方法还不太准确，判断不出
let standalone
try {
  standalone = !viewer.isIframed || typeof window.top.MIP !== 'undefined'
} catch (e) {
  standalone = false
}
let extensions = window.MIP || []

function push (extension) {
  extensions.push(extension)
}

let mip = {
  version: '2',
  registerVueCustomElement,
  registerCustomElement,
  util,
  viewer,
  viewport,
  hash: util.hash,
  standalone,
  sandbox,
  css: {},
  push,
  prerenderElement: Resources.prerenderElement,
  componentHelpers
}

window.MIP = mip

// init viewport
viewport.init()
// init resource
viewport.resources = new Resources(viewport)

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

export default mip
