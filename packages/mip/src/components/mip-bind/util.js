/**
 * @file util.js
 * @author sfe
 */

const vendorNames = ['Webkit', 'Moz', 'ms']
let emptyStyle

export function isObject (obj) {
  return obj && Object.prototype.toString.call(obj) === '[object Object]'
}

export function isArray (obj) {
  return obj && obj.constructor === Array
}

export function objNotEmpty (obj) {
  return isObject(obj) && Object.keys(obj).length !== 0
}

export function arrayToObject (arr) {
  let obj = {}
  arr.forEach(item => {
    if (isObject(item)) {
      Object.assign(obj, item)
    } else {
      obj[item] = true
    }
  })
  return obj
}

export function parseClass (classSpecs) {
  if (isArray(classSpecs)) {
    classSpecs = arrayToObject(classSpecs)
  }

  let newClasses = {}
  if (isObject(classSpecs)) {
    Object.keys(classSpecs).forEach(k => {
      k && (newClasses[k] = classSpecs[k])
    })
    return newClasses
  }
}

export function parseStyle (styleSpecs) {
  let styles = {}

  if (isArray(styleSpecs)) {
    styleSpecs.forEach(styleObj => {
      styles = Object.assign(styles, parseStyle(styleObj))
    })
    return styles
  }
  if (!isObject(styleSpecs)) {
    return ''
  }

  Object.keys(styleSpecs).forEach(k => {
    let normalizedName = normalize(k)
    let newKey = normalizedName.replace(/[A-Z]/g, match => '-' + match.toLowerCase())
    let val = styleSpecs[k]
    if (isArray(val)) {
      let div = document.createElement('div')
      for (let i = 0, len = val.length; i < len; i++) {
        div.style[newKey] = val[i]
      }
      styles[newKey] = div.style[newKey]
    } else {
      styles[newKey] = val
    }
  })
  return styles
}

export function normalize (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style
  prop = prop.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))

  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }

  const capName = prop.charAt(0).toUpperCase() + prop.slice(1)
  for (let i = 0; i < vendorNames.length; i++) {
    const name = vendorNames[i] + capName
    if (name in emptyStyle) {
      return name
    }
  }
}

export function styleToObject (style) {
  if (!style) {
    return {}
  }

  let styles = style.split(';')
  let styleObj = {}
  for (let item of styles) {
    if (!item) {
      continue
    }
    let parts = item.split(':')
    styleObj[parts[0]] = parts[1]
  }
  return styleObj
}

export function objectToStyle (obj) {
  if (!isObject(obj)) {
    return ''
  }

  let styles = ''
  Object.keys(obj).forEach(k => {
    styles += `${k}:${obj[k]};`
  })
  return styles
}
