/**
 * @file client-prerender.js 在浏览器端预渲染
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import util from './util'
import Messager from './messager'
import performance from './performance'

let parsePrerender = ele => {
  if (!ele || !ele.getAttribute) {
    return false
  }

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

class ClientPrerender {
  constructor () {
    // 预渲染环境标记
    this.prerender = false

    // 延迟执行的的函数队列
    this.queue = []

    this.messager = new Messager()

    if (util.hash.get('prerender') === '1') {
      this.prerender = true
      new Promise(resolve => {
        // set client prerender event
        this.messager.on('page-active', () => {
          this.prerender = false
          resetPrerenderHash()
          resolve()
        })
        // can interact with container
        this.messager.sendMessage('prerender-interactive', {
          time: Date.now()
        })
      }).then(() => {
        performance.recordTiming('MIPElementBuildStart')
        let fn
        while ((fn = this.queue.shift())) {
          fn()
        }
      }).then(() => {
        performance.recordTiming('MIPElementBuildEnd')
      })
    }
  }

  execute (fn, ele) {
    if (this.prerender && !parsePrerender(ele)) {
      this.queue.push(fn)
    } else {
      fn()
    }
  }
}

export default new ClientPrerender()
