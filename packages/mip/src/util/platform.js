/**
 * @file Platform Function. Support identification system, engine, browser type
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict'

/* globals top */

/**
 * Platform class
 *
 * @class
 */
class Platform {
  constructor () {
    // system
    // deprecated
    this.isIos = false
    this.isIOS = false
    this.isAndroid = false
    // browser
    this.isWechatApp = false
    this.isBaiduApp = false
    this.isWeiboApp = false
    this.isQQApp = false
    this.isUc = false
    this.isBaidu = false
    this.isQQ = false
    this.isAdr = false
    this.isSafari = false
    this.isChrome = false
    // deprecated
    this.isFireFox = false
    this.isFirefox = false
    // engine
    this.isTrident = false
    this.isGecko = false
    this.isWebkit = false

    this.start()
  }

  /**
   * Judge system, iOS, android
   */
  _matchOs () {
    if (/iPhone|iPad|iPod/i.test(this._ua())) {
      this.isIos = true
      this.isIOS = true
    } else if (/Android/i.test(this._ua())) {
      this.isAndroid = true
    }
  }

  /**
   * Judge browser type
   */
  _matchBrowser () {
    let uaArray = this._ua().split('Mobile')
    let apps = uaArray && uaArray.length > 1 ? uaArray[1] : null

    if (/\bmicromessenger\/([\d.]+)/i.test(apps)) {
      this.isWechatApp = true
    } else if (/baiduboxapp/i.test(apps)) {
      this.isBaiduApp = true
    } else if (/weibo/i.test(apps)) {
      this.isWeiboApp = true
    } else if (/\sQQ/i.test(apps)) {
      this.isQQApp = true
    } else if (/UCBrowser/i.test(this._ua())) {
      this.isUc = true
    } else if (/baidubrowser/i.test(this._ua())) {
      this.isBaidu = true
    } else if (/qqbrowser\/([0-9.]+)/i.test(this._ua())) {
      this.isQQ = true
    } else if (
      !/android/i.test(this._ua()) &&
            /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//i.test(this._ua())
    ) {
      this.isSafari = true
    } else if (
      /(?:Chrome|CrMo|CriOS)\/([0-9]{1,2}\.[0-9]\.[0-9]{3,4}\.[0-9]+)/i.test(this._ua()) &&
            !/samsung/i.test(this._ua())
    ) {
      this.isChrome = true
    } else if (/(firefox|FxiOS+)\/([0-9.ab]+)/i.test(this._ua())) {
      this.isFireFox = true
      this.isFirefox = true
    } else if (
      /android/i.test(this._ua()) &&
            /Android[\s_\-/i686]?[\s_\-/](\d+[.\-_]\d+[.\-_]?\d*)/i.test(this._ua())
    ) {
      this.isAdr = true
    }
  }

  /**
   * Judge browser engine type
   */
  _matchEngine () {
    if (/\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/i.test(this._ua())) {
      this.isTrident = true
    } else if (/\brv:([\d\w.]+).*\bgecko\/(\d+)/i.test(this._ua())) {
      this.isGecko = true
    } else if (/\bapplewebkit[/]?([0-9.+]+)/i.test(this._ua())) {
      this.isWebkit = true
    }
  }

  /**
   * get OS version
   *
   * @return {string}
   */
  getOsVersion () {
    let osVersion
    let result
    if (this.isAndroid()) {
      result = /Android ([._\d]+)/.exec(this._ua()) || /Android\/([\d.]+)/.exec(this._ua())
      if (result && result.length > 1) {
        osVersion = result[1]
      }
    } else if (this.isIOS()) {
      result = /OS (\d+)_(\d+)_?(\d+)?/.exec(this._appVersion())
      if (result && result.length > 3) {
        osVersion = result[1] + '.' + result[2] + '.' + (result[3] | 0)
      }
    }
    return osVersion
  }

  /**
   * Wrap engine, browser, engine varible to function
   */
  _wrapFun () {
    let self = this
    for (let key in self) {
      if (self.hasOwnProperty(key) && typeof self[key] !== 'function') {
        let handle = function (key) {
          return key
        }.bind(null, self[key])
        self[key] = handle
      }
    }
    self.needSpecialScroll = self.isIOS() && window !== top
  }

  /**
   * Get user agent
   *
   * @return {string} user agent
   */
  _ua () {
    return navigator.userAgent
  }

  /**
   * Get app version
   *
   * @return {string} app version
   */
  _appVersion () {
    return navigator.appVersion
  }

  /**
   * Start match user agent
   *
   * @return {Object} self object
   */
  _start () {
    this._matchOs()
    this._matchBrowser()
    this._matchEngine()
    this._wrapFun()

    return this
  }

  /**
   * empty fn
   */
  start () {
    this._start()
  }
}

export default new Platform()
