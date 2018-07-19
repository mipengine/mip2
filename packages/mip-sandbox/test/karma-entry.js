/**
 * @file karma-entry.js
 * @author clark-t (clarktanglei@163.com)
 */

var files = require.context('./spec', true, /\.spec\.js$/)
files.keys().forEach(files)
