/**
 * @file bind.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import Compile from './compile'
import Observer from './observer'
import Watcher, {locker} from './watcher'
import {isObject, objNotEmpty} from './util'

/* global MIP */
/* eslint-disable no-new-func */

class Bind {
  constructor () {
    this.win = window
    this.watcherIds = []
    this.win.pgStates = new Set()
    // require mip data extension runtime
    this.compile = new Compile()
    this.observer = new Observer()
    MIP.$set = (data, cancel) => this.bindTarget(true, data, cancel)
    MIP.setData = data => {
      this.bindTarget(false, data)
    }
    MIP.getData = key => {
      let ks = key.split('.')
      let res = this.win.m[ks[0]]
      let i = 1
      while (isObject(res) && i < ks.length) {
        res = res[ks[i]]
        i++
      }
      return res
    }
    MIP.$recompile = () => {
      this.observer.start(this.win.m)
      this.compile.start(this.win.m)
    }
    MIP.$update = (data, pageId) => {
      this.update(data, pageId)
    }
    MIP.watch = (target, cb) => {
      this.bindWatch(target, cb)
    }

    window.m = window.m || {}
    window.mipDataPromises = window.mipDataPromises || []
    MIP.$set(window.m)
  }

  postMessage (data) {
    Object.keys(data).forEach(k => {
      data[`#${k}`] = data[k]
      delete data[k]
    })

    let win = this.win
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
  update (data, pageId) {
    let win = this.win

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

  bindTarget (compile, data, cancel) {
    let win = this.win

    if (typeof data === 'object') {
      let origin = JSON.stringify(win.m)
      this.compile.upadteData(JSON.parse(origin))
      let classified = this.normalize(data)
      if (compile) {
        this.setGlobalState(classified.globalData, cancel)
        this.setPageState(classified, cancel)
        this.observer.start(win.m)
        this.compile.start(win.m)
      } else {
        locker(true) // lock, don't call watchers immediatly
        if (classified.globalData && objNotEmpty(classified.globalData)) {
          !cancel && this.postMessage(classified.globalData)
        }
        data = classified.pageData
        Object.keys(data).forEach(field => {
          if (win.pgStates.has(field)) {
            assign(win.m, {
              [field]: data[field]
            })
          } else {
            this.dispatch(field, data[field], cancel)
          }
        })
        locker(false) // unlock
      }
    } else {
      throw new Error('setData method MUST accept an object! Check your input:' + data)
    }
  }

  bindWatch (target, cb) {
    if (target.constructor === Array) {
      target.forEach(key => this.bindWatch(key, cb))
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
    if (!JSON.stringify(this.win.m).match(new RegExp(reg))) {
      return
    }

    let watcherId = `${target}${cb.toString()}`.replace(/[\n\t\s]/g, '')
    /* istanbul ignore if */
    if (this.watcherIds.indexOf(watcherId) !== -1) {
      return
    }

    this.watcherIds.push(watcherId)
    new Watcher(null, this.win.m, '', `Watch:${target}`, cb) // eslint-disable-line no-new
  }

  dispatch (key, val, cancel) {
    let win = this.win
    let data = {
      [key]: val
    }
    if (win.g && win.g.hasOwnProperty(key)) {
      !cancel && this.postMessage(data)
    } else {
      /* istanbul ignore if */
      if (!isSelfParent(win) &&
      /* istanbul ignore next */ win.parent.g &&
      /* istanbul ignore next */ win.parent.g.hasOwnProperty(key)
      ) {
        !cancel && this.postMessage(data)
      } else {
        Object.assign(win.m, data)
      }
    }
  }

  setGlobalState (data, cancel) {
    let win = this.win
    /* istanbul ignore else */
    if (isSelfParent(win)) {
      win.g = win.g || {}
      assign(win.g, data)
    } else {
      !cancel && objNotEmpty(data) && this.postMessage(data)
    }
  }

  setPageState (data, cancel) {
    let win = this.win
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

  normalize (data) {
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
