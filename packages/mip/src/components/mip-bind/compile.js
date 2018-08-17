/**
 * @file compile.js
 * @author qiusiqi (qiusiqi@baidu.com)
 */

import Watcher from './watcher'
import * as util from './util'

let VALUE = /^value$/
let TAGNAMES = /^(input|textarea|select)$/i
let ATTRS = /^(checked|selected|autofocus|controls|disabled|hidden|multiple|readonly)$/i

/* global MIP */

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
   * @param {HTMLElement} node node
   * @param {string} directive m-xx directive
   * @param {string} exp expression to calculate value that needs to be bound
   */
  compileDirective (node, directive, expression) {
    let me = this
    let fnName = directive.name.slice(2) // example => bind:msg.sync
    let attrName = directive.name // example => m-bind:msg.sync
    let data
    let shouldRm
    let isSync = false

    // if is m-bind directive, check first
    if (/^bind:.*/.test(fnName)) {
      let attr = fnName.substr(5, 5)
      // if binding class/style compile these two spectially
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

      isSync = fnName.slice(-5) === '.sync'
      attrName = attrName.replace(/.sync$/, '')
      fnName = 'bind'
    }
    !data && (data = me.getMVal(node, attrName, expression, isSync))
    if (typeof data !== 'undefined') {
      me[fnName] && me[fnName]({
        node,
        attrName,
        data,
        expression: expression.replace(/^(Class|Style):/, ''),
        shouldRm,
        isSync
      })
    }

    this.listenerFormElement(node, directive, expression)
    /* eslint-disable */
    new Watcher(node, me.data, attrName, expression, function (attr, newVal) {
      me[fnName] && me[fnName]({
        node,
        attrName: attr,
        data: newVal
      })
    })
    /* eslint-enable */
  }

  /*
   * add eventlistener of form element
   * @param {HTMLElement} node node
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
   * @param {HTMLElement} node DOM NODE
   * @param {*} data value to set as node.textContent
   */
  text ({node, data}) {
    node.textContent = data
  }

  /*
   * directive m-bind
   * @param {HTMLElement} node DOM NODE
   * @param {string} attrName directive
   * @param {*} data value to bind
   * @param {string} expression expression for binding value
   * @param {boolean} shouldRm tell if should remove directive
   * @param {boolean} isSync two-way binding
   */
  bind ({
    node, attrName, data,
    expression, shouldRm = false, isSync = false
  }) {
    let reg = /bind:(.*)/
    let result = reg.exec(attrName)
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
      if (util.objNotEmpty(data)) {
        Object.keys(data).forEach(k => node.classList.toggle(k, data[k]))
        shouldRm && node.removeAttribute(attrName)
      }
    } else if (attr === 'style') {
      if (util.objNotEmpty(data)) {
        let staticStyle = util.styleToObject(node.getAttribute(attr) || '')
        Object.keys(data).forEach(styleAttr => {
          staticStyle[styleAttr] = data[styleAttr]
        })
        node.setAttribute(attr, util.objectToStyle(staticStyle))
        shouldRm && node.removeAttribute(attrName)
      }
    } else {
      // 存储 m-bind 的数据，不直接挂到 node 属性下，避免污染 node 属性，key 和 属性名一致
      node.attrValues = node.attrValues || {}
      node.attrValues[attr] = {
        sync: isSync ? expression : '',
        val: data
      }

      if (typeof data === 'object') {
        data = JSON.stringify(data)
      }
      data !== '' ? node.setAttribute(attr, data) : node.removeAttribute(attr)
      if (TAGNAMES.test(node.tagName)) {
        if (ATTRS.test(attr)) {
          node[attr] = !!data
        } else if (VALUE.test(attr)) {
          node[attr] = data
        }
      }
    }
  }

  updateData (data) {
    this.origin = data
  }

  /*
   * to get value
   * @param {HTMLElement} node node
   * @param {string} attrName attribute
   * @param {string} exp expression to calculate value that needs to be bound
   * @param {boolean} isSync two-way binding
   */
  getMVal (node, attrName, exp, isSync) {
    if (!exp) {
      return
    }
    let value
    try {
      let res = util.getter(this, exp)
      value = res.value
      if (res.shouldRm) {
        node.removeAttribute(attrName + (isSync ? '.sync' : ''))
      }
    } catch (e) {
      // console.error(e)
    }
    return value
  }
}

export default Compile
