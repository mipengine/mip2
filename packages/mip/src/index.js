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
/* eslint-enable import/no-webpack-loader-syntax */

import {getRuntime} from './runtime'
import util from './util/index'
import {applyLayout} from './layout'
import viewer from './viewer'
import viewport from './viewport'
import builtinComponents from './components/index'
import installSandbox from './sandbox'
import sleepWakeModule from './sleep-wake-module'
import performance from './performance'
import errorMonitorInstall from './log/error-monitor'
import {OUTER_MESSAGE_PERFORMANCE_UPDATE} from './page/const/index'

// Ensure loaded only once
/* istanbul ignore next */
if (typeof window.MIP === 'undefined' || typeof window.MIP.version === 'undefined') {
  errorMonitorInstall()
  const MIP = getRuntime(window)

  // init viewport
  viewport.init()

  util.dom.waitDocumentReady(() => {
    // Initialize sleepWakeModule
    sleepWakeModule.init()

    const preregisteredExtensions = window.MIP || []

    window.MIP = MIP

    installSandbox(window.MIP)

    // Initialize viewer
    viewer.init()

    // Find the default-hidden elements.
    let hiddenElements = Array.prototype.slice.call(document.getElementsByClassName('mip-hidden'))

    // Regular for checking mip elements.
    let mipTagReg = /mip-/i

    // Apply layout for default-hidden elements.
    /* istanbul ignore next */
    hiddenElements.forEach(element => element.tagName.search(mipTagReg) > -1 && applyLayout(element))

    // register buildin components
    builtinComponents.register()
    Array.isArray(preregisteredExtensions) && preregisteredExtensions.forEach(window.MIP.push)

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
