/**
 * @file client-prerender.js 在浏览器端预渲染
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import util from './util'

let parsePrender = ele => {
  let prerender = ele.getAttribute('prerender')

  return prerender != null && prerender !== 'false'
}

let resetPrerenderHash = () => {
  let win = window
  let loc = win.location
  let hash = loc.hash.replace(/prerender=1&?/, '')
  win.history.replaceState(
    '', document.title,
    loc.pathname + loc.search + hash
  )
}

export default class ClientPrerender {
  constructor () {
    // 预渲染环境标记
    this.prerender = false

    // 延迟执行的的函数队列
    this.queue = []

    if (util.hash.get('prerender') === '1') {
      this.prerender = true
      new Promise(resolve => {
        let pageActivedCallback = e => {
          if (e.data === 'pageActive') {
            this.prerender = false
            resetPrerenderHash()
            window.removeEventListener('message', pageActivedCallback)
            resolve()
          }
        }
        window.addEventListener('message', pageActivedCallback)
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
