import Services from './services'

import {jsonParse} from '../util'
import {hyphenate} from '../util/string'
import {memoize} from '../util/fn'

export class VueCompat {
  constructor () {
    this.getPropTypes = memoize(this.getPropTypes).bind(this)
  }

  /**
   * @param {!Object} prop
   * @returns {!Object}
   * @private
   */
  getPropType (prop) {
    if (typeof prop === 'function') {
      return prop
    }

    if (Array.isArray(prop)) {
      return prop[0]
    }

    if (prop && typeof prop === 'object') {
      return this.getPropType(prop.type)
    }

    return String
  }

  /**
   * @param {!Object} definition
   * @returns {?Object}
   * @private
   */
  getVueExtraPropTypes (definition) {
    const {extends: extended = {}, mixins = []} = definition

    return {
      ...this.getPropTypes(extended.name, extended),
      ...mixins.reduce((propTypes, mixin) => ({...propTypes, ...this.getPropTypes(mixin.name, mixin)}), {})
    }
  }

  /**
   * @param {string} name
   * @param {!Object} definition
   * @returns {!Object}
   */
  getPropTypes (name, definition) {
    if (!name || !definition) {
      return {}
    }

    const propTypes = typeof definition === 'object' ? this.getVueExtraPropTypes(definition) : {}
    const {props} = definition

    if (Array.isArray(props)) {
      for (let i = 0; i < props.length; i++) {
        propTypes[props[i]] = String
      }

      return propTypes
    }

    if (props && typeof props === 'object') {
      const names = Object.keys(props)

      for (let i = 0; i < names.length; i++) {
        const name = names[i]

        propTypes[name] = this.getPropType(props[name])
      }
    }

    return propTypes
  }

  /**
   * @param {string} attribute
   * @param {!Object} propType
   * @returns {?Object}
   */
  parseAttribute (attribute, propType) {
    if (attribute === null || typeof attribute === 'undefined') {
      return
    }

    if (propType === Number) {
      return parseFloat(attribute, 10)
    }

    if (propType === Boolean) {
      return attribute !== 'false'
    }

    if (propType === Array || propType === Object) {
      try {
        return jsonParse(attribute)
      } catch (err) {
        return
      }
    }

    if (propType !== Date && propType !== Function && typeof propType === 'function') {
      return this.parseAttribute(attribute, propType(attribute))
    }

    return attribute
  }

  /**
   * @param {!HTMLElement} element
   * @param {!Object} propTypes
   * @returns {!Object}
   * @private
   */
  getPropsFromAttributes (element, propTypes) {
    const props = {}
    const names = Object.keys(propTypes)

    for (let i = 0; i < names.length; i++) {
      const name = names[i]
      const attribute = element.getAttribute(hyphenate(name))

      props[name] = this.parseAttribute(attribute, propTypes[name])
    }

    return props
  }

  /**
   * @param {!HTMLElement} element
   * @returns {?Object}
   * @private
   */
  getPropsFromJSON (element) {
    const script = element.querySelector('script[type*=json]')

    if (!script) {
      return null
    }

    try {
      return jsonParse(script.innerHTML)
    } catch (err) {
      return null
    }
  }

  /**
   * @param {!HTMLElement} element
   * @param {!Object} propTypes
   * @returns {!Object}
   */
  getProps (element, propTypes) {
    return {
      ...this.getPropsFromAttributes(element, propTypes),
      ...this.getPropsFromJSON(element)
    }
  }
}

export function installVueCompatService () {
  Services.registerService('vue-compat', VueCompat)
}
