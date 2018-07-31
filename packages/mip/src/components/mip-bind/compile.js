/**
 * @file compile.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Watcher from './watcher'
import * as util from './util'

let VALUE = /^value$/
let TAGNAMES = /^(input|textarea|select)$/i
let ATTRS = /^(checked|selected|autofocus|controls|disabled|hidden|multiple|readonly)$/i

class Compile {
  constructor () {
    this._el = document.documentElement
  }

  start (data) {
    if (!data || !util.objNotEmpty(data)) {
      return
    }
    this.data = data
    this._compileElement(this._el)
    // this._fragment = this._cloneNode();
    // this._compileElement(this._fragment);
    // this._el.appendChild(this._fragment);
  }

  /* istanbul ignore next */
  _cloneNode () {
    let child
    let fragment = document.createDocumentFragment()
    /* eslint-disable */
    while (child = this._el.firstChild) {
    /* eslint-enable */
      fragment.appendChild(child)
    }
    return fragment
  }

  _compileElement (el) {
    let me = this
    let nodes = el.childNodes;
    [].slice.call(nodes).forEach(function (node) {
      if (!me._isElementNode(node)) {
        return
      }
      me._compileAttributes(node)
      if (node.childNodes && node.childNodes.length) {
        me._compileElement(node)
      }
    })
  }

  _isDirective (attr) {
    return attr.indexOf('m-') === 0
  }

  _isElementNode (node) {
    return node.nodeType === 1
  }

  _compileAttributes (node) {
    let me = this
    /* istanbul ignore if */
    if (!node) {
      return
    }
    let attrs = node.attributes;
    [].slice.call(attrs).forEach(function (attr) {
      if (!me._isDirective(attr.name)) {
        return
      }
      me._compileDirective(node, attr, attr.value)
    })
  }

  _compileDirective (node, directive, expression) {
    let me = this
    let fnName = directive.name.slice(2)
    let attrName = directive.name
    let data

    if (/^bind:.*/.test(fnName)) {
      let attr = fnName.slice(5)
      if (attr === 'class' || attr === 'style') {
        let attrKey = attr.charAt(0).toUpperCase() + attr.slice(1)
        try {
          let fn = util.getWithResult.bind(this, expression)
          let getter = fn.call(this.data)
          data = util['parse' + attrKey](getter.call(this.data, this.data))
        } catch (e) {
          // istanbul ignore next
          data = {}
        }
        expression = `${attrKey}:${expression}`
      }
      fnName = 'bind'
    }
    !data && (data = me._getMVal(node, attrName, expression))
    if (typeof data !== 'undefined') {
      me[fnName] && me[fnName](node, attrName, data)
    }

    this._listenerFormElement(node, directive, expression)
    /* eslint-disable */
    new Watcher(node, me.data, attrName, expression, function (dir, newVal) {
      me[fnName] && me[fnName](node, dir, newVal)
    })
    /* eslint-enable */
  }

  _listenerFormElement (node, directive, expression) {
    if (TAGNAMES.test(node.tagName)) {
      let attr = directive.name.split(':')
      attr = attr.length > 1 ? attr[1] : ''
      if (attr.trim() !== 'value') {
        return
      }
      let handle = function (e) {
        let fn = util.setWithResult.bind(this, expression, e.target.value)
        let setter = fn.call(this.data)
        setter.call(this.data)
      }
      node.addEventListener('input', handle.bind(this))
    }
  }

  text (node, directive, newVal) {
    node.textContent = newVal
  }

  bind (node, directive, newVal) {
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
        node.removeAttribute(directive)
      }
    } else if (attr === 'style') {
      if (util.objNotEmpty(newVal)) {
        let staticStyle = util.styleToObject(node.getAttribute(attr) || '')
        Object.keys(newVal).forEach(styleAttr => {
          staticStyle[styleAttr] = newVal[styleAttr]
        })
        node.setAttribute(attr, util.objectToStyle(staticStyle))
        node.removeAttribute(directive)
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

  upadteData (data) {
    this.origin = data
  }

  _getMVal (node, attrName, exp) {
    if (!exp) {
      return
    }
    let value
    try {
      let fn = util.getWithResult.bind(this, exp)
      let getter = fn.call(this.data)
      value = getter.call(this.data, this.data)
      if (value !== '' && typeof value !== 'undefined') {
        node.removeAttribute(attrName)
      }
    } catch (e) {
      // console.error(e)
    }
    return value
  }
}

export default Compile
