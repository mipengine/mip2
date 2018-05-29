/**
 * @file helper.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

function noop() {}

function getId(pathname) {
    return path.basename(pathname, path.extname(pathname));
}

function getBaseName(pathname) {
    return path.basename(pathname).replace(/\?.*/, '');
}

function resolvePath(possiblePaths) {
    return someAsync(possiblePaths.map(
        iPath => fs.exists(iPath).then(
            result => new Promise(
                (resolve, reject) => (result ? resolve(iPath) : reject())
            )
        )
    ))
    .catch(noop);
}

function isJsRelated(str) {
    return /.+\.js(\.map$|\?|$)/.test(str);
}

function isJsMap(str) {
    return /\.map$/.test(str);
}

function pify(fn) {
    return (...args) => new Promise((resolve, reject) => {
        let callback = (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        };

        fn(...args, callback);
    });
}

function globPify(...args) {
    return pify(glob)(...args);
}

function kebab2Camel(str) {
    return str.replace(/-(.)/g, (match, word) => word.toUpperCase());
}

function someAsync(promises) {
    return new Promise((resolve, reject) => {
        let maxLength = promises.length;
        let failCounter = 0;
        let errCallback = err => {
            if (++failCounter === maxLength) {
                reject();
            }
        };

        for (let i = 0; i < maxLength; i++) {
            promises[i].then(resolve).catch(errCallback);
        }
    });
}

function supplementarySet(arr1, arr2) {
    let result = [];
    for (let i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) === -1) {
            result.push(arr1[i]);
        }
    }
    return result;
}

function isValidArray(arr) {
    return Array.isArray(arr) && arr.length > 0;
}

function removeFromArray(arr, item) {
    return arr.filter(i => i !== item);
}

function findIndexByString(content, match, startIndex = 0) {
    if (startIndex > content.length) {
        return;
    }

    let index = content.indexOf(match, startIndex);

    if (index === -1) {
        return;
    }

    return {
        text: match,
        index: index
    };
}

function findIndexByRegExp(content, match, startIndex = 0) {
    if (startIndex > content.length) {
        return;
    }

    let regexp = removeRegExpGlabal(match);
    let matched = content.slice(startIndex).match(regexp);
    if (!matched) {
        return;
    }

    return {
        text: matched[0],
        index: matched.index + startIndex
    };
}

function removeRegExpGlabal(regexp) {
    if (!regexp.global) {
        return regexp;
    }

    let attributes = '';
    if (regexp.ignoreCase) {
        attributes += 'i';
    }
    if (regexp.multiline) {
        attributes += 'm';
    }

    return new RegExp(regexp, attributes);
}

function findIndexes(content, match) {
    let findIndex = typeof match === String ? findIndexByString : findIndexByRegExp;
    let arr = [];
    let startIndex = 0;
    while (startIndex < content.length) {
        let result = findIndex(content, match, startIndex);
        if (!result) {
            return arr;
        }
        startIndex = result.index + result.text.length;
        arr.push(result);
    }
    return arr;
}

function resolveModule(moduleName, rest) {
    let dir = path.resolve(__dirname, '../../node_modules', moduleName);

    if (rest) {
        return path.resolve(dir, rest);
    }

    return dir;
}

module.exports = {
    noop,
    getId,
    getBaseName,
    resolvePath,
    isJsRelated,
    isJsMap,
    globPify,
    kebab2Camel,
    someAsync,
    supplementarySet,
    isValidArray,
    removeFromArray,
    findIndexByString,
    findIndexByRegExp,
    removeRegExpGlabal,
    findIndexes,
    resolveModule
};
