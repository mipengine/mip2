import HTML5History from './history'
import {OUTER_MESSAGE_HISTORY_NAVIGATE} from '../const/index'

export default class Router {
  constructor (options = {}) {
    this.options = options
    this.history = new HTML5History(this)
  }

  init () {
    const history = this.history

    let currentLocation = history.getCurrentLocation()
    history.transitionTo(currentLocation)
  }

  listen (cb) {
    this.history.listen(cb)
  }

  push (location) {
    if (!window.MIP.standalone) {
      this.history.replace(location)
    } else {
      this.history.push(location)
    }
  }

  replace (location) {
    this.history.replace(location)
  }

  go (n) {
    if (window.MIP.standalone) {
      this.history.go(n)
    } else {
      // SF can help to navigate by 'changeState' when standalone = false
      window.MIP.viewer.sendMessage(OUTER_MESSAGE_HISTORY_NAVIGATE, {step: n})
    }
  }

  back () {
    this.go(-1)
  }

  forward () {
    this.go(1)
  }
}
