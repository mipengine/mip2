/**
 * @file compile.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Watcher from './watcher'
import {parseContent, objNotEmpty, styleToObject, objectToStyle} from './util'

let VALUE = /^value$/
let TAGNAMES = /^(input|textarea|select)$/i
let ATTRS = /^(checked|selected|autofocus|controls|disabled|hidden|multiple|readonly)$/i

class Compile {
  constructor () {
    this._el = document.documentElement
  }

  start (data, win) {
    this.data = data
    this._compileElement(win.document.documentElement)
    // this._fragment = this._cloneNode();
    // this._compileElement(this._fragment);
    // this._el.appendChild(this._fragment);
  }

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

    if (/^bind:/.test(fnName)) {
      let attr = fnName.slice(5)
      if (attr === 'class' || attr === 'style') {
        try {
          let fn = this.getWithResult(expression)
          data = parseContent(fn.call(this.data), attr) // eslint-disable-line no-new-func
        } catch (e) {
          data = {}
        }
        expression = `${attr}:${expression}`
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
      if (typeof me[fnName] === 'function') {
        me[fnName](node, dir, newVal)
      }
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
        let fn = this.setWithResult(expression, e.target.value)
        fn.call(this.data)
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
    if (!result.length) {
      return
    }
    let attr = result[1]
    if (attr !== 'disabled' && node.disabled) {
      Object.assign(window.m, this.origin)
      return
    }
    if (attr === 'class') {
      if (objNotEmpty(newVal)) {
        for (let k of Object.keys(newVal)) {
          node.classList.toggle(k, newVal[k])
        }
        // class 和 style 可能关联了多个数据，这些数据可能分布在不同的 mip-data 中，clear 的时机应该是什么？
        node.removeAttribute(directive)
      }
    } else if (attr === 'style') {
      if (objNotEmpty(newVal)) {
        let staticStyle = styleToObject(node.getAttribute(attr) || '')
        for (let styleAttr of Object.keys(newVal)) {
          staticStyle[styleAttr] = newVal[styleAttr]
        }
        node.setAttribute(attr, objectToStyle(staticStyle))
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
      let fn = this.getWithResult(exp)
      value = fn.call(this.data)
      value !== '' && node.removeAttribute(attrName)
    } catch (e) {
      // console.error(e)
    }
    return value
  }

  /* eslint-disable */
  getWithResult (exp) {
    return new Function((`with(this){try {return ${exp}} catch(e) {throw e}}`))
  }

  setWithResult (exp, value) {
    return new Function((`with(this){try {${exp} = "${value}"} catch (e) {throw e}}`))
  }
  /* eslint-enable */
}

export default Compile
