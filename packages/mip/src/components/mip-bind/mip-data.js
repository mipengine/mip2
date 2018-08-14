/**
 * @file customeELement mip-data
 * @author qiusiqi (qiusiqi@baidu.com)
 */

/* global fetch */
/* global MIP */
/* global mipDataPromises */

import CustomElement from '../../custom-element'
import jsonParse from '../../util/json-parse'

function dropPromise (promiseArr, target) {
  for (let i = 0; i < promiseArr.length; i++) {
    if (promiseArr[i] === target) {
      promiseArr.splice(i, 1)
    }
  }
}

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

    let stuckResolve
    let stuckReject
    // only resolve/reject when sth truly comes to a result
    // such as only to resolve when res.json() done
    let stuckPromise = new Promise(function (resolve, reject) {
      stuckResolve = resolve
      stuckReject = reject
    })
    mipDataPromises.push(stuckPromise)

    fetch(url, {credentials: 'include'})
      .then(res => {
        if (res.ok) {
          res.json().then(data => {
            MIP.$set(data)
            stuckResolve()
            stuckResolve = null
            dropPromise(mipDataPromises, stuckPromise)
          })
        } else {
          console.error('Fetch request failed!')
          stuckReject()
          stuckReject = null
          dropPromise(mipDataPromises, stuckPromise)
        }
      })
      .catch(e => {
        console.error(e)
        stuckReject()
        stuckReject = null
        dropPromise(mipDataPromises, stuckPromise)
      })
  }

  /* istanbul ignore next  */
  prerenderAllowed () {
    return true
  }
}

export default MipData
