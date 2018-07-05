/**
 * @file custom element store
 * @author sekiyika(pengxing@baidu.com)
 */

/**
 * element store
 *
 * @type {Object}
 */
const store = {
  mip1: {},
  mip2: {}
}

export default {

  /**
   * get custom element class by name
   *
   * @param {string} name customElment name
   * @param {string=} type customElement type, mip1 or mip2
   * @return {MIPElement}
   */
  get (name, type) {
    name = name.toLowerCase()
    switch (type) {
      case 'mip1':
        return store.mip1[name]
      case 'mip2':
        return store.mip2[name]
      default:
        return store.mip2[name] || store.mip1[name] || undefined
    }
  },

  /**
   * store custom element name and clazz pair
   *
   * @param {string} name custom element name
   * @param {MIPElement} clazz custom element class
   * @param {string} type mip1 or mip2
   */
  set (name, clazz, type) {
    if (type !== 'mip2' && type !== 'mip1') {
      throw new Error(`type: ${type} must be mip1 or mip2`)
    }

    store[type][name.toLowerCase()] = clazz
  }
}
