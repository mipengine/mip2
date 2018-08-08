/**
 * @file customeELement mip-data
 * @author qiusiqi (qiusiqi@baidu.com)
 */

/* global fetch */
/* global MIP */
/* global mipDataPromises */

import CustomElement from '../../custom-element'
import jsonParse from '../../util/json-parse'

class MipData extends CustomElement {
  build () {
    let src = this.element.getAttribute('src')
    let ele = this.element.querySelector('script[type="application/json"]')

    /* istanbul ignore if */
    if (src) {
      this.getData(src)
    } else if (ele) {
      let data = ele.textContent.toString()
      if (data) {
        MIP.$set(jsonParse(data))
      }
    }
  }

  /*
   * get initial data asynchronouslly
   */
  /* istanbul ignore next */
  getData (url) {
    if (!url) {
      return
    }

    let promise = fetch(url, {
      credentials: 'include'
    })

    mipDataPromises.push(promise)

    promise
      .then(res => {
        if (res.ok) {
          res.json().then(data => MIP.$set(data))
        } else {
          console.error('Fetch request failed!')
        }
      })
      .catch(console.error)
      .finally(() => {
        for (let i = 0; i < mipDataPromises.length; i++) {
          if (mipDataPromises[i] === promise) {
            mipDataPromises.splice(i, 1)
          }
        }
      })
  }

  /* istanbul ignore next  */
  prerenderAllowed () {
    return true
  }
}

export default MipData
