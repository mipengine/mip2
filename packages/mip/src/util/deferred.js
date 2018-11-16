/**
 * Returns a Deferred struct, which holds a pending promise and its associated
 * resolve and reject functions.
 *
 * This is preferred instead of creating a Promise instance to extract the
 * resolve/reject functions yourself:
 *
 * ```
 * // Avoid doing
 * let resolve;
 * const promise = new Promise(res => {
 *   resolve = res;
 * });
 *
 * // Good
 * const deferred = new Deferred();
 * const {promise, resolve} = deferred;
 * ```
 *
 * @template T
 */
class Deferred {
  constructor () {
    /**
     * @type {Promise<T>}
     */
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

export default Deferred
