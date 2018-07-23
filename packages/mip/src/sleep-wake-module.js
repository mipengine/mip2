/**
 * @file skeepWakeModule
 * @author sekiyika(pengxing@baidu.com)
 */

/**
 * The mip viewer.Complement native viewer, and solve the page-level problems.
 *
 * @class
 */
class SleepWakeModule {
  constructor () {
    this._domObj = {}
    this._isAlreadyWake = {}
  }

  /**
   * The initialise method of sleepWakeModule
   */
  init () {
    let confCon = ''
    try {
      let moduleConf = document.querySelector('#mip-sleep-wake-module')
      confCon = JSON.parse(moduleConf.textContent)
    } catch (e) {
      return
    }
    if (!confCon) {
      return
    }
    this._initConf('||', confCon)
    // init
    for (let key in confCon) {
      this._stateChange(key, true)
    }
  }

  /**
   * init page conf.
   *
   * @param {string} split spliter
   * @param {Object} confContent config
   */
  _initConf (split, confContent) {
    // default value
    split = split || '||'
    for (let key in confContent) {
      let val = confContent[key]
      let valList = val.split(split)
      let len = valList.length
      this._domObj[key] = []
      for (let i = 0; i < len; i++) {
        try {
          let idx = i
          let sleepDom = document.querySelector(valList[i])
          let domInfo = {
            par: sleepDom.parentNode,
            cln: 'mip-sleep-wake-textarea-' + key + '-' + idx
          }
          sleepDom.setAttribute('data-cln', domInfo.cln)
          this._domObj[key].push(domInfo)
        } catch (e) {
          continue
        }
      }
    }
  }

  /**
   * wake the doms which are sleeped in conf by key
   *
   * @param {string} key key
   */
  wake (key) {
    this._stateChange(key)
    this._close(key)
  }

  /**
   * reset the stutas of doms by the key
   *
   * @param {string} key key
   */
  reset (key) {
    this._isAlreadyWake[key] = 0
  }

  /**
   * close the operation of doms by the key
   *
   * @param {string} key key
   */
  _close (key) {
    this._isAlreadyWake[key] = 1
  }

  /**
   * change the status of doms by paras[key, isSleep]
   *
   * @param {string} key key
   * @param {boolean} isSleep isSleep
   */
  _stateChange (key, isSleep) {
    if (!key) {
      return
    }
    let domList = this._domObj[key]
    if (!domList) {
      return
    }
    let len = domList.length
    if (len < 1) {
      return
    }
    for (let i = 0; i < len; i++) {
      let sleepDom = domList[i]
      if (isSleep && !this._isAlreadyWake[key]) {
        let self = (sleepDom.par && sleepDom.cln)
          ? sleepDom.par.querySelector('[data-cln=' + sleepDom.cln + ']')
          : null
        // let parent = sleepDom.par;
        let tmpTextArea = document.createElement('textarea')
        // let idx = i;
        if (self && self.tagName.toLowerCase() === ('textarea')) {
          continue
        }
        if (!self) {
          continue
        }
        tmpTextArea.textContent = self.outerHTML
        tmpTextArea.style.display = 'none'
        tmpTextArea.setAttribute('data-cln', sleepDom.cln)

        self.outerHTML = tmpTextArea.outerHTML
      }
      if (!isSleep && !this._isAlreadyWake[key]) {
        let par = sleepDom.par
        if (par) {
          let tmpdom = par.querySelector('[data-cln=' + sleepDom.cln + ']')
          if (tmpdom && tmpdom.tagName.toLowerCase() === ('textarea')) {
            tmpdom.outerHTML = tmpdom.textContent
          }
        }
      }
    }
  }
}

export default new SleepWakeModule()
