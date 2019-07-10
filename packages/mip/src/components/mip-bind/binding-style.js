

const vendorNames = ['Webkit', 'Moz', 'ms']
const emptyStyle = document.createElement('div').style


function bindStyle (node, key, value, oldValue) {
  let newValue = formatStyle(value)
  for (let prop of Object.keys(newValue)) {
    let val = newValue[prop]
    if (!oldValue || oldValue[prop] !== val) {
      node.style[prop] = val
    }
  }
  return newValue
}

function formatStyle (value) {
  if (Array.isArray(value)) {
    return value.reduce((result, item) => {
      return Object.assign(result, formatStyle(item))
    }, {})
  }
  if (instance(value) === '[object Object]') {
    let styles = {}
    for(let prop of Object.keys(value)) {
      let normalizedProp = normalize(prop).replace(/[A-Z]/g, match => '-' + match.toLowerCase())
      if (!normalizedProp) {
        continue
      }
      let val = value[prop]
      if (Array.isArray(val)) {
        let div = document.createElement('div')
        for (let i = 0, len = val.length; i < len; i++) {
          div.style[normalizedProp] = val[i]
        }
        styles[normalizedProp] = div.style[normalizedProp]
      } else {
        styles[normalizedProp] = val
      }
    }
    return styles
  }
  return {}
}

/**
 * autoprefixer
 * @param {string} prop css prop needed to be prefixed
 */
function normalize (prop) {
  prop = camelize(prop)
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

