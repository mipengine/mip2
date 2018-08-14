/**
 * @file bind.js
 * @author qiusiqi (qiusiqi@baidu.com)
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
    // save and check watcher defined by MIP.watch
    this.watcherIds = []
    // save local states of page
    this.win.pgStates = new Set()
    // require mip data extension runtime
    this.compile = new Compile()
    this.observer = new Observer()
    // open APIs
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
    MIP.watch = (target, cb) => {
      this.bindWatch(target, cb)
    }
    // inner APIs - isolated by sandbox, not available to developers
    MIP.$set = (data, cancel) => this.bindTarget(true, data, cancel)
    MIP.$recompile = () => {
      this.observer.start(this.win.m)
      this.compile.start(this.win.m)
    }
    MIP.$update = (data, pageId) => {
      this.update(data, pageId)
    }

    window.m = window.m || {}
    // store for async mip-data(s)
    window.mipDataPromises = window.mipDataPromises || []
    // initialize
    MIP.$set(window.m)
  }

  /*
   * fake postmessage - to broadcast global-data-changes to other iframes
   * @param {Object} data data
   */
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

  /*
   * to broadcast global data diff to mip iframes under rootpage
   * @param {Object} data data to be set
   * @param {string} pageId pageId to avoid repeated setting
   */
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

  /*
   * to set data
   * @param {boolean} compile should-compile
   * @param {Object} data data to be set
   * @param {boolean} cancel should stop data-broadcasting
   */
  bindTarget (compile, data, cancel) {
    let win = this.win

    if (typeof data === 'object') {
      let origin = JSON.stringify(win.m)
      this.compile.updateData(JSON.parse(origin))
      let classified = this.normalize(data)
      // need compile - $set
      if (compile) {
        this.setGlobalState(classified.globalData, cancel)
        this.setPageState(classified, cancel)
        // defineProperty and set dependency hooks
        this.observer.start(win.m)
        // compile and bind
        this.compile.start(win.m)
      } else {
        locker(true) // lock, don't call watchers immediatly
        // set/update data directly - setData
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

  /*
   * set watcher
   * @param {string|Array} target target(s) needed to be watched
   * @param {Function} cb callback triggered when target changed
   */
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

  /*
   * dispatch globaldata
   * @param {string} key key
   * @param {*} val value
   * @param {boolean} cancel should stop data-broadcasting
   */
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

  /*
   * set global data that shared around pages
   * @param {Object} data data
   * @param {boolean} cancel should stop data-broadcasting
   */
  setGlobalState (data, cancel) {
    let win = this.win
    // only set global data under rootpage
    /* istanbul ignore else */
    if (isSelfParent(win)) {
      win.g = win.g || {}
      assign(win.g, data)
    } else {
      !cancel && objNotEmpty(data) && this.postMessage(data)
    }
  }

  /*
   * set page data that used only under this page
   * @param {Object} data data
   * @param {boolean} cancel should stop data-broadcasting
   */
  setPageState (data, cancel) {
    let win = this.win
    Object.assign(win.m, data.pageData)
    // record props of pageData
    !cancel && Object.keys(data.pageData).forEach(k => win.pgStates.add(k))

    let globalData = data.globalData
    // update props from globalData
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

    // inherit
    setProto(win.m, getGlobalData(win))
    // win.m.__proto__ = getGlobalData(win) // eslint-disable-line no-proto
  }

  /*
   * normalize data if there is global data
   * @param {Object} data data
   */
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

/*
 * deep assign
 * @param {Object} oldData oldData
 * @param {Object} newData newData
 */
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
/*
 * data inherit
 * @param {Object} oldObj oldObj
 * @param {Object} newObj newObj
 */
function setProto (oldObj, newObj) {
  Object.keys(newObj).forEach(key => {
    if (!oldObj[key]) {
      oldObj[key] = JSON.parse(JSON.stringify(newObj[key]))
    }
  })
}
/*
 * Tell if the page is rootPage - crossOrigin page is rootpage too
 * @param {Object} win window
 */
function isSelfParent (win) {
  let page = win.MIP.viewer.page
  return page.isRootPage || /* istanbul ignore next */ page.isCrossOrigin
}
/*
 * get the unique global data stored under rootpage
 * @param {Object} win window
 */
function getGlobalData (win) {
  return isSelfParent(win) ? win.g : /* istanbul ignore next */ win.parent.g
}

export default Bind
