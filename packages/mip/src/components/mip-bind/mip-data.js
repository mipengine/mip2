/* global fetch */
/* global MIP */

import CustomElement from '../../custom-element'

class MipData extends CustomElement {
  build () {
    let src = this.element.getAttribute('src')
    let ele = this.element.querySelector('script[type="application/json"]')
    window.mipDataPromises = window.mipDataPromises || []

    if (src) {
      window.mipDataPromises.push(this.getData(src))
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

    promise.then(res => {
      if (res.ok) {
        res.json().then(data => MIP.$set(data))
      } else {
        console.error('Fetch request failed!')
      }
    }).catch(console.error)

    return promise
  }

  prerenderAllowed () {
    return true
  }
}

export default MipData
