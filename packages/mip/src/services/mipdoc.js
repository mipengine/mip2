import Services from './services'

import {dom} from '../util'

/* istanbul ignore next */
class BaseMipdoc {
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
  }

  /**
   * Returns the URL for this mipdoc.
   *
   * @returns {string}
   * @abstract
   */
  getUrl () {}

  /**
   * Returns the root node for this mipdoc.
   *
   * @returns {!Document}
   * @abstract
   */
  getRootNode () {}

  /**
   * Returns the head element for this mipdoc.
   *
   * @returns {!HTMLHeadElement}
   * @abstract
   */
  getHead () {}

  /**
   * Returns the body element for this mipdoc.
   *
   * @returns {!HTMLBodyElement}
   * @abstract
   */
  getBody () {}

  /**
   * Whether `document.body` is available.
   *
   * @returns {boolean}
   * @abstract
   */
  isBodyAvailable () {}

  /**
   * Whether the `document` is ready.
   *
   * @returns {boolean}
   * @abstract
   */
  isDocumentReady () {}

  /**
   * Returns a promise that resolve when `document.body` is avaliable.
   *
   * @returns {!Promise<HTMLBodyElement>}
   * @abstract
   */
  whenBodyAvailable () {}

  /**
   * Returns a promise that resolve when `document` is ready.
   *
   * @returns {!Promise<void>}
   * @abstract
   */
  whenDocumentReady () {}
}

export class Mipdoc extends BaseMipdoc {
  /**
   * @param {!Window} win
   */
  constructor (win) {
    super(win)

    /**
     * @private
     * @const
     */
    this.doc = win.document

    /**
     * @type {!Promise<!HTMLBodyElement>}
     * @private
     * @const
     */
    this.bodyAvailable = this.doc.body
      ? Promise.resolve(this.doc.body)
      : dom.waitForBody(this.doc).then(() => this.getBody())
  }

  /**
   * @override
   */
  getUrl () {
    return this.win.location.href
  }

  /**
   * @override
   */
  getRootNode () {
    return this.doc
  }

  /**
   * @override
   */
  getHead () {
    return this.doc.head
  }

  /**
   * @override
   */
  getBody () {
    return this.doc.body
  }

  /**
   * @override
   */
  isBodyAvailable () {
    return !!this.doc.body
  }

  /**
   * @override
   */
  whenBodyAvailable () {
    return this.bodyAvailable
  }
}

/**
 * @param {!Window} win
 */
export function installMipdocService (win) {
  Services.registerService(win, 'mipdoc', Mipdoc)
}
