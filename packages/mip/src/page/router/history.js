import {START, normalizeLocation} from '../util/route'
import {pushState, replaceState} from '../util/push-state'
import {getLocation} from '../util/path'
import platform from '../../util/platform'

export default class HTML5History {
  constructor (router) {
    this.router = router

    // start with a route object that stands for "nowhere"
    this.current = START

    // route changed callback
    this.cb = null

    const initLocation = getLocation()
    window.addEventListener('popstate', e => {
      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      const location = getLocation()
      /* istanbul ignore next */
      if (this.current === START && location === initLocation) {
        return
      }

      this.transitionTo(location)
    })
  }

  listen (cb) {
    this.cb = cb
  }

  go (n) {
    window.history.go(n)
  }

  push (location) {
    this.transitionTo(location, route => {
      /* istanbul ignore next */
      pushState(route.fullPath)
    })
  }

  replace (location) {
    this.transitionTo(location, route => {
      /* istanbul ignore next */
      replaceState(route.fullPath)
    })
  }

  getCurrentLocation () {
    return getLocation()
  }

  transitionTo (location, onComplete) {
    const route = normalizeLocation(location, this.current)
    /* istanbul ignore next */
    if (platform.isAndroid() && (platform.isQQ() || platform.isQQApp())) {
      onComplete && onComplete(route)
      this.updateRoute(route)
    } else {
      this.updateRoute(route)
      onComplete && onComplete(route)
    }
  }

  updateRoute (route) {
    const prev = this.current
    this.current = route
    this.cb && this.cb(prev, route)
  }
}
