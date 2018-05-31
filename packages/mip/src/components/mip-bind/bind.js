/**
 * @file bind.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Compile from './compile'
import Observer from './observer'
import Watcher from './watcher'
import util from '../../util'
import mipData from './mip-data'
import registerElement from '../../register-element'

/* global MIP */
/* eslint-disable no-new-func */

class Bind {
  constructor (id) {
    let me = this
    this._id = id
    this._win = window
    this._watchers = []
    this._watcherIds = []
    // require mip data extension runtime
    this._compile = new Compile()
    this._observer = new Observer()
    this._bindEvent()
    // from=0 called by html attributes
    // from=1 refers the method called by mip.js
    MIP.setData = function (action, from) {
      me._bindTarget(false, action, from)
    }
    MIP.$set = function (action, from) {
      me._bindTarget(true, action, from)
      me._eventEmit()
    }
    MIP.$recompile = function () {
      me._observer.start(me._win.m)
      me._compile.start(me._win.m)
    }
    MIP.watch = function (target, cb) {
      me._bindWatch(target, cb)
    }

    window.m = window.m || {}

    registerElement('mip-data', mipData)
    this._dataSource = {
      m: window.m
    }

    MIP.$set(this._dataSource.m)
  }

  // Bind event for post message when fetch data returned, then compile dom again
  _bindEvent () {
    let me = this

    window.addEventListener('message', function (event) {
      let loc = me._win.location
      let domain = loc.protocol + '//' + loc.host
      if (event.origin === domain &&
        event.source && event.data &&
        event.data.type === 'bind' &&
        // && event.data.type === 'bind' + me._id
        event.source === me._win
      ) {
        MIP.$set(event.data.m)
      }
    })
  }

  _bindTarget (compile, action, from) {
    let data = from ? action.arg : action
    let evt = from ? action.event.target : {}
    if (typeof data === 'string') {
      data = (new Function('DOM', 'return ' + data))(evt)
    }

    if (typeof data === 'object') {
      let origin = JSON.stringify(window.m || {})
      this._compile.upadteData(JSON.parse(origin))
      let classified = this._normalize(data)
      if (compile) {
        this._setGlobalState(classified.globalData)
        this._setPageState(classified.pageData)
        this._observer.start(this._win.m)
        this._compile.start(this._win.m)
      } else {
        if (classified.globalData && notEmpty(classified.globalData)) {
          this._assign(this._win.parent.g, classified.globalData)
        }
        data = classified.pageData
        for (let field of Object.keys(data)) {
          if (this._win.m.hasOwnProperty(field)) {
            this._assign(this._win.m, {[field]: data[field]})
          } else {
            this._dispatch(field, data[field])
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
        total += '{("[^{}:]+":{[^{}]+},)*'
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
    this._watchers.push(new Watcher(
      null,
      this._win.m,
      '',
      target,
      cb
    ))
  }

  _dispatch (key, val) {
    let win = this._win
    if (win.g && win.g.hasOwnProperty(key)) {
      this._assign(win.g, {[key]: val})
    } else if (!win.MIP.MIP_ROOT_PAGE && win.parent.g && win.parent.g.hasOwnProperty(key)) {
      this._assign(win.parent.g, {[key]: val})
    } else {
      Object.assign(win.m, {[key]: val})
    }
  }

  _setGlobalState (data) {
    let win = this._win
    if (win.MIP.MIP_ROOT_PAGE) {
      win.g = win.g || {}
      Object.assign(win.g, data)
    } else {
      win.parent.g = win.parent.g || {}
      Object.assign(win.parent.g, data)
    }
  }

  _setPageState (data) {
    let win = this._win
    Object.assign(win.m, data)
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

  _assign (oldData, newData) {
    for (let k of Object.keys(newData)) {
      if (isObj(newData[k]) && oldData[k]) {
        this._assign(oldData[k], newData[k])
        let obj = JSON.parse(JSON.stringify({[k]: oldData[k]}))
        Object.assign(oldData, obj)
      } else {
        oldData[k] = newData[k]
      }
    }
  }

  _eventEmit () {
    this._win.dispatchEvent(
      util.event.create('ready-to-watch')
    )
  }
}

function isObj (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
function notEmpty (obj) {
  return isObj(obj) && Object.keys(obj).length !== 0
}

export default Bind
