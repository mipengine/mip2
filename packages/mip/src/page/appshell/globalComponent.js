/**
 * @file Global component
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {appendScript} from '../util/dom'
import {BUILT_IN_COMPONENTS} from '../const'

export default class GlobalComponent {
  constructor () {
    /**
     * Registered global component list
     * CONTAINS BUILT-IN COMPONENTS
     * e.g. ['mip-dialog', 'mip-img']
     */
    this.registeredGlobalComponent = []

    /**
     * Loaded scripts
     * DOESN'T CONTAIN BUILT-IN COMPONENTS
     * e.g. ['mip-component-a', 'mip-component-b']
     */
    this.loadedScripts = []

    this._init()
  }

  _init () {
    // Add initial scripts
    [].slice.call(document.querySelectorAll('script')).forEach(script => {
      let src = script.src || ''
      let match = src.match(/\/(mip-[^/]+)\.js/)

      if (match) {
        this.loadedScripts.push(match[1])
      }
    })
  }

  async register ({name, html, src}) {
    console.log('register', name)
    // Each global component can be registered only once
    if (this.registeredGlobalComponent.indexOf(name) !== -1) {
      return
    }

    // Add component script if needed
    if (src && this.loadedScripts.indexOf(name) === -1 && BUILT_IN_COMPONENTS.indexOf(name) === -1) {
      await appendScript(src)
      this.loadedScripts.push(name)
    }

    document.body.innerHTML += html
    this.registeredGlobalComponent.push(name)
  }
}
