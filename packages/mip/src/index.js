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
import util from './util/index'
import sandbox from './sandbox'
import layout from './layout'
import viewer from './viewer'
import viewport from './viewport'
import Resources from './resources'
import builtinComponents from './components/index'
import MipShell from './components/mip-shell/index'
import registerCustomElement from './register-element'
import sleepWakeModule from './sleepWakeModule'
import performance from './performance'
import mip1PolyfillInstall from './mip1-polyfill/index'
import componentHelpers from './component-helpers'

import './log/monitor'

/**
 * register vue as custom element v1
 *
 * @param {string} tag custom elment name, mip-*
 * @param {*} component vue component
 */
function registerVueCustomElement (tag, component) {
  // 对于组件需要暴露一些子组件到外部的情况，可以通过组件的 components 定义 mip-xxx 格式的组件
  // 这样就可以在组件外部使用 mip-xxx 啦，内部还是照常跟原来一样作为一个 vue 组件使用
  if (component.components) {
    Object.keys(component.components)
      .filter(key => key.slice(0, 4) === 'mip-')
      .forEach(key => registerVueCustomElement(key, component.components[key]))
  }
  Vue.customElement(tag, component)
}

// 当前是否是独立站
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
  componentHelpers,
  builtinComponents: {
    MipShell
  }
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
