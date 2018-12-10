import Services from './services'
import {templates, Deferred, event} from '../util'
import registerMip1Element from '../mip1-polyfill/element'
import registerCustomElement from '../register-element'
import registerVueCustomElement from '../vue-custom-element'
import installMipComponentsPolyfill from 'deps/mip-components-webpack-helpers'

const {listen} = event

const UNKNOWN_EXTENSION_ID = 'unknown'

export class Extensions {
  /**
   * @param {!Window} win
   */
  constructor (win) {
    /**
     * @private
     * @const
     */
    this.win = win

    /**
     * @private
     * @const
     */
    this.doc = win.document

    /**
     * @type {!Object}
     * @private
     */
    this.extensions = {}

    /**
     * @type {?string}
     * @private
     */
    this.currentExtensionId = null

    /**
     * @private
     * @const
     */
    this.mipdoc = Services.mipdocFor(win)

    /**
     * @private
     * @const
     */
    this.timer = Services.timerFor(win)

    /**
     * Binds methods exposed to `MIP`.
     */
    this.installExtension = this.installExtension.bind(this)
    this.registerElement = this.registerElement.bind(this)
    this.registerService = this.registerService.bind(this)
    this.registerTemplate = this.registerTemplate.bind(this)
  }

  /**
   * Returns or creates extension holder for `extensionId`.
   *
   * @param {string} extensionId of extension.
   * @returns {!Object}
   * @private
   */
  getExtensionHolder (extensionId) {
    let holder = this.extensions[extensionId]

    if (!holder) {
      const extension = {
        elements: {},
        services: {}
      }

      holder = this.extensions[extensionId] = {
        extension,
        elementInstances: [],
        promise: null,
        resolve: null,
        reject: null,
        loaded: null,
        error: null
      }
    }

    return holder
  }

  /**
   * Returns holder for extension which is currently being registered.
   *
   * @returns {!Object}
   * @private
   */
  getCurrentExtensionHolder () {
    return this.getExtensionHolder(this.currentExtensionId || UNKNOWN_EXTENSION_ID)
  }

  /**
   * Returns or creates a promise waiting for extension loaded.
   *
   * @param {!Object} holder of extension.
   * @returns {!Promise<!Object>}
   * @private
   */
  waitFor (holder) {
    if (!holder.promise) {
      if (holder.loaded) {
        holder.promise = Promise.resolve(holder.extension)
      } else if (holder.error) {
        holder.promise = Promise.reject(holder.error)
      } else {
        const {promise, resolve, reject} = new Deferred()

        holder.promise = promise
        holder.resolve = resolve
        holder.reject = reject
      }
    }

    return holder.promise
  }

  /**
   * Returns or creates a promise waiting for extension loaded.
   *
   * @param {string} extensionId of extension.
   * @returns {!Promise<!Object>}
   */
  waitForExtension (extensionId) {
    return this.waitFor(this.getExtensionHolder(extensionId))
  }

  /**
   * Disables `extension.deps` temporarily.
   */
  /**
   * Preloads an extension as a dependency of others.
   *
   * @param {string} extensionId of extension.
   * @returns {!Promise<!Object>}
   */
  /*
  preloadExtension (extensionId) {
    return this.waitForExtension(extensionId)
  }
  /*

  /**
   * Loads dependencies before the extension itself.
   *
   * @param {!Extension} extension
   * @returns {!Promise<Object>}
   * @private
   */
  /*
  preloadDepsOf (extension) {
    if (Array.isArray(extension.deps)) {
      return Promise.all(extension.deps.map(dep => this.preloadExtension(dep)))
    }

    if (typeof extension.deps === 'string') {
      return this.preloadExtension(extension.deps)
    }

    return Promise.resolve()
  }
  */

  /**
   * Registers an extension in extension holder.
   * An extension factory may include multiple registration methods,
   * such as `registerElement`, `registerService` or `registerTemplate`.
   *
   * @param {string} extensionId of extension.
   * @param {!Function} factory of extension.
   * @param  {...Object} args passed to extension factory.
   * @private
   */
  registerExtension (extensionId, factory, ...args) {
    const holder = this.getExtensionHolder(extensionId)

    try {
      this.currentExtensionId = extensionId
      factory(...args)

      /**
       * It still possible that all element instances in current extension call lifecycle `build` synchronously.
       * Executes callback in microtask to make sure all these elements are built.
       */
      this.timer.then(() => this.tryToResolveExtension(holder))
    } catch (err) {
      this.tryToRejectError(holder, err)

      throw err
    } finally {
      this.currentExtensionId = null
    }
  }

  /**
   * To see if all elements registered in current extension are built.
   *
   * @param {!Object} holder of extension.
   * @private
   */
  tryToResolveExtension (holder) {
    if (!holder.elementInstances.every(el => el.isBuilt())) {
      return
    }

    holder.elementInstances.length = 0

    holder.loaded = true

    if (holder.resolve) {
      holder.resolve(holder.extension)
    }
  }

  /**
   * An error occurs in registeration of current extension.
   *
   * @param {!Object} holder of extension.
   * @param {Error} error to reject.
   * @private
   */
  tryToRejectError (holder, error) {
    holder.error = error

    if (holder.reject) {
      holder.reject(error)
    }
  }

  /**
   * Installs an extension. The same as `MIP.push`.
   *
   * @param {!Object} extension
   * @returns {!Promise<void>}
   */
  installExtension (extension) {
    return Promise.all([
      /**
       * Disables `extension.deps` temporarily.
       */
      // this.preloadDepsOf(extension),
      this.mipdoc.whenBodyAvailable()
    ]).then(
      () => {
        !window.__mipComponentsWebpackHelpers__ && installMipComponentsPolyfill()

        return this.registerExtension(extension.name, extension.func, this.win.MIP)
      }
    )
  }

  /**
   * Returns the appropriate registrator for an element.
   * An element implementation could be a class written in native JavaScript or a Vue object.
   * If `element.version === '1'`, then it will fallback to the registration of MIP1 elements.
   *
   * @param {!Object} element contains implementation, css and version.
   * @returns {!function(string, !Function | !Object, string)}
   * @private
   */
  getElementRegistrator (element) {
    if (element.version && element.version.split('.')[0] === '1') {
      return registerMip1Element
    }

    if (typeof element.implementation === 'object') {
      return registerVueCustomElement
    }

    return registerCustomElement
  }

  /**
   * Registers an element in extension currently being registered (by calling `MIP.push`).
   *
   * @param {string} name
   * @param {!Function | !Object} implementation
   * @param {string=} css
   * @param {Object=} options
   */
  registerElement (name, implementation, css, options) {
    const holder = this.getCurrentExtensionHolder()
    const element = {implementation, css}
    const version = options && options.version && '' + options.version

    if (version) {
      element.version = version
    }

    holder.extension.elements[name] = element

    /** @type {HTMLElement[]} */
    let elementInstances = this.getElementRegistrator(element)(name, implementation, css)

    if (elementInstances && elementInstances.length) {
      elementInstances.forEach(el => {
        /**
         * Lifecycle `build` of element instances is probably delayed with `setTimeout`.
         * If they are not, these event listeners would not be registered before they emit events.
         */
        let unlistenBuild = listen(el, 'build', () => {
          this.tryToResolveExtension(holder)
          unlistenBuild()
          unlistenBuildError()
        })
        let unlistenBuildError = listen(el, 'build-error', event => {
          this.tryToRejectError(holder, event.detail[0])
          unlistenBuild()
          unlistenBuildError()
        })
      })
      holder.elementInstances = holder.elementInstances.concat(elementInstances)
    }
  }

  /**
   * Registers a service in extension currently being registered (by calling `MIP.push`).
   * A service in extension is still a class contains some useful functions,
   * it's no conceptual difference with other internal services.
   * However, external services will be instantiated immediately.
   *
   * @param {string} name
   * @param {!Function} implementation
   */
  registerService (name, implementation) {
    const holder = this.getCurrentExtensionHolder()

    holder.extension.services[name] = {implementation}

    Services.registerService(this.win, name, implementation, true)
  }

  /**
   * Registers a template in extension currently being registered (by calling `MIP.push`).
   *
   * @param {string} name
   * @param {!Function} implementation
   * @param {Object=} options
   */
  registerTemplate (name, implementation, options) {
    templates.register(name, implementation)
  }
}

/**
 * @param {!Window} win
 */
export function installExtensionsService (win) {
  Services.registerService(win, 'extensions', Extensions)
}
