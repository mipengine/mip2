import CustomElement from './custom-element'
import Services, {
  installExtensionsService,
  installTimerService,
  installVueCompatService
} from './services'
import MipShell from './components/mip-shell'
import performance from './performance'
import resources from './resources'
import util from './util'
import viewer from './viewer'
import viewport from './viewport'
import installMip1Polyfill from './mip1-polyfill'
import installMipComponentsPolyfill from 'deps/mip-components-webpack-helpers'
// import 'core-js/modules/es7.promise.finally'

class Runtime {
  constructor () {
    this.installServices()

    /**
     * @private
     * @const
     */
    this.extensions = Services.extensions()
  }

  /**
   * Install services.
   *
   * @private
   */
  installServices () {
    installExtensionsService()
    installTimerService()
    installVueCompatService()
  }

  /**
   * Returns `pageMeta` and `standalone` of this page.
   *
   * @returns {!Object}
   * @private
   */
  getPageMetadata () {
    // 通过 window.name 传递信息，可用于跨域情况
    let pageMeta
    let pageMetaConfirmed = false
    try {
      pageMeta = JSON.parse(window.name)
      if (typeof pageMeta !== 'object' || pageMeta === null) {
        throw new Error()
      }
      /* istanbul ignore next */
      pageMetaConfirmed = true
    } catch (e) {
      pageMeta = {
        standalone: false,
        isRootPage: true,
        isCrossOrigin: false
      }
    }

    // 当前是否是独立站
    let standalone
    /* istanbul ignore if */
    if (pageMetaConfirmed) {
      standalone = pageMeta.standalone
    } else {
      try {
        standalone = pageMeta.standalone ||
          !viewer.isIframed ||
          typeof window.top.MIP !== 'undefined'
      } catch (e) {
        /* istanbul ignore next */
        standalone = false
      }
      pageMeta.standalone = standalone
    }

    return {
      pageMeta,
      standalone
    }
  }

  /**
   * Returns the runtime object.
   */
  get () {
    const {pageMeta, standalone} = this.getPageMetadata()

    viewer.pageMeta = pageMeta

    const {installExtension, registerElement, registerService, registerTemplate} = this.extensions

    const MIP = {
      version: '2',
      CustomElement,
      Services,
      builtinComponents: {
        MipShell,
        MIPShell: MipShell
      },
      css: {},
      hash: util.hash,
      performance,
      prerenderElement: resources.prerenderElement,
      push: installExtension,
      registerElement,
      registerService,
      registerTemplate,
      /**
       * @deprecated Use `MIP.push` and `MIP.registerElement` instead.
       */
      registerCustomElement: registerElement,
      /**
       * @deprecated Use `MIP.push` and `MIP.registerElement` instead.
       */
      registerVueCustomElement: registerElement,
      standalone,
      templates: util.templates,
      util,
      viewer,
      viewport
    }

    installMip1Polyfill(MIP)
    installMipComponentsPolyfill()

    return MIP
  }
}

/**
 * @returns {!Object}
 */
export function getRuntime () {
  const runtime = new Runtime()

  return runtime.get()
}
