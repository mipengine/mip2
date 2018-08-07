/**
 * @file deps.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

// Record watcher id, avoid add repeatly
let uid = 0

class Deps {
  constructor () {
    this.isDep = true
    this.subs = []
    this.id = uid++
  }

  addWatcher () {
    Deps.target.addWatcher(this)
  }

  notify (key) {
    this.subs.forEach(function (sub) {
      if (sub.specWatcher === 'Watch' && sub.exp.match(new RegExp(`.?${key}\\[?\\d*\\]?$`))) {
        sub.update()
      } else if (sub.specWatcher !== 'Watch') {
        sub.update()
      }
    })
  }
}

export default Deps
