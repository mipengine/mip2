import {Deferred} from '../util'

class ServicesFactory {
  /**
   * @returns {import('./extensions').Extensions}
   */
  static extensions () {
    return Services.getService('extensions')
  }

  /**
   * @returns {import('./timer').Timer}
   */
  static timer () {
    return Services.getService('timer')
  }

  /**
   * @returns {import('./vue-compat').VueCompat}
   */
  static vueCompat () {
    return Services.getService('vue-compat')
  }
}

class ServicesInternal {
  /**
   * Returns the object that holds the services registered in a holder.
   *
   * @param {!Window} holder currently represents `Window`.
   * @returns {Object}
   * @private
   */
  static getServices (holder) {
    let {services} = holder

    if (!services) {
      services = holder.services = {}
    }

    return services
  }

  /**
   * Instantiates the given service. Fulfills the pending promise if the service has been requested.
   * Returns instance of the service.
   *
   * @param {Object} service to be instantiated.
   * @returns {Object}
   * @private
   */
  static instantiateService (service) {
    let {instance} = service

    if (instance) {
      return instance
    }

    const {resolve, context, Constructor} = service

    instance = new Constructor(context)

    service.instance = instance
    service.context = null
    service.Constructor = null

    if (resolve) {
      resolve(instance)
    }

    return instance
  }

  /**
   * Registers a service on `holder`. Returns the registered service.
   *
   * @param {!Window} holder currently represents `Window`.
   * @param {string} id of the service.
   * @param {!Object} context of the service.
   * @param {!Function} Constructor of the service.
   * @param {?boolean} instantiate service immediately.
   * @returns {!Object}
   */
  static registerService (holder, id, context, Constructor, instantiate) {
    const services = this.getServices(holder)
    let service = services[id]

    /**
     * Service has not been registered on holder.
     */
    if (!service) {
      service = services[id] = {
        instance: null,
        promise: null,
        resolve: null,
        context: null,
        Constructor: null
      }
    }

    /**
     * Service has an implementation.
     */
    if (service.instance || service.Constructor) {
      return service
    }

    service.context = context
    service.Constructor = Constructor

    /**
     * Service may have been requested already, in which case we need to fulfill the pending promise.
     */
    if (service.resolve || instantiate) {
      this.instantiateService(service)
    }

    return service
  }

  /**
   * Service doesn't have an implementation or a pending promise.
   * It means the service has not been registered on `holder`.
   * Registers a service on `holder` with a pending promise and returns it.
   *
   * @param {!Window} holder currently represents `Window`.
   * @param {string} id of the service.
   * @returns {!Object}
   */
  static registerPendingService (holder, id) {
    const services = this.getServices(holder)
    let service = services[id] = {
      instance: null,
      context: null,
      Constructor: null
    }

    const {promise, resolve} = new Deferred()

    service.promise = promise
    service.resolve = resolve

    return service
  }

  /**
   * Returns instance of registered service from `holder` by `id`.
   *
   * @template T typeof service instance.
   * @param {!Window} holder currently represents `Window`.
   * @param {string} id of the service.
   * @returns {T}
   */
  static getService (holder, id) {
    const service = this.getServices(holder)[id]

    return this.instantiateService(service)
  }

  /**
   * Similar to `getService`, but returns `null` if the service has not been registered.
   *
   * @template T typeof service instance.
   * @param {!Window} holder currently represents `Window`.
   * @param {string} id of the service.
   * @returns {?T}
   */
  static getServiceOrNull (holder, id) {
    const service = this.getServices(holder)[id]

    if (!service || (!service.instance && !service.Constructor)) {
      return null
    }

    return this.instantiateService(service)
  }

  /**
   * Similar to `getServicePromiseInternal`, but returns `null` if the service has not been registered.
   *
   * @template T typeof service instance.
   * @param {!Window} holder currently represents `Window`.
   * @param {string} id of the service.
   * @returns {?Promise<T>}
   */
  static getServicePromiseOrNull (holder, id) {
    const service = this.getServices(holder)[id]

    if (!service) {
      return null
    }

    if (!service.promise) {
      service.promise = Promise.resolve(this.instantiateService(service))
    }

    return service.promise
  }

  /**
   * Returns a promise for a service for the given `id` and `holder`.
   * The promise resolves when the implementation loaded.
   *
   * @template T typeof service instance.
   * @param {!Window} holder currently represents `Window`.
   * @param {string} id of the service.
   * @returns {Promise<T>}
   */
  static getServicePromise (holder, id) {
    const cached = this.getServicePromiseOrNull(holder, id)

    if (cached) {
      return cached
    }

    const {promise} = this.registerPendingService(holder, id)

    return promise
  }
}

class Services extends ServicesFactory {
  /**
   * Registers a service with given `id` and implementation.
   *
   * @param {string} id of the service.
   * @param {!Function} Constructor of the service.
   * @param {?boolean} instantiate service immediately.
   */
  static registerService (id, Constructor, instantiate) {
    ServicesInternal.registerService(window, id, window, Constructor, instantiate)
  }

  /**
   * Returns a service for the given `id`.
   *
   * @template T typeof service instance.
   * @param {string} id of the service.
   * @returns {T}
   */
  static getService (id) {
    return ServicesInternal.getService(window, id)
  }

  /**
   * Similar to `getService`, but returns `null` if the service has not been registered.
   *
   * @template T typeof service instance.
   * @param {string} id of the service.
   * @returns {?T}
   */
  static getServiceOrNull (id) {
    return ServicesInternal.getServiceOrNull(window, id)
  }

  /**
   * Similar to `getServicePromise`, but returns `null` if the service has not been registered.
   *
   * @template T typeof service instance.
   * @param {string} id of the service.
   * @returns {?Promise<T>}
   */
  static getServicePromiseOrNull (id) {
    return ServicesInternal.getServicePromiseOrNull(window, id)
  }

  /**
   * Returns a promise for a service for the given `id`.
   * The promise resolves when the implementation loaded.
   *
   * @template T typeof service instance.
   * @param {string} id of the service.
   * @returns {Promise<T>}
   */
  static getServicePromise (id) {
    return ServicesInternal.getServicePromise(window, id)
  }
}

export default Services
