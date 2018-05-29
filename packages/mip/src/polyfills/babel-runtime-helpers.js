/**
 * @file babel runtime helper
 * @author clark-t (clarktanglei@163.com)
 */

const requires = require.context('babel-runtime/helpers', true, /\.js$/);
const regenerator = require('babel-runtime/regenerator');

let helpers = requires.keys().reduce((obj, filename) => {
    obj[filename.slice(2, -3)] = requires(filename);
    return obj;
}, {});

helpers.regenerator = regenerator;

export function install(win) {
    win.babelRuntimeHelpers = helpers;
}
