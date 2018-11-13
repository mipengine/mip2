import Services from './services'

export class Timer {
  /**
   * @param {!Window} win
   */
  constructor (win) {
    /**
     * @type {!Window}
     * @private
     * @const
     */
    this.win = win

    /**
     * @type {!Promise<void>}
     * @private
     * @const
     */
    this.resolved = win.Promise.resolve()

    /**
     * @type {number}
     * @private
     */
    this.timeoutId = 0

    /**
     * @type {!Object}
     * @private
     */
    this.canceled = {}

    /**
     * @type {number}
     * @private
     * @const
     */
    this.startTime = Date.now()
  }

  /**
   * Returns time since start in millionseconds.
   *
   * @returns {number}
   */
  timeSinceStart () {
    return Date.now() - this.startTime
  }

  /**
   * Executes non-delay callback in microtask queue. Returns a promise.
   *
   * @template T typeof return value from callback.
   * @param {function():T} callback function to be executed in microtask queue.
   * @returns {Promise<T>}
   */
  then (callback) {
    return this.resolved.then(callback)
  }

  /**
   * Executes non-delay callback in microtask queue. Returns a `timeoutId` for cancellation.
   *
   * @param {Function} callback function to be executed in microtask queue.
   * @returns {string}
   */
  cancelableThen (callback) {
    this.timeoutId++

    this.resolved.then(() => {
      if (this.canceled[this.timeoutId]) {
        delete this.canceled[this.timeoutId]

        return
      }
      callback()
    })

    /**
     * Returns a string to distinguish from `setTimeout`.
     */
    return '' + this.timeoutId
  }

  /**
   * Executes callback after specified milliseconds.
   *
   * @param {Function} callback function to be executed after the timer expires.
   * @param {number=} ms delay milliseconds.
   * @returns {number}
   */
  delay (callback, ms) {
    return this.win.setTimeout(callback, ms)
  }

  /**
   * Cancels a specified `delay` or `cancelableThen` callback.
   *
   * @param {string | number} timeoutId returns from `delay` or `cancelableThen`.
   */
  cancel (timeoutId) {
    if (typeof timeoutId === 'string') {
      this.canceled[timeoutId] = true

      return
    }
    this.win.clearTimeout(timeoutId)
  }

  /**
   * Returns a promise that will resolve after specified milliseconds.
   *
   * @param {number} ms delay milliseconds.
   * @returns {Promise<void>}
   */
  sleep (ms) {
    return new this.win.Promise(resolve => this.delay(resolve, ms))
  }

  /**
   * Returns a promise that will reject after specified milliseconds.
   * If there's a racing promise, it will depend on whichever is faster.
   *
   * @template T typeof resolved value of racing promise.
   * @param {number} ms delay milliseconds.
   * @param {?Promise<T>=} racing promise.
   * @param {string=} message will be thrown after time expires.
   * @returns {!Promise<T | void>}
   */
  timeout (ms, racing, message = 'timeout') {
    let timeoutId
    const delaying = new this.win.Promise((resolve, reject) => {
      timeoutId = this.delay(() => reject(new Error(message)), ms)
    })

    if (!racing) {
      return delaying
    }

    const cancel = () => this.cancel(timeoutId)

    racing.then(cancel, cancel)

    return this.win.Promise.race([delaying, racing])
  }

  /**
   * Returns a promise that will resolve when `predicate()` returns `true`.
   * Polls `predicate` with `timeout` delay.
   *
   * @param {function():boolean} predicate function.
   * @param {number} ms delay millionseconds.
   * @returns {Promise<void>}
   */
  poll (predicate, ms) {
    return new this.win.Promise(resolve => {
      const intervalId = this.win.setInterval(() => {
        if (!predicate()) {
          return
        }

        this.win.clearInterval(intervalId)
        resolve()
      }, ms)
    })
  }
}

/**
 * @param {!Window} win
 */
export function installTimerService (win) {
  Services.registerService(win, 'timer', Timer)
}
