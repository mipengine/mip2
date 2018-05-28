/**
 * @file Object.assign polyfill
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict';

/**
 * Object.assign
 *
 * @param {!Object} target target object
 * @param {...Object} args args
 * @return {!Object}
 */
export function assign(target, ...args) {
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    let output = Object(target);
    for (let arg of args) {
        let source = args[arg];
        if (source != null) {
            Object.keys(source).forEach(key => {
                if (source.hasOwnProperty(key)) {
                    output[key] = source[key];
                }
            });
        }
    }
    return output;
}


/**
 * Sets the Object.assign polyfill if it does not exist.
 *
 * @param {!Window} win window
 */
export function install(win) {
    win.Object.assign = win.Object.assign || assign;
}
