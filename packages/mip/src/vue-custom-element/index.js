/**
 * @file index.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

import createVueInstance from './utils/create-vue-instance'
import {getProps, convertAttributeValue} from './utils/props'
import {camelize} from './utils/helpers'
import CustomElement from '../custom-element'
import registerElement from '../register-element'

function install (Vue) {
  Vue.config.ignoredElements = [/^mip-/i]

  Vue.customElement = (tag, componentDefinition) => {
    // 如果不设置 template 和 render 函数，默认设置 render 函数返回 null，避免 warning
    let {template, render} = componentDefinition
    if (!template && typeof render !== 'function') {
      componentDefinition.render = () => null
    }

    const props = getProps(componentDefinition)
    function callLifeCycle (ctx, name) {
      if (typeof componentDefinition[name] === 'function') {
        return componentDefinition[name].apply(ctx, [].slice.call(arguments, 2))
      }
    }

    class VueCustomElement extends CustomElement {
      prerenderAllowed () {
        if (typeof componentDefinition.prerenderAllowed === 'function') {
          return componentDefinition.prerenderAllowed()
        }

        return false
      }

      _build () {
        let vueInstance = this.vueInstance = createVueInstance(
          this.element, {
            Vue
          },
          componentDefinition,
          props
        )
        this.props = props
        this.vm = vueInstance.$children[0]
      }

      build () {
        if (this.prerenderAllowed()) {
          this._build()
        }
      }

      connectedCallback () {
        callLifeCycle(this, 'connectedCallback', this.element)
      }

      disconnectedCallback () {
        callLifeCycle(this, 'disconnectedCallback', this.element)
      }

      firstInviewCallback () {
        if (!this.prerenderAllowed()) {
          this._build()
        }

        callLifeCycle(this.vm, 'firstInviewCallback', this.element)
      }

      attributeChangedCallback (name, oldValue, value) {
        if (this.vueInstance) {
          const nameCamelCase = camelize(name)
          const type = this.props.types[nameCamelCase]
          this.vueInstance[nameCamelCase] = convertAttributeValue(value, type)
        }
      }

      static get observedAttributes () {
        return props.hyphenate || []
      }
    }

    registerElement(tag, VueCustomElement)
  }
}

export default install
