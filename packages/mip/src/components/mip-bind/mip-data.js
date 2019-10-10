/**
 * @file customeELement mip-data
 * @author qiusiqi (qiusiqi@baidu.com)
 *         clark-t (clarktanglei@163.com)
 */

/* global fetch */
/* global MIP */
/* global mipDataPromises */

import CustomElement from '../../custom-element'
import jsonParse from '../../util/json-parse'
import Deffered from '../../util/deferred'
import log from '../../util/log'
import {timeout} from './util'

const logger = log('MIP-data')

class MIPData extends CustomElement {
  static get observedAttributes () {
    return ['src']
  }

  handleSrcChange () {
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

  /**
   * 同步数据源定义方式，写在 <mip-data> 标签中的 <script type="application/json">
   */
  sync () {
    let ele = this.element.querySelector('script[type="application/json"]')

    if (ele) {
      let data = ele.textContent.toString()
      if (data) {
        this.assign(jsonParse(data))
      }
    }
  }

  /**
   * 带超时和指定 credentials 的数据请求功能，要求后端返回的必须是 json
   *
   * @async
   * @param {string} url url
   * @return {Object} 远程数据
   */
  request (url) {
    let {credentials, timeout: time} = this.props
    return Promise.race([
      fetch(url, {credentials}),
      timeout(time)
    ]).then(res => {
      if (!res.ok) {
        throw Error(`Fetch request failed: ${url}`)
      }
      return res.json()
    })
  }

  /*
   * 异步请求远程数据
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
      let data = await this.request(url)
      this.assign(data)
    } catch (e) {
      logger.error(e)
      resolver = reject
      MIP.viewer.eventAction.execute('fetch-error', this.element, e)
    }

    let index = mipDataPromises.indexOf(promise)
    if (index > -1) {
      mipDataPromises.splice(index, 1)
    }

    resolver()
  }

  /**
   * 将 mip-data 初始化数据写入 MIP 数据仓库当中，并且通知重新遍历 binding 节点
   *
   * @param {Object} data 数据
   */
  assign (data) {
    let {id, scope} = this.props
    // @TODO deprecated
    // 为了兼容 MIP 旧版逻辑而加上的遍历，下一个大版本移除
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
  timeout: {
    type: Number,
    default: 5000
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
