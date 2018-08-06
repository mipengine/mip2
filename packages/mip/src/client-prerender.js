/**
 * @file client-prerender.js 在浏览器端预渲染
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import util from './util'

let parsePrender = ele => {
  let prerender = ele.getAttribute('prerender')

  if (prerender === '' || prerender === 'true' || prerender === 'prerender') {
    return true
  } else {
    return false
  }
}

class ClientPrerender {
  constructor () {
    // 预渲染环境标记
    this.prerender = false

    // 延迟执行的的函数队列
    this.queue = []

    if (util.hash.get('prerender') === '1') {
      this.prerender = true

      new Promise(resolve => {
        window.addEventListener('hashchange', e => {
          util.hash.refreshHashTree()
          if (!util.hash.get('prerender')) {
            this.prerender = false
            resolve()
          }
        })
      }).then(() => {
        let fn
        while ((fn = this.queue.shift())) {
          fn()
        }
      })
    }
  }

  execute (fn, ele) {
    if (this.prerender && !parsePrender(ele)) {
      this.queue.push(fn)
    } else {
      fn()
    }
  }
}

export default new ClientPrerender()
