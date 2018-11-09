/**
 * @file mip entry
 * @author sfe
 */

/* eslint-disable import/no-webpack-loader-syntax */
// add polyfills
import 'script-loader!deps/fetch'
import 'script-loader!deps/fetch-jsonp'
import 'script-loader!document-register-element/build/document-register-element'
import 'deps/promise'
import 'deps/object-assign'
import 'deps/mip-components-webpack-helpers'
/* eslint-enable import/no-webpack-loader-syntax */

import registerVueCustomElement from './vue-custom-element/index'
import CustomElement from './custom-element'
import util from './util/index'
import sandbox from './sandbox'
import layout from './layout'
import viewer from './viewer'
import viewport from './viewport'
import Resources from './resources'
import builtinComponents from './components/index'
import MipShell from './components/mip-shell/index'
import registerCustomElement from './register-element'
import sleepWakeModule from './sleep-wake-module'
import performance from './performance'
import templates from './util/templates'
import mip1PolyfillInstall from './mip1-polyfill/index'
import monitorInstall from './log/monitor'
import {OUTER_MESSAGE_PERFORMANCE_UPDATE} from './page/const/index'

let mip = {}

// Ensure loaded only once
/* istanbul ignore next */
if (typeof window.MIP === 'undefined' || typeof window.MIP.version === 'undefined') {
  monitorInstall()

  // pass meta through `window.name` in cross-origin scene
  let pageMeta
  let pageMetaConfirmed = false
  try {
    pageMeta = JSON.parse(window.name)
    /* istanbul ignore next */
    pageMetaConfirmed = true
  } catch (e) {
    pageMeta = {
      standalone: false,
      isRootPage: true,
      isCrossOrigin: false
    }
  }

  // 当前是否是独立站
  let standalone
  /* istanbul ignore if */
  if (pageMetaConfirmed) {
    standalone = pageMeta.standalone
  } else {
    try {
      standalone = pageMeta.standalone ||
        !viewer.isIframed ||
        typeof window.top.MIP !== 'undefined'
    } catch (e) {
      /* istanbul ignore next */
      standalone = false
    }
    pageMeta.standalone = standalone
  }

  let push = ext => typeof ext.func === 'function' && ext.func()
  mip = {
    version: '2',
    registerVueCustomElement,
    registerCustomElement,
    CustomElement,
    util,
    viewer,
    viewport,
    hash: util.hash,
    standalone,
    css: {},
    /* istanbul ignore next */
    push,
    performance,
    templates,
    prerenderElement: Resources.prerenderElement,
    builtinComponents: {
      // MipShell 应该删除，不符合命名
      MipShell,
      MIPShell: MipShell
    }
  }

  // init viewport
  viewport.init()

  // install mip1 polyfill
  mip1PolyfillInstall(mip)

  util.dom.waitDocumentReady(() => {
    // Initialize sleepWakeModule
    sleepWakeModule.init()

    let extensions = window.MIP || []
    window.MIP = mip
    // Sandbox depends on window.MIP
    window.MIP.sandbox = sandbox()

    // Initialize viewer
    viewer.pageMeta = pageMeta
    viewer.init()

    // Find the default-hidden elements.
    let hiddenElements = Array.prototype.slice.call(document.getElementsByClassName('mip-hidden'))

    // Regular for checking mip elements.
    let mipTagReg = /mip-/i

    // Apply layout for default-hidden elements.
    /* istanbul ignore next */
    hiddenElements.forEach(element => element.tagName.search(mipTagReg) > -1 && layout.applyLayout(element))

    // register buildin components
    builtinComponents.register()
    // Handler preregister extensions
    extensions.forEach(ext => typeof ext.func === 'function' && ext.func())

    performance.start(window._mipStartTiming)
    // send performance data
    performance.on('update', timing => {
      viewer.sendMessage(OUTER_MESSAGE_PERFORMANCE_UPDATE, timing)
    })

    // Show page
    viewer.show()

    // clear cookie
    let storage = util.customStorage(2)
    storage.delExceedCookie()
  })
}
