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
    MIP.$set = (data, cancel) => this._bindTarget(true, data, cancel)
    MIP.setData = data => {
      this._bindTarget(false, data)
    }
    MIP.getData = key => {
      let ks = key.split('.')
      let res = this._win.m[ks[0]]
      let i = 1
      while (isObject(res) && i < ks.length) {
        res = res[ks[i]]
        i++
      }
      return res
    }
    MIP.$recompile = () => {
      this._observer.start(this._win.m)
      this._compile.start(this._win.m)
    }
    MIP.$update = (data, pageId) => {
      this._update(data, pageId)
    }
    MIP.watch = (target, cb) => {
      this._bindWatch(target, cb)
    }

    window.m = window.m || {}
    window.mipDataPromises = window.mipDataPromises || []
    MIP.$set(window.m)
  }

  _postMessage (data) {
    for (let k of Object.keys(data)) {
      data[`#${k}`] = data[k]
      delete data[k]
    }

    let win = this._win
    let targetWin = win
    /* istanbul ignore if */
    if (!isSelfParent(win)) {
      targetWin = win.parent
      // parent update
      targetWin.MIP.$set(data, true)
    }
    // self update
    win.MIP.$set(data, true)

    let pageId = win.location.href.replace(win.location.hash, '')
    // defer
    setTimeout(() => {
      targetWin.MIP.$update(data, pageId)
    }, 10)
  }

  /* istanbul ignore next */
  _update (data, pageId) {
    let win = this._win

    for (let i = 0, frames = win.document.getElementsByTagName('iframe'); i < frames.length; i++) {
      if (frames[i].classList.contains('mip-page__iframe') &&
          frames[i].getAttribute('data-page-id') &&
          pageId !== frames[i].getAttribute('data-page-id')
      ) {
        let subwin = frames[i].contentWindow
        subwin && subwin.MIP && subwin.MIP.$set(data, true)
      }
    }
  }

  _bindTarget (compile, data, cancel) {
    let win = this._win

    if (typeof data === 'object') {
      let origin = JSON.stringify(win.m)
      this._compile.upadteData(JSON.parse(origin))
      let classified = this._normalize(data)
      if (compile) {
        this._setGlobalState(classified.globalData, cancel)
        this._setPageState(classified, cancel)
        this._observer.start(win.m)
        this._compile.start(win.m)
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
            this._dispatch(field, data[field], cancel)
          }
        })
      }
    } else {
      throw new Error('setData method MUST accept an object! Check your input:' + data)
    }
  }

  _bindWatch (target, cb) {
    if (target.constructor === Array) {
      target.forEach(key => MIP.watch(key, cb))
      return
    }
    if (typeof target !== 'string' || !target) {
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
    /* istanbul ignore if */
    if (this._watcherIds.indexOf(watcherId) !== -1) {
      return
    }

    this._watcherIds.push(watcherId)
    new Watcher(null, this._win.m, '', `Watch:${target}`, cb) // eslint-disable-line no-new
  }

  _dispatch (key, val, cancel) {
    let win = this._win
    let data = {
      [key]: val
    }
    if (win.g && win.g.hasOwnProperty(key)) {
      !cancel && this._postMessage(data)
    } else {
      /* istanbul ignore if */
      if (!isSelfParent(win) &&
      /* istanbul ignore next */ win.parent.g &&
      /* istanbul ignore next */ win.parent.g.hasOwnProperty(key)
      ) {
        !cancel && this._postMessage(data)
      } else {
        Object.assign(win.m, data)
      }
    }
  }

  _setGlobalState (data, cancel) {
    let win = this._win
    /* istanbul ignore else */
    if (isSelfParent(win)) {
      win.g = win.g || {}
      assign(win.g, data)
    } else {
      !cancel && objNotEmpty(data) && this._postMessage(data)
    }
  }

  _setPageState (data, cancel) {
    let win = this._win
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
    // win.m.__proto__ = getGlobalData(win) // eslint-disable-line no-proto
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
      pageData
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
  return page.isRootPage || /* istanbul ignore next */ page.isCrossOrigin
}

function getGlobalData (win) {
  return isSelfParent(win) ? win.g : /* istanbul ignore next */ win.parent.g
}

export default Bind
