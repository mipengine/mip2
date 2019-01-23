import Services from './services'

import {dom} from '../util'

export class Mipdoc {
  constructor () {
    /**
     * @type {!Promise<!HTMLBodyElement>}
     * @private
     * @const
     */
    this.bodyAvailable = document.body
      ? Promise.resolve(document.body)
      : dom.waitForBody(document).then(() => this.getBody())
  }

  /**
   * Returns the URL for this mipdoc.
   *
   * @returns {string}
   */
  getUrl () {
    return window.location.href
  }

  /**
   * Returns the root node for this mipdoc.
   *
   * @returns {!Document}
   */
  getRootNode () {
    return document
  }

  /**
   * Returns the head element for this mipdoc.
   *
   * @returns {!HTMLHeadElement}
   */
  getHead () {
    return document.head
  }

  /**
   * Returns the body element for this mipdoc.
   *
   * @returns {!HTMLBodyElement}
   */
  getBody () {
    return document.body
  }

  /**
   * Whether `document.body` is available.
   *
   * @returns {boolean}
   */
  isBodyAvailable () {
    return !!document.body
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

export function installMipdocService () {
  Services.registerService('mipdoc', Mipdoc)
}
