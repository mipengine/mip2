import Services from './services'

import {dom} from '../util'

export class Mipdoc {
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
     * @type {!Promise<!HTMLBodyElement>}
     * @private
     * @const
     */
    this.bodyAvailable = this.doc.body
      ? Promise.resolve(this.doc.body)
      : dom.waitForBody(this.doc).then(() => this.getBody())
  }

  /**
   * Returns the URL for this mipdoc.
   *
   * @returns {string}
   */
  getUrl () {
    return this.win.location.href
  }

  /**
   * Returns the root node for this mipdoc.
   *
   * @returns {!Document}
   */
  getRootNode () {
    return this.doc
  }

  /**
   * Returns the head element for this mipdoc.
   *
   * @returns {!HTMLHeadElement}
   */
  getHead () {
    return this.doc.head
  }

  /**
   * Returns the body element for this mipdoc.
   *
   * @returns {!HTMLBodyElement}
   */
  getBody () {
    return this.doc.body
  }

  /**
   * Whether `document.body` is available.
   *
   * @returns {boolean}
   */
  isBodyAvailable () {
    return !!this.doc.body
  }

  /**
   * Returns a promise that resolve when `document.body` is avaliable.
   *
   * @returns {!Promise<HTMLBodyElement>}
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
