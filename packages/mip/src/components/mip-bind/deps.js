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
      if (sub._specWatcher && sub._exp.match(key)) {
        sub.update()
      } else if (sub._exp.match(new RegExp(`.${key}$`)) || sub._exp === key) {
        sub.update()
      }
    })
  }

  update (watcher) {
    watcher && watcher.update && watcher.update()
  }
}

export default Deps
