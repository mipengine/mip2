/**
 * @file whitelist.js
 * @author clark-t (clarktanglei@163.com)
 * @description
 *  sync from AMP-bind:
 *  https://github.com/ampproject/amphtml/blob/master/extensions/amp-bind/0.1/bind-expression.js
 */

 import dom from '../dom/dom'
 import {globalAction} from '../event-action/globalAction'

export function getHTMLElementAction ({obj, prop, options}) {
  return (...args) => {

    let action = {
      handler: prop,
      event: options.event,
      arg: args.join(','),
      target: obj
    }

    if (dom.isMIPElement(obj)) {
      obj.executeEventAction(action)
    } else if (globalAction[prop]) {
      globalAction[prop](action)
    }

  }
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
    sort: Array.prototype.sort,
    splice: Array.prototype.splice,
    // sort: instanceSort(),
    // splice: instanceSplice(),
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
  encodeURI,
  encodeURIComponent,
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
  keys: Math.keys,
  values: Math.values,
  MIP ({MIP, event}) {
    return function (handler) {
      return function (...args) {
        return MIP({handler, arg: args.join(','), event})
      }
    }
  },
}

export const CUSTOM_OBJECTS = {
  event ({event}) {
    return event
  },
  // 兼容以前的 MIP-data
  m () {
    return window.m
  },
  
}

export function byId (id) {
  return document.getElementById(id)
}

export function getCustomObject (id) {
  return CUSTOM_OBJECTS[id] || byId.bind(null, id)
}

export function getCustomFunction (id) {
  return CUSTOM_FUNCTIONS[id] || byId.bind(null, id)
}

