/**
 * @file css
 * @author sekiyika(pengxing@baidu.com)
 */
import {
  camelize,
  kebabize,
  capitalize
} from '../string'
import {startsWith} from '../fn'

let camelReg = /(?:(^-)|-)+(.)?/g

/**
 * Temp element for checking css properties.
 */
let supportElement = document.createElement('div')

const PREFIX_TYPE = ['webkit', 'moz', 'ms', 'o', 'Webkit', 'Moz', 'O']

/**
 * Storage of css properties' prefix.
 */
let prefixCache = {}

/**
 * Make sure a property is supported by adding prefix.
 *
 * @param {string} property A property to be checked
 * @return {string} the property or its prefixed version
 */
export function prefixProperty (property) {
  property = property.replace(camelReg, (match, first, char) => (first ? char : char.toUpperCase()))

  if (prefixCache[property]) {
    return prefixCache[property]
  }

  let prop

  if (!(property in supportElement.style)) {
    for (let i = 0; i < PREFIX_TYPE.length; i++) {
      let prefixedProp = PREFIX_TYPE[i] +
        property.charAt(0).toUpperCase() +
        property.slice(1)
      if (prefixedProp in supportElement.style) {
        prop = prefixedProp
        break
      }
    }
  }

  prefixCache[property] = prop || property

  return prefixCache[property]
}

const UNIT_REG = /^\d+([a-zA-Z]+)/

/**
 * Storage of css properties' units.
 */
let unitCache = {}

/**
 * Obtain the unit of a property and add it to the value has no unit if exists.
 *
 * @param {string} property property
 * @param {(string|number)} value A value maybe needs unit.
 * @return {(string|number)}
 */
function unitProperty (property, value) {
  if (value !== +value) {
    return value
  }

  if (unitCache[property]) {
    return value + unitCache[property]
  }

  supportElement.style[property] = 0

  let propValue = supportElement.style[property]
  let match = propValue.match && propValue.match(UNIT_REG)

  if (match) {
    return value + (unitCache[property] = match[1])
  }

  return value
}

/**
 * Set or get the value of the style properties of an element or any elements.
 * Examples:
 *    css(elements, 'left', 0);
 *    css(element, 'left', 0);
 *    css(element, {left: 0, top: 0});
 *    css(element or elements, 'left'); // the value(s) of the computed left property of the element(s)
 *
 * @param {(Array.<HTMLElement>|HTMLElement)} elements The source element(s)
 * @param {(Object|string)} property Object contains style properties or property name
 * @param {?(string|number)} value The value of setting property
 * @return {(Array.<HTMLElement>|HTMLElement|string)}
 */
export default function css (elements, property, value) {
  if (!property || !elements) {
    return elements
  }
  if (elements.length && elements[0]) {
    if (property && value !== undefined) {
      for (let i = 0; i < elements.length; i++) {
        let element = elements[i]
        css(element, property, value)
      }
      return elements
    }
    let ret = []
    for (let i = 0; i < elements.length; i++) {
      ret.push(css(elements[i], property))
    }
    return ret
  }
  if (!elements.nodeType) {
    return elements
  }
  let element = elements
  if (typeof property !== 'string' || value !== undefined) {
    let prop
    if (typeof property === 'string') {
      prop = prefixProperty(property)
      element.style[prop] = unitProperty(prop, value)
    } else {
      for (let i in property) {
        value = property[i]
        prop = prefixProperty(i)
        element.style[prop] = unitProperty(prop, value)
      }
    }
    return element
  }
  property = prefixProperty(property)

  return element.style[property] || document.defaultView.getComputedStyle(element)[property]
}

export function styleToObject (str) {
  if (!str) {
    return {}
  }

  let styles = str.split(/\s*;[;\s]*/)
    .filter(style => style.indexOf(':') > 0)

  let obj = {}
  for (let style of styles) {
    let [attr, value] = style.split(/\s*:\s*/)
    obj[styleCamelCase(attr)] = value
  }
  return obj
}

function isPascal (key) {
  return /^[A-Z]/.test(key)
}

function styleKebabize (key) {
  if (!isPascal(key)) {
    for (let prefix of PREFIX_TYPE) {
      if (startsWith(key, prefix) && isPascal(key[prefix.length])) {
        key = capitalize(key)
        break
      }
    }
  }
  return kebabize(key)
}
function styleCamelCase (key) {
  if (startsWith(key, '-')) {
    key = key.slice(1)
  }
  return camelize(key)
}

export function objectToStyle (obj) {
  let text = Object.keys(obj)
    .map(key => stringifyStyle(styleKebabize(key), obj[key]))
    .join(';')
  return text && (text + ';') || text
}

function stringifyStyle (key, value) {
  if (Array.isArray(value)) {
    return value.map(val => `${key}:${val}`).join(';')
  }
  return `${key}:${value}`
}


