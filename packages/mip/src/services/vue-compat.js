import Services from './services'

import {hasOwn, jsonParse} from '../util'
import {hyphenate} from '../util/string'
import {memoize} from '../util/fn'

export class VueCompat {
  constructor () {
    /**
     * Metadata should be cached by name of the custom element.
     *
     * @type {(name: string, definition: ?Object) => !Object}
     * @private
     */
    this.getPropsMetadata = memoize(this.getPropsMetadata).bind(this)
  }

  /**
   * Returns formatted prop type.
   *
   * @param {!Object} prop type.
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
   * Returns prop types derived from `extends` and `mixins` of Vue component.
   *
   * @param {!Object} definition of Vue component.
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
   * Returns metadata computed from a definition of custom element or Vue component,
   * which contains `propTypes` and `defaultValues`.
   *
   * @param {string} name of custom element.
   * @param {?Object} definition of custom element or Vue component.
   * @returns {!Object}
   * @private
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

      if (prop && typeof prop === 'object' && hasOwn(prop, 'default')) {
        metadata.defaultValues[name] = prop.default
      }
    }

    return metadata
  }

  /**
   * Returns prop types of custom element or Vue component.
   *
   * @param {string} name of custom element.
   * @param {?Object} definition of custom element or Vue component.
   * @returns {!Object}
   */
  getPropTypes (name, definition) {
    return this.getPropsMetadata(name, definition).propTypes
  }

  /**
   * Returns default values of custom element or Vue component.
   *
   * @param {string} name of custom element.
   * @param {?Object} definition of custom element.
   * @returns {!Object}
   */
  getDefaultValues (name, definition) {
    return this.getPropsMetadata(name, definition).defaultValues
  }

  /**
   * Returns prop that is parsed based on prop type.
   *
   * @param {string} attribute name.
   * @param {!Object} propType of attribute.
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
   * Returns props of element parsed from attributes.
   *
   * @param {!HTMLElement} element instance.
   * @param {!Object} propTypes of custom element.
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
   * Returns props of element parsed from JSON.
   *
   * @param {!HTMLElement} element instance.
   * @param {!Object} propTypes of custom element.
   * @returns {?Object}
   * @private
   */
  getPropsFromJSON (element, propTypes) {
    const script = element.querySelector('script[type*=json]')

    if (!script) {
      return null
    }

    try {
      const props = jsonParse(script.innerHTML)
      const names = Object.keys(props)

      for (let i = 0; i < names.length; i++) {
        const name = names[i]

        if (typeof props[name] !== 'string') {
          continue
        }

        props[name] = this.parseAttribute(props[name], propTypes[name])
      }

      return props
    } catch (err) {
      return null
    }
  }

  /**
   * Returns props of element merged from attributes and JSON.
   *
   * @param {!HTMLElement} element instance.
   * @param {!Object} propTypes of custom element.
   * @returns {!Object}
   */
  getProps (element, propTypes) {
    return {
      ...this.getPropsFromAttributes(element, propTypes),
      ...this.getPropsFromJSON(element, propTypes)
    }
  }
}

export function installVueCompatService () {
  Services.registerService('vue-compat', VueCompat)
}
