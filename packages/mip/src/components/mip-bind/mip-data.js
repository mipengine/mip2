/**
 * @file customeELement mip-data
 * @author qiusiqi (qiusiqi@baidu.com)
 */

/* global fetch */
/* global MIP */
/* global mipDataPromises */

import CustomElement from '../../custom-element'
import jsonParse from '../../util/json-parse'
import Deffered from '../../util/deferred'
import log from '../../util/log'

const logger = log('MIP-data')

class MIPData extends CustomElement {
  static get observedAttributes () {
    return ['src']
  }

  handleSrcChange() {
    this.fetch()
  }

  build () {
    this.addEventAction('refresh', () => {
      this.fetch()
    })

    if (this.props.src) {
      // get remote data
      this.fetch()
    } else {
      // get local data
      this.sync()
    }
  }

  sync () {
    let ele = this.element.querySelector('script[type="application/json"]')

    if (ele) {
      let data = ele.textContent.toString()
      if (data) {
        this.assign(jsonParse(data))
      }
    }
  }

  /*
   * get remote initial data asynchronouslly
   */
  async fetch () {
    let url = this.props.src

    if (!url) {
      return
    }
    let {promise, resolve, reject} = new Deffered()

    // only resolve/reject when sth truly comes to a result
    // such as only to resolve when res.json() done
    mipDataPromises.push(promise)
    let resolver = resolve

    try {
      let res = await fetch(url, {credentials: this.props.credentials})

      if (!res.ok) {
        throw Error(`Fetch request failed: ${url}`)
      }

      let data = await res.json()
      this.assign(data)
    } catch (e) {
      logger.error(e)
      resolver = reject
    }

    let index = mipDataPromises.indexOf(promise)
    if (index > -1) {
      mipDataPromises.splice(index, 1)
    }

    resolver()
  }

  assign (data) {
    let {id, scope} = this.props
    MIP.$set(id && scope ? {[id]: data} : data)
  }

  /* istanbul ignore next  */
  prerenderAllowed () {
    return true
  }
}

MIPData.props = {
  src: {
    type: String,
    default: ''
  },
  credentials: {
    type: String,
    default: 'omit'
  },
  id: {
    type: String,
    default: ''
  },
  scope: {
    type: Boolean,
    default: false
  }
}

export default MIPData
