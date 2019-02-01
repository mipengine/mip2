/**
 * @file index.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

import createVueInstance from './utils/create-vue-instance'
import {camelize, hyphenate} from '../util/string'
import CustomElement from '../custom-element'
import registerElement from '../register-element'
import Services from '../services/services'
import Vue from 'vue'

class MIPVue {
  constructor () {
    this.vueCompat = Services.vueCompat()

    this.registerElement = this.registerElement.bind(this)

    Vue.use((Vue) => {
      Vue.config.ignoredElements = [/^mip-/i]

      Vue.customElement = this.registerElement
    })
  }

  /**
   * Registers Vue custom element.
   *
   * @param {string} name of custom element.
   * @param {!Object} definition of component.
   */
  registerElement (name, definition) {
    const vueCompat = this.vueCompat
    const propTypes = vueCompat.getPropTypes(name, definition)
    const camelizedProps = Object.keys(propTypes)
    const hyphenatedProps = camelizedProps.map(hyphenate)

    function callLifeCycle (ctx, name, ...args) {
      if (typeof definition[name] === 'function') {
        return definition[name].apply(ctx, args)
      }
    }

    class VueCustomElement extends CustomElement {
      /** @override */
      prerenderAllowed (elementRect, viewportRect) {
        if (typeof definition.prerenderAllowed === 'function') {
          return definition.prerenderAllowed(elementRect, viewportRect)
        }

        return false
      }

      /** @private */
      _build () {
        const propsData = {
          ...definition.propsData,
          ...vueCompat.getProps(this.element, propTypes)
        }

        this.vueInstance = createVueInstance(
          this.element,
          Vue,
          definition,
          camelizedProps,
          propsData
        )
        this.vm = this.vueInstance.$children[0]
      }

      /** @override */
      build () {
        if (this.prerenderAllowed()) {
          this._build()
        }
      }

      /** @override */
      connectedCallback () {
        callLifeCycle(this, 'connectedCallback', this.element)
      }

      /** @override */
      disconnectedCallback () {
        callLifeCycle(this, 'disconnectedCallback', this.element)
      }

      /** @override */
      firstInviewCallback () {
        if (!this.prerenderAllowed()) {
          this._build()
        }

        callLifeCycle(this.vm, 'firstInviewCallback', this.element)
      }

      /** @override */
      viewportCallback (inViewport) {
        callLifeCycle(this.vm, 'viewportCallback', inViewport, this.element)
      }

      /** @override */
      attributeChangedCallback (name, oldValue, value) {
        if (!this.vueInstance) {
          return
        }

        const prop = camelize(name)
        const propType = propTypes[prop]

        this.vueInstance[prop] = vueCompat.parseAttribute(value, propType)
      }

      /** @override */
      static get observedAttributes () {
        return hyphenatedProps
      }
    }

    return registerElement(name, VueCustomElement)
  }
}

Services.registerService('mip-vue', MIPVue)
