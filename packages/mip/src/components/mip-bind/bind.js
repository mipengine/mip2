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
    this._win = window
    this._watcherIds = []
    this._win.pgStates = new Set()
    // require mip data extension runtime
    this._compile = new Compile()
    this._observer = new Observer()
    // from=0 called by html attributes
    // from=1 refers the method called by mip.js
    MIP.setData = (action, from) => {
      this._bindTarget(false, action, from)
    }
    MIP.$set = (action, from, cancel, win) => {
      this._bindTarget(true, action, from, cancel, win)
    }
    MIP.$recompile = () => {
      this._observer.start(this._win.m)
      this._compile.start(this._win.m, this._win)
    }
    MIP.$update = (data, win) => {
      this._update(data, win)
    }
    MIP.watch = (target, cb) => {
      this._bindWatch(target, cb)
    }

    window.m = window.m || {}
    window.mipDataPromises = window.mipDataPromises || []
    MIP.$set(window.m)
  }

  _postMessage (data) {
    if (!objNotEmpty(data)) {
      return
    }

    for (let k of Object.keys(data)) {
      data[`#${k}`] = data[k]
      delete data[k]
    }

    let win = isSelfParent(window) ? window : window.parent
    win.MIP.$update(data, win)
  }

  _update (data, win) {
    win.MIP.$set(data, 0, true)

    for (let i = 0, frames = win.document.getElementsByTagName('iframe'); i < frames.length; i++) {
      if (frames[i].classList.contains('mip-page__iframe') &&
          frames[i].getAttribute('data-page-id')
      ) {
        let subwin = frames[i].contentWindow
        subwin.MIP.$set(data, 0, true)
      }
    }
  }

  _bindTarget (compile, action, from, cancel, win = this._win) {
    let data = from ? action.arg : action
    let evt = from && action.event ? action.event.target : {}
    if (typeof data === 'string') {
      data = (new Function('DOM', 'return ' + data))(evt)
    }

    if (typeof data === 'object') {
      let origin = JSON.stringify(win.m || {})
      this._compile.upadteData(JSON.parse(origin))
      let classified = this._normalize(data)
      if (compile) {
        this._setGlobalState(classified.globalData, cancel, win)
        this._setPageState(classified, cancel, win)
        this._observer.start(win.m)
        this._compile.start(win.m, win)
      } else {
        if (classified.globalData && objNotEmpty(classified.globalData)) {
          !cancel && this._postMessage(classified.globalData)
        }
        data = classified.pageData
        Object.keys(data).forEach(field => {
          if (win.pgStates.has(field)) {
            assign(win.m, {
              [field]: data[field]
            })
          } else {
            this._dispatch(field, data[field], cancel, win)
          }
        })
      }
    } else {
      console.error('setData method MUST accept an object!')
    }
  }

  _bindWatch (target, cb) {
    if (target.constructor === Array) {
      target.forEach(key => MIP.watch(key, cb))
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
    new Watcher(null, this._win.m, '', `Watch:${target}`, cb) // eslint-disable-line no-new
  }

  _dispatch (key, val, cancel, win = this._win) {
    let data = {
      [key]: val
    }
    if (win.g && win.g.hasOwnProperty(key)) {
      !cancel && this._postMessage(data)
    } else if (!isSelfParent(win) && win.parent.g && win.parent.g.hasOwnProperty(key)) {
      !cancel && this._postMessage(data)
    } else {
      Object.assign(win.m, data)
    }
  }

  _setGlobalState (data, cancel, win = this._win) {
    if (isSelfParent(win)) {
      win.g = win.g || {}
      assign(win.g, data)
    } else {
      !cancel && this._postMessage(data)
    }
  }

  _setPageState (data, cancel, win = this._win) {
    Object.assign(win.m, data.pageData)
    !cancel && Object.keys(data.pageData).forEach(k => win.pgStates.add(k))

    let globalData = data.globalData
    Object.keys(globalData).forEach(key => {
      if (!win.pgStates.has(key) && win.m.hasOwnProperty(key)) {
        if (isObject(globalData[key]) && win.m[key] && isObject(win.m[key])) {
          assign(win.m[key], globalData[key])
          win.m[key] = JSON.parse(JSON.stringify(win.m[key]))
        } else {
          win.m[key] = globalData[key]
        }
      }
    })

    setProto(win.m, getGlobalData(win))
  }

  _normalize (data) {
    let globalData = {}
    let pageData = {}

    Object.keys(data).forEach(k => {
      if (typeof data[k] === 'function') {
        throw 'setData method MUST NOT accept object that contains functions' // eslint-disable-line no-throw-literal
      }
      if (/^#/.test(k)) {
        globalData[k.substr(1)] = data[k]
      } else {
        pageData[k] = data[k]
      }
    })

    return {
      globalData,
      pageData: pageData || {}
    }
  }
}

function assign (oldData, newData) {
  Object.keys(newData).forEach(k => {
    if (isObject(newData[k]) && oldData[k] && isObject(oldData[k])) {
      assign(oldData[k], newData[k])
      let obj = JSON.parse(JSON.stringify({
        [k]: oldData[k]
      }))
      Object.assign(oldData, obj)
    } else {
      oldData[k] = newData[k]
    }
  })
}

function setProto (oldObj, newObj) {
  Object.keys(newObj).forEach(key => {
    if (!oldObj[key]) {
      oldObj[key] = JSON.parse(JSON.stringify(newObj[key]))
    }
  })
}

function isSelfParent (win) {
  let page = win.MIP.viewer.page
  return page.isRootPage || page.isCrossOrigin
}

function getGlobalData (win) {
  return isSelfParent(win) ? win.g : win.parent.g
}

export default Bind
