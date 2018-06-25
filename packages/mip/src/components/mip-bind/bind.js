/**
 * @file bind.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Compile from './compile'
import Observer from './observer'
import Watcher from './watcher'
import {isObject, objNotEmpty} from './util'

/* global MIP */
/* eslint-disable no-new-func */

class Bind {
  constructor () {
    let me = this
    this._win = window
    this._watcherIds = []
    this._win.pgStates = new Set()
    // require mip data extension runtime
    this._compile = new Compile()
    this._observer = new Observer()
    // from=0 called by html attributes
    // from=1 refers the method called by mip.js
    MIP.setData = function (action, from) {
      me._bindTarget(false, action, from)
    }
    MIP.$set = function (action, from, cancel, win) {
      me._bindTarget(true, action, from, cancel, win)
    }
    MIP.$recompile = function () {
      me._observer.start(me._win.m)
      me._compile.start(me._win.m, me._win)
    }
    MIP.watch = function (target, cb) {
      me._bindWatch(target, cb)
    }

    window.m = window.m || {}
    window.mipDataPromises = window.mipDataPromises || []
    MIP.$set(window.m)
  }

  /*
   * broadcast: to recompile because shared data updated
   * @param {Object} data data
   */
  _postMessage (data) {
    if (!objNotEmpty(data)) {
      return
    }

    let win = window.MIP.MIP_ROOT_PAGE ? window : window.parent
    MIP.$set({}, 0, true, win)

    for (let i = 0; i < win.document.getElementsByTagName('iframe').length; i++) {
      let subwin = win.document.getElementsByTagName('iframe')[i].contentWindow
      MIP.$set({}, 0, true, subwin)
    }
  }

  _bindTarget (compile, action, from, cancel, win = this._win) {
    let data = from ? action.arg : action
    let evt = from ? action.event.target : {}
    if (typeof data === 'string') {
      data = (new Function('DOM', 'return ' + data))(evt)
    }

    if (typeof data === 'object') {
      let origin = JSON.stringify(win.m || {})
      this._compile.upadteData(JSON.parse(origin))
      let classified = this._normalize(data)
      if (compile) {
        this._setGlobalState(classified.globalData, cancel, win)
        this._setPageState(classified.pageData, cancel, win)
        this._observer.start(win.m)
        this._compile.start(win.m, win)
      } else {
        if (classified.globalData && objNotEmpty(classified.globalData)) {
          let g = window.MIP.MIP_ROOT_PAGE ? window.g : window.parent.g
          assign(g, classified.globalData)
          !cancel && this._postMessage(classified.globalData)
        }
        data = classified.pageData
        for (let field of Object.keys(data)) {
          if (win.pgStates.has(field)) {
            assign(win.m, {
              [field]: data[field]
            })
          } else {
            this._dispatch(field, data[field], cancel, win)
          }
        }
      }
    } else {
      console.error('setData method must accept an object!')
    }
  }

  _bindWatch (target, cb) {
    if (target.constructor === Array) {
      for (let key of target) {
        MIP.watch(key, cb)
      }
      return
    }
    if (typeof target !== 'string') {
      return
    }
    if (!cb || typeof cb !== 'function') {
      return
    }

    let reg = target.split('.').reduce((total, current) => {
      if (total) {
        total += '{("[^{}:"]+":[^,]+,)*'
      }
      return total + `"${current}":`
    }, '')
    if (!JSON.stringify(this._win.m).match(new RegExp(reg))) {
      return
    }

    let watcherId = `${target}${cb.toString()}`.replace(/[\n\t\s]/g, '')
    if (this._watcherIds.indexOf(watcherId) !== -1) {
      return
    }

    this._watcherIds.push(watcherId)
    new Watcher(null, this._win.m, '', target, cb) // eslint-disable-line no-new
  }

  _dispatch (key, val, cancel, win = this._win) {
    let data = {
      [key]: val
    }
    if (win.g && win.g.hasOwnProperty(key)) {
      assign(win.g, data)
      !cancel && this._postMessage(data)
    } else if (!win.MIP.MIP_ROOT_PAGE && win.parent.g && win.parent.g.hasOwnProperty(key)) {
      assign(win.parent.g, data)
      !cancel && this._postMessage(data)
    } else {
      Object.assign(win.m, data)
    }
  }

  _setGlobalState (data, cancel, win = this._win) {
    if (win.MIP.MIP_ROOT_PAGE) {
      win.g = win.g || {}
      Object.assign(win.g, data)
    } else {
      win.parent.g = win.parent.g || {}
      Object.assign(win.parent.g, data)
      !cancel && this._postMessage(data)
    }
  }

  _setPageState (data, cancel, win = this._win) {
    let g = win.MIP.MIP_ROOT_PAGE ? win.g : win.parent.g
    Object.assign(win.m, data)
    !cancel && Object.keys(data).forEach(k => win.pgStates.add(k))
    for (let key of Object.keys(g)) {
      if (!win.pgStates.has(key) && win.m.hasOwnProperty(key)) {
        win.m[key] = g[key]
      }
    }
    win.m.__proto__ = win.MIP.MIP_ROOT_PAGE ? win.g : win.parent.g // eslint-disable-line no-proto
  }

  _normalize (data) {
    let globalData = {}
    let pageData = {}

    for (let k of Object.keys(data)) {
      if (/^#/.test(k)) {
        globalData[k.substr(1)] = data[k]
      } else {
        pageData[k] = data[k]
      }
    }

    return {
      globalData,
      pageData: pageData || {}
    }
  }
}

function assign (oldData, newData) {
  for (let k of Object.keys(newData)) {
    if (isObject(newData[k]) && oldData[k] && isObject(oldData[k])) {
      assign(oldData[k], newData[k])
      let obj = JSON.parse(JSON.stringify({
        [k]: oldData[k]
      }))
      Object.assign(oldData, obj)
    } else {
      oldData[k] = newData[k]
    }
  }
}

export default Bind
