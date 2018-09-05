/**
 * @file util.js
 * @author sfe
 */

const regVar = /[\w\d-._]+/g
const regTpl = /(\${)([^}]+)(})/g
const vendorNames = ['Webkit', 'Moz', 'ms']
const RESERVED = ['Math', 'Number', 'String', 'Object', 'window']
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
    } else if (isArray(item)) {
      Object.assign(obj, arrayToObject(item))
    } else if (typeof item === 'string') {
      Object.assign(obj, classSplit(item))
    }
  })
  return obj
}

/*
 * parse class binding
 * @param {Object|Array} classSpecs new classObject
 * @param {Object|Array} oldSpecs old classObject
 */
export function parseClass (classSpecs, oldSpecs = {}) {
  // reset old classes
  Object.keys(oldSpecs).forEach(k => {
    oldSpecs[k] = false
  })
  if (typeof classSpecs === 'string') {
    // deal with multiple class-defined case
    classSpecs = classSplit(classSpecs)
    // set new classes
    return Object.assign({}, oldSpecs, classSpecs)
  }
  // parse Object only
  if (isArray(classSpecs)) {
    classSpecs = arrayToObject(classSpecs)
  }

  let newClasses = {}
  if (isObject(classSpecs)) {
    Object.keys(classSpecs).forEach(k => {
      typeof classSpecs[k] !== 'undefined' && k && (newClasses[k] = classSpecs[k])
    })
  }
  return Object.assign({}, oldSpecs, newClasses)
}

function classSplit (classSpecs) {
  return classSpecs.trim().split(/\s+/).reduce((res, target) => {
    return Object.assign(res, {[target]: true})
  }, {})
}

/*
 * parse style binding
 * @param {Object|Array} styleSpecs new styleObject
 */
export function parseStyle (styleSpecs) {
  let styles = {}

  // parse Object only
  if (isArray(styleSpecs)) {
    styleSpecs.forEach(styleObj => {
      Object.assign(styles, parseStyle(styleObj))
    })
    return styles
  }
  if (!isObject(styleSpecs)) {
    return ''
  }

  Object.keys(styleSpecs).forEach(k => {
    let normalizedName = normalize(k)
    if (!normalizedName) {
      return
    }

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

/*
 * autoprefixer
 * @param {string} prop css prop needed to be prefixed
 */
export function normalize (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style
  prop = prop.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : /* istanbul ignore next */ ''))

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
  return ''
}

export function styleToObject (style) {
  if (!style) {
    return {}
  }

  // etc: font-size:12px; => {fontSize: '12px'}
  let styles = style.split(';')
  let styleObj = {}
  for (let i = 0, len = styles.length; i < len; i++) {
    let item = styles[i]
    if (!item) {
      continue
    }
    let parts = item.split(':')
    styleObj[parts[0]] = parts[1]
  }
  return styleObj
}

export function objectToStyle (obj) {
  let styles = ''
  // etc: {fontSize: '12px'} => font-size:12px;
  Object.keys(obj).forEach(k => {
    styles += `${k}:${obj[k]};`
  })
  return styles
}

export function getter (ctx, exp) {
  let fn = getWithResult.bind(ctx, exp)
  let get = fn.call(ctx.data)
  return get.call(ctx.data, ctx.data)
}

export function getWithResult (exp) {
  exp = namespaced(exp) || ''
  let matches = exp.match(/(this\.[\w\d-._]+|this\['[\w\d-._]+'\])/gmi)
  let read = ''
  if (matches && matches.length) {
    matches.forEach(function (e) {
      read += `;typeof ${e} === 'undefined' && (hadReadAll = false)`
    })
  }
  let func
  try {
    /* eslint-disable */
    func = new Function(`
      with (this) {
        try {
          var hadReadAll = true
          ${read}
          return {
            value: ${exp},
            hadReadAll: hadReadAll
          }
        } catch (e) {
          return {}
        }
      }
    `)
    /* eslint-enable */
  } catch (e) {
    /* istanbul ignore next */
    func = () => ({})
  }
  return func
}

export function setter (ctx, exp, value) {
  let fn = setWithResult.bind(ctx, exp, value)
  let set = fn.call(ctx.data)
  set.call(ctx.data)
}

export function setWithResult (exp, value) {
  exp = namespaced(exp)
  let func
  try {
    func = new Function(`with(this){try {${exp} = "${value}"} catch (e) {}}`) // eslint-disable-line
  } catch (e) {
    /* istanbul ignore next */
    func = () => ''
  }
  return func
}

export function namespaced (str) {
  if (!str) {
    return
  }
  let newExp = ''
  let match = null
  let pointer = 0
  let tpls = []

  // deal with template-like str first and save results
  str = str.replace(/(`[^`]+`|'[^']+')/g, match => {
    // template need to recursively parse
    if (match[0] === '`') {
      match = match.replace(regTpl, tplMatch => namespaced(tplMatch))
    }
    tpls.push(match)
    return `MIP-STR-TPL${tpls.length - 1}`
  })

  while ((match = regVar.exec(str)) != null) {
    let index = match['index']
    let matched = match[0]

    newExp += str.substring(pointer, index)

    pointer = index + matched.length

    // get template-like str result directly
    if (matched.indexOf('MIP-STR-TPL') !== -1) {
      newExp += tpls[+match[0].substr(11)]
      continue
    }
    // skip special cases
    if (!isNaN(match[0]) ||
        /^\./.test(match[0]) ||
        !match[0].replace(/[-._]/g, '').length ||
        RESERVED.indexOf(match[0].split('.')[0]) !== -1
    ) {
      newExp += match[0]
      continue
    }

    // to get the next not blankspace char of matched, to tell its nature
    let i = findChar(str, pointer, true)
    // not key of an obj or string warpped by quotes - vars
    /* istanbul ignore else */
    if (i >= str.length || !/['`:]/.test(str[i])) {
      newExp += wrap(match[0])
    } else if (str[i] === ':') {
      i = findChar(str, index - 1, false)
      // tell if conditional operator ?:
      if (i < 0 || str[i] !== '?') {
        newExp += match[0]
      } else {
        newExp += wrap(match[0])
      }
    } else {
      newExp += match[0]
    }
  }
  newExp += str.substr(pointer)

  return newExp
}

function wrap (exp) {
  if (/-/.test(exp)) {
    return `this['${exp}']`
  }
  return `this.${exp}`
}

function findChar (str, i, forward) {
  while (str[i] && str[i] === ' ') {
    forward ? (i++) : (i--)
  }
  return i
}
