/**
 * @file nextTick
 * @author vue.js
 * @description https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js
 */
import platform from './platform'
import {noop} from './fn'

let callbacks = []
const p = Promise.resolve()
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice()
  callbacks.length = 0
  for (let callback of copies) {
    callback()
  }
}


function timerFunc () {
  p.then(flushCallbacks)
  platform.isIOS && setTimeout(noop)
}

export function nextTick (callback) {
  callbacks.push(() => {
    try {
      callback()
    } catch (e) {
      /* istanbul ignore next */
      console.error(e)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
}

// export default nextTick

