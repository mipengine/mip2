import Services from './services'

import {hasOwnProperty, jsonParse} from '../util'
import {hyphenate} from '../util/string'
import {memoize} from '../util/fn'

export class VueCompat {
  constructor () {
    this.getPropsMetadata = memoize(this.getPropsMetadata).bind(this)
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
   * @param {?Object} definition
   * @returns {!Object}
   */
  getPropsMetadata (name, definition) {
    const metadata = {
      propTypes: {},
      defaultValues: {}
    }

    if (!name || !definition) {
      return metadata
    }

    if (typeof definition === 'object') {
      metadata.propTypes = this.getVueExtraPropTypes(definition)
    }

    const {props} = definition

    if (Array.isArray(props)) {
      for (let i = 0; i < props.length; i++) {
        metadata.propTypes[props[i]] = String
      }

      return metadata
    }

    if (!props || typeof props !== 'object') {
      return metadata
    }

    const names = Object.keys(props)

    for (let i = 0; i < names.length; i++) {
      const name = names[i]
      const prop = props[name]

      metadata.propTypes[name] = this.getPropType(prop)

      if (prop && typeof prop === 'object' && hasOwnProperty.call(prop, 'default')) {
        metadata.defaultValues[name] = prop.default
      }
    }

    return metadata
  }

  /**
   * @param {string} name
   * @param {?Object} definition
   * @returns {!Object}
   */
  getPropTypes (name, definition) {
    return this.getPropsMetadata(name, definition).propTypes
  }

  /**
   * @param {string} name
   * @param {?Object} definition
   * @returns {!Object}
   */
  getDefaultValues (name, definition) {
    return this.getPropsMetadata(name, definition).defaultValues
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
