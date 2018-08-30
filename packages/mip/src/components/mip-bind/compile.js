/**
 * @file compile.js
 * @author qiusiqi (qiusiqi@baidu.com)
 */

import Watcher from './watcher'
import * as util from './util'

let VALUE = /^value$/
let TAGNAMES = /^(input|textarea|select)$/i
let ATTRS = /^(checked|selected|autofocus|controls|disabled|hidden|multiple|readonly)$/i

class Compile {
  constructor () {
    this.el = document.documentElement
  }

  start (data) {
    if (!data || !util.objNotEmpty(data)) {
      return
    }
    this.data = data
    this.compileElement(this.el)
    // this.fragment = this.cloneNode();
    // this.compileElement(this.fragment);
    // this.el.appendChild(this.fragment);
  }

  /* istanbul ignore next */
  cloneNode () {
    let child
    let fragment = document.createDocumentFragment()
    /* eslint-disable */
    while (child = this.el.firstChild) {
    /* eslint-enable */
      fragment.appendChild(child)
    }
    return fragment
  }

  compileElement (el) {
    let nodes = el.childNodes;
    [].slice.call(nodes).forEach(node => {
      if (!this.isElementNode(node)) {
        return
      }
      this.compileAttributes(node)
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  isDirective (attr) {
    return attr.indexOf('m-') === 0
  }

  isElementNode (node) {
    return node.nodeType === 1
  }

  compileAttributes (node) {
    /* istanbul ignore if */
    if (!node) {
      return
    }
    let attrs = node.attributes;
    [].slice.call(attrs).forEach(attr => {
      if (!this.isDirective(attr.name)) {
        return
      }
      this.compileDirective(node, attr, attr.value)
    })
  }

  /*
   * compile directive that meet spec: m-text/m-bind
   * @param {DOM.ELEMENT} node node
   * @param {string} directive m-xx directive
   * @param {string} exp expression to calculate value that needs to be bound
   */
  compileDirective (node, directive, expression) {
    let me = this
    let fnName = directive.name.slice(2)
    let attrName = directive.name
    let data
    let shouldRm

    // if is m-bind directive, check if binding class/style
    // compile these two spectially
    if (/^bind:.*/.test(fnName)) {
      let attr = fnName.slice(5)
      if (attr === 'class' || attr === 'style') {
        let attrKey = attr.charAt(0).toUpperCase() + attr.slice(1)
        try {
          let res = util.getter(this, expression)
          data = util['parse' + attrKey](res.value)
          shouldRm = res.hadReadAll
        } catch (e) {
          // istanbul ignore next
          data = {}
        }
        expression = `${attrKey}:${expression}`
      }
      fnName = 'bind'
    }
    !data && (data = me.getMVal(node, attrName, expression))
    if (typeof data !== 'undefined') {
      me[fnName] && me[fnName](node, attrName, data, shouldRm)
    }

    this.listenerFormElement(node, directive, expression)
    /* eslint-disable */
    new Watcher(node, me.data, attrName, expression, function (dir, newVal) {
      me[fnName] && me[fnName](node, dir, newVal)
    })
    /* eslint-enable */
  }

  /*
   * add eventlistener of form element
   * @param {DOM.ELEMENT} node node
   * @param {string} directive m-xx directive
   * @param {string} exp expression to calculate value that needs to be bound
   */
  listenerFormElement (node, directive, expression) {
    if (TAGNAMES.test(node.tagName)) {
      let attr = directive.name.split(':')
      attr = attr.length > 1 ? attr[1] : ''
      if (attr.trim() !== 'value') {
        return
      }
      let handle = function (e) {
        util.setter(this, expression, e.target.value)
      }
      node.addEventListener('input', handle.bind(this))
    }
  }

  /*
   * directive m-text
   * params {NODE} node DOM NODE
   * params {string} newVal value to set as node.textContent
   */
  text (node, directive, newVal) {
    node.textContent = newVal
  }

  /*
   * directive m-bind
   * params {NODE} node DOM NODE
   * params {string} directive directive
   * params {string} newVal value to bind
   * params {boolean} shouldRm tell if should remove directive
   */
  bind (node, directive, newVal, shouldRm) {
    let reg = /bind:(.*)/
    let result = reg.exec(directive)
    if (!result) {
      return
    }
    let attr = result[1]
    /* istanbul ignore if */
    if (attr !== 'disabled' && node.disabled) {
      Object.assign(window.m, this.origin)
      return
    }
    if (attr === 'class') {
      if (util.objNotEmpty(newVal)) {
        Object.keys(newVal).forEach(k => node.classList.toggle(k, newVal[k]))
        shouldRm && node.removeAttribute(directive)
      }
    } else if (attr === 'style') {
      if (util.objNotEmpty(newVal)) {
        let staticStyle = util.styleToObject(node.getAttribute(attr) || '')
        Object.keys(newVal).forEach(styleAttr => {
          staticStyle[styleAttr] = newVal[styleAttr]
        })
        node.setAttribute(attr, util.objectToStyle(staticStyle))
        shouldRm && node.removeAttribute(directive)
      }
    } else {
      if (typeof newVal === 'object') {
        newVal = JSON.stringify(newVal)
      }
      newVal !== '' ? node.setAttribute(attr, newVal) : node.removeAttribute(attr)
      if (TAGNAMES.test(node.tagName)) {
        if (ATTRS.test(attr)) {
          node[attr] = !!newVal
        } else if (VALUE.test(attr)) {
          node[attr] = newVal
        }
      }
    }
  }

  updateData (data) {
    this.origin = data
  }

  /*
   * to get value
   * @param {DOM.ELEMENT} node node
   * @param {string} attrName attribute
   * @param {string} exp expression to calculate value that needs to be bound
   */
  getMVal (node, attrName, exp) {
    if (!exp) {
      return
    }
    let value
    try {
      let res = util.getter(this, exp)
      value = res.value
      if (res.hadReadAll) {
        node.removeAttribute(attrName)
      }
    } catch (e) {
      // console.error(e)
    }
    return value
  }
}

export default Compile
