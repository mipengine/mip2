/**
 * @file string.js
 * @author yanshi (yanshi@baidu.com)
 */

import {memoize} from './fn'

/**
 * 中横线转驼峰
 *
 * @type {(name: string) => string}
 */
export const camelize = memoize(name => name.replace(/-[a-z]/g, s => s[1].toUpperCase()))

/**
 * 首字母变大写
 *
 * @type {(name: string) => string}
 */
export const capitalize = memoize(name => name.replace(/^[a-z]/, s => s.toUpperCase()))

/**
 * 驼峰转中横线
 * ABcDe -> A-bc-de
 *
 * @type {(name: string) => string}
 */
export const hyphenate = memoize(name => name.replace(/\B[A-Z]/g, s => `-${s.toLowerCase()}`))

/**
 * 驼峰转中横线
 * ABcDe -> -a-bc-de
 *
 * @type {(name: string) => string}
 */
export const kebabize = memoize(name => name.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`))
