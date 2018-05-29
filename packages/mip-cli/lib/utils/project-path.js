/**
 * @file project-path.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path');

function componentsDir(dir) {
    return path.resolve(dir, 'components');
}

// function possibleComponentPaths(dir, id) {
//     let compDir = componentsDir(dir);
//     return [
//         path.resolve(compDir, id + '.vue'),
//         path.resolve(compDir, id, id + '.vue')
//     ];
// }

function componentPath(dir, id) {
    let compDir = componentsDir(dir);
    return path.resolve(compDir, id, id + '.vue');
}

function testDir(dir) {
    return path.resolve(dir, 'example');
}

function componentTestDir(dir, component) {
    return path.resolve(dir, component, 'example');
}

function storeDir(dir) {
    return path.resolve(dir, 'store');
}

module.exports = {
    components: componentsDir,
    componentPath: componentPath,
    componentTestDir: componentTestDir,
    // possibleComponents: possibleComponentPaths,
    test: testDir,
    store: storeDir
};
