import Services from './services'

import {hasOwnProperty, jsonParse} from '../util'
import {camelize, hyphenate} from '../util/string'
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

    if (prop && typeof prop === 'object' && prop.type) {
      return this.getPropType(prop.type)
    }

    return String
  }

  /**
   * @param {!Object} definition
   * @returns {?Object}
   */
  getVueExtraPropTypes (definition) {
    if (!definition) {
      return null
    }

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
        propTypes[camelize(props[i])] = String
      }
    }

    if (typeof props === 'object') {
      for (const name in props) {
        if (!hasOwnProperty.call(props, name)) {
          continue
        }

        propTypes[camelize(name)] = this.getPropType(props[name])
      }
    }

    return propTypes
  }

  /**
   * @param {string} attribute
   * @param {!Object} propType
   */
  parseAttribute (attribute, propType) {
    if (propType === Boolean) {
      return attribute !== 'false'
    }

    if (propType === Number) {
      return parseFloat(attribute, 10)
    }

    if (propType === Array || propType === Object) {
      try {
        return jsonParse(attribute)
      } catch (err) {
        return null
      }
    }

    if (propType === Date) {
      return new Date(attribute)
    }

    if (propType !== Function && typeof propType === 'function') {
      return this.parseAttribute(attribute, propType(attribute))
    }

    return attribute
  }

  /**
   * @param {!HTMLElement} element
   * @param {!Object} propTypes
   * @private
   */
  getPropsFromAttributes (element, propTypes) {
    const props = {}

    for (const propName in propTypes) {
      if (!hasOwnProperty.call(propTypes, propName)) {
        continue
      }

      const attrName = hyphenate(propName)

      if (!element.hasAttribute(attrName)) {
        continue
      }

      const attribute = element.getAttribute(attrName)

      props[propName] = this.parseAttribute(attribute, propTypes[propName])
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
