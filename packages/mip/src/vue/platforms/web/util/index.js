/**
 * @file index.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

import {warn} from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 *
 * @param {Object} el element
 * @return {any} any result
 */
export function query (el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }

    return selected
  }
  return el
}
