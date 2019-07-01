/**
 * @file whitelist.js
 * @author clark-t (clarktanglei@163.com)
 * @description
 *  sync from AMP-bind:
 *  https://github.com/ampproject/amphtml/blob/master/extensions/amp-bind/0.1/bind-expression.js
 */

 import dom from '../dom/dom'
 import {globalAction} from '../event-action/global-action'
 import {mipAction} from '../event-action/mip-action'

function getHTMLElementAction ({object, property, options}) {
  return (...args) => {

    let action = {
      handler: property,
      event: options.event,
      arg: args.join(','),
      target: object
    }

    if (dom.isMIPElement(object)) {
      object.executeEventAction(action)
    } else if (globalAction[property]) {
      globalAction[property](action)
    } else {
      throw new Error(`Can not find action "${handler}".`)
    }
  }
}

function getMIPAction ({property, event}) {
  // return (...args) => {
  //   // let action = {
  //   //   handler: property,
  //   //   event: event,
  //   //   args: args
  //   // }
    
  //   if (mipAction[property]) {
  //     mipAction[property](...args)
  //   }
  // }
  if (mipAction[property]) {
    return mipAction[property]
  }
  throw new Error(`Can not find action "${handler}" from MIP.`)
}

function instanceSort (...args) {
  return this.slice().sort(...args)
}

function instanceSplice (...args) {
  return this.slice().splice(...args)
}

export const PROTOTYPE = {
  '[object Array]': {
    concat: Array.prototype.concat,
    filter: Array.prototype.filter,
    indexOf: Array.prototype.indexOf,
    join: Array.prototype.join,
    lastIndexOf: Array.prototype.lastIndexOf,
    map: Array.prototype.map,
    reduce: Array.prototype.reduce,
    slice: Array.prototype.slice,
    some: Array.prototype.some,
    // sort: Array.prototype.sort,
    // splice: Array.prototype.splice,
    sort: instanceSort,
    splice: instanceSplice,
    includes: Array.prototype.includes
  },
  '[object Number]': {
    toExponential: Number.prototype.toExponential,
    toFixed: Number.prototype.toFixed,
    toPrecision: Number.prototype.toPrecision,
    toString: Number.prototype.toString
  },
  '[object String]': {
    charAt: String.prototype.charAt,
    charCodeAt: String.prototype.charCodeAt,
    concat: String.prototype.concat,
    indexOf: String.prototype.indexOf,
    lastIndexOf: String.prototype.lastIndexOf,
    slice: String.prototype.slice,
    split: String.prototype.split,
    substr: String.prototype.substr,
    substring: String.prototype.substring,
    toLowerCase: String.prototype.toLowerCase,
    toUpperCase: String.prototype.toUpperCase
  }
}

export const CUSTOM_FUNCTIONS = {
  encodeURI: encodeURI,
  encodeURIComponent: encodeURIComponent,

  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  sqrt: Math.sqrt,
  log: Math.log,
  max: Math.max,
  min: Math.min,
  random: Math.random,
  round: Math.round,
  sign: Math.sign,

  keys: Object.keys,
  values: Object.values,

  // 兼容以前的 MIP event 逻辑
  decodeURI: decodeURI,
  decodeURIComponent: decodeURIComponent,
  isNaN: isNaN,
  isFinite: isFinite,
  parseFloat: parseFloat,
  parseInt: parseInt,

  Number: Number,
  Date: Date,
  Boolean: Boolean,
  String: String
}

export const CUSTOM_OBJECTS = {
  event ({event}) {
    return property => {
      return event[method]
    }
  },

  // MIP ({MIP, event}) {
  //   return property => {
  //     return (...args) => {
  //       return MIP({handler: property, args, event})
  //     }
  //   }
  // },

  MIP ({event}) {
    return property => {
      // return (...args) => {
      //   return mipAction[property]({handler: property, args, event})
      // }
      return getMIPAction({property, event})
    }
  },

  DOM ({target}) {
    return property => {
      if (property === 'dataset') {
        return target[property]
      }

      if (typeof target[property] === 'string') {
        return target[property]
      }
    }
  },
  // 兼容以前的 MIP-data
  m () {
    return property => window.m[property]
  },

  // 兼容以前的 MIP on 表达式里支持的全局变量
  Math () {
    return property => Math[property]
  },
  Number () {
    return property => Number[property]
  },
  Date () {
    return property => Date[property]
  },
  Array () {
    return property => Array[property]
  },
  Object () {
    return property => Object[property]
  },
  Boolean () {
    return property => Boolean[property]
  },
  String () {
    return property => String[property]
  }
  // RegExp () {
  //   return RegExp
  // },

}

export function getValidObject (id) {
  return CUSTOM_OBJECTS[id] || function () {
    return property => window.m[id][property]
  }
}

export function getValidCallee (path) {
  let callee = path.node.callee

  switch (callee.type) {
    case 'Identifier':
      return CUSTOM_FUNCTIONS[callee.name]
    case 'MemberExpression':
      return getValidMemberExpressionCallee(path)
    default:
      return path.traverse(callee)
  }
}

function getValidMemberExpressionCallee (path) {
  let {
    object: objectNode,
    property: propertyNode
  } = path.node.callee

  let propertyFn = path.traverse(propertyNode, path.node.callee)

  let customObjectFn
  let objectFn

  let objectName = objectNode.name

  if (objectNode.type === 'Identifier') {
    customObjectFn = CUSTOM_OBJECTS[objectName]
  }
  else {
    objectFn = path.traverse(objectNode, path.node.callee)
  }

  return options => {
    let property = propertyFn()

    if (customObjectFn) {
      return customObjectFn(options)(property)
    }

    if (objectFn) {
      let object = objectFn()
      return getValidPrototypeFunction(object, property)
    }

    if (window.m.hasOwnProperty(objectName)) {
      let object = window.m[objectName]
      return getValidPrototypeFunction(object, property)
    }

    let object = document.getElementById(objectName)
    return getHTMLElementAction({object, property, options})
  }
}

function getValidPrototypeFunction (object, property) {
  let instance = Object.prototype.toString.call(object)
  let fn = PROTOTYPE[instance] && PROTOTYPE[instance][property]
  if (!fn) {
    throw Error(`不支持 ${instance}.${property} 方法`)
  }
  return fn.bind(object)
}



