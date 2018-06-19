/* global fetch */
/* global MIP */
/* global mipDataPromises */

import CustomElement from '../../custom-element'

class MipData extends CustomElement {
  build () {
    let src = this.element.getAttribute('src')
    let ele = this.element.querySelector('script[type="application/json"]')

    if (src) {
      this.getData(src)
    } else if (ele) {
      let data = ele.textContent.toString()
      let result
      try {
        result = JSON.parse(data)
      } catch (e) {
        console.error(e)
      }
      if (result) {
        MIP.$set(result)
      }
    }
  }

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

  prerenderAllowed () {
    return true
  }
}

export default MipData
