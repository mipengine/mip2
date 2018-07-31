/**
 * @file customStorage Function. Support publiser management and localstorage
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict'

/* globals localStorage, fetch, top */

import fn from './fn'

/**
 * Type of storage
 *
 * @inner
 * @type {Object}
 */
let storageType = {
  LOCALSTORAGE: 0,
  ASYNCSTORAGE: 1,
  COOKIESTORAGE: 2
}

/**
 * Error code
 *
 * @inner
 * @type {Object}
 */
let eCode = {
  siteExceed: 21,
  lsExceed: 22
}

/**
 * When no support local storage, store data temporary
 *
 * @inner
 * @type {Object}
 */
let lsCache = {}

/**
 * Location href
 *
 * @inner
 * @type {string}
 */
let href = window.location.href

/**
 * Domain of website
 *
 * @inner
 * @type {string}
 */
let reg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g
let matchArr = href.match(reg)
const HOST = matchArr && matchArr.length > 1 ? matchArr[1] : ''

/**
 * Current domain storage size, max is 4k
 *
 * @const
 * @inner
 * @type {number}
 */
const STORAGESIZE = 4 * 1024

/**
 * Local Storage class
 *
 * @class
 */
class LocalStorage {
  /**
   * Whether support Local Storage
   *
   * @return {boolean} Whether support ls
   */
  _isCachePage () {
    return fn.isCacheUrl(href)
  }

  /**
   * Whether support Local Storage
   *
   * @return {boolean} Whether support ls
   */
  _supportLs () {
    let support = false
    try {
      window.localStorage.setItem('lsExisted', '1')
      window.localStorage.removeItem('lsExisted')
      support = true
    } catch (e) {
      support = false
    }
    return support
  }

  /**
   * Get local storage
   *
   * @return {Object} value of local storage
   */
  _getLocalStorage () {
    let ls = this._supportLs() ? localStorage.getItem(HOST) : lsCache[HOST]
    ls = ls ? parseJson(ls) : {}
    updateTime(ls)
    return ls
  }

  /**
   * Delete local storage
   *
   * @param {string} key the key of local storage
   */
  _rmLocalStorage (key) {
    if (!key) {
      key = HOST
    }
    this._supportLs() ? localStorage.removeItem(key) : fn.del(lsCache, key)
  }

  /**
   * Set current site data in local storage
   *
   * @param {string} name name of storage
   * @param {string} value value of storage
   * @param {string} expire optional
   * @param {string} callback if error callback to publisher
   */
  set (name, value, expire, callback) {
    if (!name || !value) {
      return
    }
    callback = typeof expire === 'function' ? expire : callback
    if (this._isCachePage()) {
      let ls = this._getLocalStorage()
      ls[name] = value
      expire = parseInt(expire, 10)
      if (!isNaN(expire) && expire > 0) {
        ls.e = new Date().getTime() + expire
      } else {
        fn.del(ls, 'e')
      }
      ls = JSON.stringify(ls)
      if (ls.length > STORAGESIZE) {
        callback && callback(getError(eCode.siteExceed, getErrorMess(eCode.siteExceed)))
        throw getErrorMess(eCode.siteExceed)
      }
      this._setLocalStorage(HOST, ls, expire, callback)
    } else {
      this._setLocalStorage(name, value, expire, callback)
    }
  }

  /**
   * Set local storage
   *
   * @param {string} key the key of local storage
   * @param {string} value the key of local storage
   * @param {string} expire the expire of local storage
   * @param {string} callback if error callback to publisher
   */
  _setLocalStorage (key, value, expire, callback) {
    let mess = getErrorMess(eCode.lsExceed, key)
    callback = typeof expire === 'function' ? expire : callback
    if (this._supportLs()) {
      try {
        localStorage.setItem(key, value)
      } catch (e) {
        if (this._isExceed(e) && this._isCachePage()) {
          this._exceedHandler(key, value, expire)
        } else if (this._isExceed(e) && !this._isCachePage()) {
          callback && callback(getError(eCode.lsExceed, mess))
          throw mess
        }
      }
    } else {
      let size = value.length / 1024.0 / 1024.0
      for (let k in lsCache) {
        if (lsCache[k]) {
          size += lsCache[k].length / 1024.0 / 1024.0
        }
      }
      if (size > 5.0) {
        callback && callback(eCode.lsExceed, mess)
        throw mess
      }
      lsCache[key] = value
    }
  }

  /**
   * Get current site data in local storage
   *
   * @param {string} name name of storage
   * @return {string} get data with key
   */
  get (name) {
    if (!fn.isString(name)) {
      return
    }

    let result
    if (this._isCachePage()) {
      let ls = this._getLocalStorage()
      if (ls && ls[name]) {
        result = ls[name]
      }
    } else {
      result = this._supportLs() ? localStorage.getItem(name) : lsCache[name]
    }
    return result
  }

  /**
   * Delete current site data in local storage with key
   *
   * @param {string} name name of storage
   */
  rm (name) {
    if (!fn.isString(name)) {
      return
    }

    if (this._isCachePage()) {
      let ls = this._getLocalStorage()
      if (ls && ls[name]) {
        fn.del(ls, name)
        this._setLocalStorage(HOST, JSON.stringify(ls))
      }
    } else {
      this._supportLs() ? localStorage.removeItem(name) : fn.del(lsCache, name)
    }
  }

  /**
   * Clear current site local storage
   *
   */
  clear () {
    if (this._isCachePage()) {
      this._rmLocalStorage()
    } else {
      this._supportLs() ? localStorage.clear() : lsCache = {}
    }
  }

  /**
   * Delete all expire storage, scope is all sites
   *
   * @return {boolean} whether storage has expired
   */
  rmExpires () {
    let hasExpires = false

    if (this._isCachePage()) {
      let ls = this._supportLs() ? localStorage : lsCache

      for (let k in ls) {
        if (ls[k]) {
          let val
          if (typeof ls[k] === 'string') {
            val = parseJson(ls[k])
          }
          if (val && val.e) {
            let expire = parseInt(parseJson(ls[k]).e, 10)
            if (expire && new Date().getTime() >= expire) {
              hasExpires = true
              this._rmLocalStorage(k)
            }
          }
        }
      }
    }
    return hasExpires
  }

  /**
   * Whether local storage is exceed, http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors
   *
   * @param {Object} e set local storage error
   * @return {boolean} whether storage exceed
   */
  _isExceed (e) {
    let quotaExceeded = false

    if (e && e.code) {
      switch (e.code) {
        case 22: {
          quotaExceeded = true
          break
        }
        case 1014: { // Firefox
          quotaExceeded = e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
          break
        }
      }
    } else if (e && e.number === -2147024882) { // Internet Explorer 8
      quotaExceeded = true
    }

    return quotaExceeded
  }

  /**
   * Handle when storage exceed
   *
   * @param {string} name the key of local storage
   * @param {string} value the key of local storage
   * @param {string} expire the expire of local storage
   */
  _exceedHandler (name, value, expire) {
    let minTimeStamp
    let key

    if (!this.rmExpires()) {
      let ls = localStorage
      for (let k in ls) {
        if (ls[k]) {
          let item = parseJson(ls[k]).u
          if (!key || parseInt(item, 10) < minTimeStamp) {
            key = k
            minTimeStamp = parseInt(item, 10)
          }
        }
      }
      this._rmLocalStorage(key)
    }
    this.set(name, value, expire)
  }
}

/**
 * Publisher manage storage, via request
 *
 * @class
 */
class AsyncStorage {
  /**
   * Send request to server with params
   *
   * @param {Object} opt request params
   */
  request (opt) {
    if (!opt || !opt.url) {
      return
    }

    let myInit = {}
    myInit.mode = opt.mode ? opt.mode : null
    myInit.method = opt.method ? opt.method : 'GET'
    myInit.credentials = opt.credentials ? opt.credentials : 'omit'
    myInit.cache = opt.cache ? opt.cache : 'default'
    if (opt.headers) {
      myInit.headers = opt.headers
    }
    if (opt.body) {
      myInit.body = opt.body
    }
    fetch(opt.url, myInit)
      .then(res => {
        if (res.ok) {
          res.text().then(data => opt.success && opt.success(parseJson(data)))
        } else {
          opt.error && opt.error(res)
        }
      })
      .catch(err => opt.error && opt.error(err))
  }
}

/**
 * Cookie storage
 *
 * @class
 */
class CookieStorage {
  /**
   * Delete exceed cookie storage
   *
   * @param {Object} opt request params
   */
  delExceedCookie () {
    // don't execute in origin page
    if (this._notIframed()) {
      return
    }

    let domain = window.location.hostname
    let cks = document.cookie
    let MINSIZE = 3 * 1024
    let MAXSIZE = 5 * 1024

    if (document.cookie.length < MAXSIZE) {
      return
    }

    let items = cks.split(';')
    for (let i = 0; i < items.length; i++) {
      let item = items[i].split('=')
      if (item && item.length > 1) {
        let expires = new Date()
        let key = item[0].trim()
        let value = item[1].trim()

        expires.setMilliseconds(expires.getMilliseconds() - 1 * 864e+5)
        this._set({
          key,
          value,
          expires,
          domain
        })
        if (this._get(key)) {
          this._set({
            key,
            value,
            expires,
            domain: domain.split('.').slice(-2).join('.')
          })
        }
      }
      if (document.cookie.length <= MINSIZE) {
        break
      }
    }
  }

  /**
   * Whether iframed or not
   *
   * @return {string} Whether iframed
   */
  _notIframed () {
    return window === top
  }

  /**
   * Get cookie
   *
   * @param {string} name cookie name
   * @return {string} cookie value
   */
  _get (name) {
    name = name.trim()

    let cks = document.cookie
    let cookies = cks ? cks.split(';') : []
    for (let i = 0, len = cookies.length; i < len; i++) {
      let cookie = cookies[i]
      let items = cookie.split('=')
      if (items[0].trim() === name) {
        return items[1]
      }
    }
  }

  /**
   * Set cookie
   *
   * @param {Object} options cookie option
   */
  _set (options) {
    document.cookie = [
      options.key,
      '=',
      '; expires=' + options.expires.toGMTString(),
      '; path=/',
      '; domain=' + options.domain
    ].join('')
  }
}

/**
 * Update local storage operation time
 *
 * @param {Object} storage it's local storage
 */
function updateTime (storage) {
  storage.u = new Date().getTime()
}

/**
 * Parse json link JSON.parse
 *
 * @param {string} str parse string
 * @return {string} parsed string
 */
function parseJson (str) {
  try {
    str = JSON.parse(str)
  } catch (e) {}
  return str
}

/**
 * Get error message with error code
 *
 * @param {string} code error code
 * @param {string} name error name
 * @return {string} error message
 */
function getErrorMess (code, name) {
  let mess
  switch (code) {
    case eCode.siteExceed:
      mess = 'storage space need less than 4k'
      break
    case eCode.lsExceed:
      mess = 'Uncaught DOMException: Failed to execute setItem on Storage: Setting the value of ' +
        name + ' exceeded the quota at ' + window.location.href
  }
  return mess
}

/**
 * Generate error object
 *
 * @param {string} code error code
 * @param {string} mess error name
 * @return {string} error object
 */
function getError (code, mess) {
  return {
    errCode: code,
    errMess: mess
  }
}

/**
 * Storage Class
 *
 * @param {number} type type of storage
 * @class
 */
function customStorage (type) {
  switch (type) {
    case storageType.ASYNCSTORAGE:
      return new AsyncStorage()
    case storageType.LOCALSTORAGE:
      return new LocalStorage()
    case storageType.COOKIESTORAGE:
      return new CookieStorage()
  }
}

export default customStorage
