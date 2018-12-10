import CustomElement from './custom-element'
import Services, {
  installExtensionsService,
  installMipdocService,
  installTimerService
} from './services'
import MipShell from './components/mip-shell'
import performance from './performance'
import resources from './resources'
import util from './util'
import viewer from './viewer'
import viewport from './viewport'
import installMip1Polyfill from './mip1-polyfill'
import installSandbox from './sandbox'

class Runtime {
  /**
   * @param {!Window} win
   */
  constructor (win) {
    this.installServices(win)

    /**
     * @private
     * @const
     */
    this.win = win

    /**
     * @private
     * @const
     */
    this.extensions = Services.extensionsFor(win)
  }

  /**
   * Install services.
   *
   * @param {!Window} win
   * @private
   */
  installServices (win) {
    installMipdocService(win)
    installExtensionsService(win)
    installTimerService(win)
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
      pageMeta = JSON.parse(this.win.name)
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
          typeof this.win.top.MIP !== 'undefined'
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
   * Registers the runtime in global scope. Constructs `window.MIP` object.
   */
  register () {
    const preregisteredExtensions = this.win.MIP || []
    const {pageMeta, standalone} = this.getPageMetadata()

    viewer.pageMeta = pageMeta

    const {installExtension, registerElement, registerService, registerTemplate} = this.extensions

    let globalMip = this.win.MIP = {
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

    installMip1Polyfill(globalMip)
    installSandbox(globalMip)
    preregisteredExtensions.forEach(installExtension)
  }
}

/**
 * @param {!Window} win
 * @returns {!Runtime}
 */
export function registerRuntime (win) {
  const runtime = new Runtime(win)

  runtime.register()

  return runtime
}
