/**
 * @file customeELement mip-data
 * @author qiusiqi (qiusiqi@baidu.com)
 */

/* global fetch */
/* global MIP */
/* global mipDataPromises */

import CustomElement from '../../custom-element'
import jsonParse from '../../util/json-parse'

/*
 * Remove promise from global mipDataPromises array
 * @param {Promise} target promise need to be removed
 */
function dropPromise (target) {
  let index = mipDataPromises.indexOf(target)
  mipDataPromises.splice(index, ~index ? 1 : 0)
}

class MipData extends CustomElement {
  build () {
    /* istanbul ignore if */
    if (this.element.getAttribute('src')) {
      this.getData(src)
    } else if (this.element.querySelector('script[type="application/json"]')) {
      let data = ele.textContent.toString()
      if (data) {
        MIP.$set(jsonParse(data))
      }
    }
  }

  /*
   * get initial data asynchronouslly
   */
  async getData (url) {
    let stuckResolve
    let stuckReject
    // only resolve/reject when sth truly comes to a result
    // such as only to resolve when res.json() done
    let stuckPromise = new Promise(function (resolve, reject) {
      stuckResolve = resolve
      stuckReject = reject
    })

    mipDataPromises.push(stuckPromise)

    try {
      let res = await fetch(url, {credentials: 'include'})
      if (!res.ok) {
        throw Error('Fetch request failed!')
      }

      let data = await res.json()
      MIP.$set(data)
      dropPromise(stuckPromise)
      stuckResolve()

    }
    catch (e) {
      console.error(e)
      dropPromise(stuckPromise)
      stuckReject()
    }
  }

  /* istanbul ignore next  */
  prerenderAllowed () {
    return true
  }
}

export default MipData
