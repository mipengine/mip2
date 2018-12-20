/**
 * @file index.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

import createVueInstance from './utils/create-vue-instance'
import {getProps, convertAttributeValue} from './utils/props'
import {camelize} from './utils/helpers'
import CustomElement from '../custom-element'
import registerElement from '../register-element'
import Vue from 'vue'

Vue.use(function (Vue) {
  Vue.config.ignoredElements = [/^mip-/i]
  Vue.customElement = (tag, componentDefinition) => {
    const props = getProps(componentDefinition)

    function callLifeCycle (ctx, name) {
      if (typeof componentDefinition[name] === 'function') {
        return componentDefinition[name].apply(ctx, [].slice.call(arguments, 2))
      }
    }

    class VueCustomElement extends CustomElement {
      /** @override */
      prerenderAllowed (elementRect, viewportRect) {
        if (typeof componentDefinition.prerenderAllowed === 'function') {
          return componentDefinition.prerenderAllowed(elementRect, viewportRect)
        }

        return false
      }

      /** @private */
      _build () {
        let vueInstance = this.vueInstance = createVueInstance(
          this.element,
          Vue,
          componentDefinition,
          props
        )
        this.props = props
        this.vm = vueInstance.$children[0]
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
        if (this.vueInstance) {
          const nameCamelCase = camelize(name)
          const type = this.props.types[nameCamelCase]
          this.vueInstance[nameCamelCase] = convertAttributeValue(value, type)
        }
      }

      /** @override */
      static get observedAttributes () {
        return props.hyphenate
      }
    }

    return registerElement(tag, VueCustomElement)
  }
})

/**
 * register vue as custom element v1
 *
 * @param {string} tag custom elment name, mip-*
 * @param {*} component vue component
 * @return {Array<HTMLElement>|undefined}
 */
export default function registerVueCustomElement (tag, component) {
  return Vue.customElement(tag, component)
}
