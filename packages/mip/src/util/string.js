import {memoize} from './fn'

/** @type {(name: string) => string} */
export const camelize = memoize(name => name.replace(/-[a-z]/g, s => s[1].toUpperCase()))

/** @type {(name: string) => string} */
export const capitalize = memoize(name => name.replace(/^[a-z]/, s => s.toUpperCase()))

/** @type {(name: string) => string} */
export const hyphenate = memoize(name => name.replace(/\B[A-Z]/g, s => `-${s.toLowerCase()}`))

export const kebabize = memoize(name => name.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`))

