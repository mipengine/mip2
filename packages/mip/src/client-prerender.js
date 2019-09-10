/**
 * @file client-prerender.js 在浏览器端预渲染
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import {getRootName} from './util/fn'
import hash from './util/hash'
import Messager from './messager'
import performance from './performance'
import {
  MESSAGE_PAGE_ACTIVE,
  MESSAGE_PRERENDER_INTERACTIVE
} from './page/const/index'

let parsePrerender = ele => {
  if (!ele || !ele.getAttribute) {
    return false
  }

  let prerender = ele.getAttribute('prerender')
  let isFirstScreenElement = ele.getAttribute('firstscreen')
  return isFirstScreenElement != null || (prerender != null && prerender !== 'false')
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
    // 预渲染环境标记, 是否是预渲染状态
    this.isPrerendering = false

    // 是否执行过预渲染
    this.isPrerendered = false

    // 延迟执行的的函数队列
    this.queue = []

    this.messager = new Messager({
      name: getRootName(window.name)
    })

    if (hash.get('prerender') === '1') {
      this.isPrerendering = true
      new Promise(resolve => {
        // set client prerender event
        this.messager.on(MESSAGE_PAGE_ACTIVE, () => {
          this.isPrerendering = false
          resetPrerenderHash()
          resolve()
        })
        // can interact with container
        this.messager.sendMessage(MESSAGE_PRERENDER_INTERACTIVE, {
          time: Date.now()
        })
      }).then(() => {
        this.isPrerendered = true
        performance.recordTiming('MIPPageShow')
        performance.lockFirstScreen()
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

  getPrerenderState () {
    return {
      prerendering: this.isPrerendering,
      prerendered: this.isPrerendered
    }
  }

  execute (fn, ele) {
    if (this.isPrerendering && !parsePrerender(ele)) {
      this.queue.push(fn)
    } else {
      fn()
    }
  }
}

export default new ClientPrerender()
