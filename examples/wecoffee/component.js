// 替代 mip server 的编译

(window.MIP = window.MIP || []).push({
    name: 'mip-iframe-shell',
    func: function () {
        /**
 * @file assert.js assert utility
 * @author harttle<yangjvn@126.com>
 */

define('@searchfe/assert/index', ['require'], function (require) {
    function ok(predict, msg) {
        if (!predict) {
            throw new Error(msg);
        }
    }

    function equal(actual, expected, message) {
        return ok(actual == expected, message);
    }

    var assert = ok;
    assert.ok = ok;
    assert.equal = equal;

    return assert;
});

define('@searchfe/assert', ['@searchfe/assert/index'], function (mod) { return mod; });
define('@searchfe/promise/src/promise', ['require', '@searchfe/assert', '@searchfe/promise/src/set-immediate'], function (require) {
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var UNHANDLED_REJECTION_EVENT_MSG = 'cannot make RejectionEvent when promise not rejected';
    var config = {
        longStackTraces: false
    };
    var assert = require('@searchfe/assert');
    var setImmediate = require('@searchfe/promise/src/set-immediate');

    /**
     * Create a new promise.
     * The passed in function will receive functions resolve and reject as its arguments
     * which can be called to seal the fate of the created promise.
     *
     * The returned promise will be resolved when resolve is called, and rejected when reject called or any exception occurred.
     * If you pass a promise object to the resolve function, the created promise will follow the state of that promise.
     *
     * @param {Function} cb The resolver callback.
     * @constructor
     * @alias module:Promise
     * @example
     * var p = new Promise(function(resolve, reject){
     *     true ? resolve('foo') : reject('bar');
     * });
     */
    function Promise (cb) {
        assert(this instanceof Promise, 'Promise must be called with new operator');
        assert(typeof cb === 'function', 'callback not defined');

        this._state = PENDING;
        this._fulfilledCbs = [];
        this._rejectedCbs = [];
        this._errorPending = false;
        this._fromResolver(cb);
    }

    Promise.prototype._fulfill = function (result) {
        this._result = result;
        this._state = FULFILLED;
        this._flush();
    };

    Promise.prototype._reject = function (err) {
        if (config.longStackTraces && err) {
            err.stack += '\n' + this._originalStack;
        }

        this._result = err;
        this._state = REJECTED;
        this._errorPending = true;
        this._flush();

        setImmediate(function () {
            this._checkUnHandledRejection();
        }.bind(this));
    };

    Promise.prototype._resolve = function (result) {
        if (isThenable(result)) {
            // result.then is un-trusted
            this._fromResolver(result.then.bind(result));
        } else {
            this._fulfill(result);
        }
    };

    /**
     * Resolve the un-trusted promise definition function: fn
     * which has exactly the same signature as the .then function
     *
     * @param {Function} fn the reslver
     */
    Promise.prototype._fromResolver = function (fn) {
        // ensure resolve/reject called once
        var resolved = false;
        var self = this;
        try {
            fn(function (result) {
                if (resolved) {
                    return;
                }

                resolved = true;
                self._resolve(result);
            }, function (err) {
                if (resolved) {
                    return;
                }

                resolved = true;
                self._reject(err);
            });
        } catch (err) {
            if (resolved) {
                return;
            }

            resolved = true;
            self._reject(err);
        }
    };

    Promise.prototype._checkUnHandledRejection = function () {
        if (this._errorPending) {
            var event = mkRejectionEvent(this);
            window.dispatchEvent(event);
        }
    };

    Promise.prototype._flush = function () {
        if (this._state === PENDING) {
            return;
        }

        var cbs = this._state === REJECTED ? this._rejectedCbs : this._fulfilledCbs;

        cbs.forEach(function (callback) {
            if (this._state === REJECTED && this._errorPending) {
                this._errorPending = false;
            }

            if (typeof callback === 'function') {
                var result = this._result;
                setImmediate(function () {
                    callback(result);
                });
            }
        }, this);
        this._rejectedCbs = [];
        this._fulfilledCbs = [];
    };

    /**
     * Register a callback on fulfilled or rejected.
     *
     * @param {Function} onFulfilled the callback on fulfilled
     * @param {Function} onRejected the callback on rejected
     */
    Promise.prototype._done = function (onFulfilled, onRejected) {
        this._fulfilledCbs.push(onFulfilled);
        this._rejectedCbs.push(onRejected);
        this._flush();
    };

    /**
     * The Promise/A+ .then, register a callback on resolve. See: https://promisesaplus.com/
     *
     * @param {Function} onFulfilled The fulfilled callback.
     * @param {Function} onRejected The rejected callback.
     * @return {Promise} A thenable.
     */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var ret;
            self._done(function (result) {
                if (typeof onFulfilled !== 'function') {
                    return resolve(result);
                }
                try {
                    ret = onFulfilled(result);
                } catch (e) {
                    return reject(e);
                }
                resolve(ret);
            }, function (err) {
                if (typeof onRejected !== 'function') {
                    return reject(err);
                }
                try {
                    ret = onRejected(err);
                } catch (e) {
                    return reject(e);
                }
                resolve(ret);
            });
        });
    };

    /**
     * The Promise/A+ .catch, retister a callback on reject. See: https://promisesaplus.com/
     *
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
     */
    Promise.prototype.catch = function (cb) {
        return this.then(function (result) {
            return result;
        }, cb);
    };

    /**
     * Register a callback on either resolve or reject. See: https://promisesaplus.com/
     *
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
     */
    Promise.prototype.finally = function (cb) {
        return this.then(cb, cb);
    };

    /**
     * Create a promise that is resolved with the given value.
     * If value is already a thenable, it is returned as is.
     * If value is not a thenable, a fulfilled Promise is returned with value as its fulfillment value.
     *
     * @param {Promise|any} obj The value to be resolved.
     * @return {Promise} A thenable which resolves the given `obj`
     * @static
     */
    Promise.resolve = function (obj) {
        return isThenable(obj) ? obj
            : new Promise(function (resolve) {
                return resolve(obj);
            });
    };

    /**
     * Create a promise that is rejected with the given error.
     *
     * @param {Error} err The error to reject with.
     * @return {Promise} A thenable which is rejected with the given `error`
     * @static
     */
    Promise.reject = function (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    };

    /**
     * This method is useful for when you want to wait for more than one promise to complete.
     *
     * Given an Iterable(arrays are Iterable), or a promise of an Iterable,
     * which produces promises (or a mix of promises and values),
     * iterate over all the values in the Iterable into an array and return a promise that is fulfilled when
     * all the items in the array are fulfilled.
     * The promise's fulfillment value is an array with fulfillment values at respective positions to the original array.
     * If any promise in the array rejects, the returned promise is rejected with the rejection reason.
     *
     * @param {Iterable<any>|Promise<Iterable<any>>} promises The promises to wait for.
     * @return {Promise} A thenable.
     * @static
     */
    Promise.all = function (promises) {
        return new Promise(function (resolve, reject) {
            var results = promises.map(function () {
                return undefined;
            });
            var count = promises.length;
            promises
                .map(Promise.resolve)
                .forEach(function (promise, idx) {
                    promise.then(function (result) {
                        results[idx] = result;
                        count--;
                        flush();
                    }, reject);
                });

            // case for empty array
            flush();

            function flush () {
                if (count <= 0) {
                    resolve(results);
                }
            }
        });
    };

    /**
     * Promisify callback
     *
     * @param {Function} resolver The callback to promisify
     * @return {Promise} that is resolved by a node style callback function. This is the most fitting way to do on the fly promisification when libraries don't expose classes for automatic promisification.
     */
    Promise.fromCallback = function (resolver) {
        return new Promise(function (resolve) {
            resolver(function (arg) {
                resolve(arg);
            });
        });
    };

    /**
     * Call functions in serial until someone rejected.
     *
     * @static
     * @param {Array} iterable the array to iterate with.
     * @param {Array} iteratee returns a new promise. The iteratee is invoked with three arguments: (value, index, iterable).
     * @return {Promise} the promise resolves when the last is completed
     */
    Promise.mapSeries = function (iterable, iteratee) {
        var ret = Promise.resolve('init');
        var result = [];
        iterable.forEach(function (item, idx) {
            ret = ret
        .then(function () {
            return iteratee(item, idx, iterable);
        })
        .then(function (x) {
            return result.push(x);
        });
        });
        return ret.then(function () {
            return result;
        });
    };

    function mkRejectionEvent (promise) {
        assert(promise._state === REJECTED, UNHANDLED_REJECTION_EVENT_MSG);
        var RejectionEvent;
        if (typeof window.PromiseRejectionEvent === 'function') {
            RejectionEvent = window.PromiseRejectionEvent;
        } else {
      // eslint-disable-next-line
      RejectionEvent = CustomEvent
        }
        var event = new RejectionEvent('unhandledrejection', {
            promise: promise,
            reason: promise._result
        });
        event.reason = event.reason || promise._result;
        return event;
    }

    function isThenable (obj) {
        return obj && typeof obj.then === 'function';
    }

    return Promise;
});

define('@searchfe/promise/src/set-immediate', ['require'], function (require) {
    var MSG = 'setImmediate polyfill';
    var isBaidu = /baiduboxapp/.test(window.navigator.userAgent);

    function useImmediate (global, cb) {
        var setImmediate = global.setImmediate;
        setImmediate(cb);
    }
    function useTimeout (global, cb) {
        var setImmediate = global.setTimeout;
        setImmediate(cb);
    }
    function useMessageChannel (global, cb) {
        var channel = new global.MessageChannel();
        channel.port1.onmessage = function () {
            cb();
        };
        channel.port2.postMessage(MSG);
    }
    function usePostMessage (global, cb) {
        global.addEventListener('message', function messageHandler () {
            global.removeEventListener('message', messageHandler, false);
            cb();
        }, false);
        global.postMessage(MSG, '*');
    }

    function immediate (global, cb) {
        if (isBaidu) {
            useTimeout(global, cb);
        // W3C conformant browsers, e.g. FireFox
        } else if (global.setImmediate) {
            useImmediate(global, cb);
        // Chrome, Safari, Workers
        } else if (global.MessageChannel) {
            useMessageChannel(global, cb);
        // non-IE8
        } else if (global.addEventListener && global.postMessage) {
            usePostMessage(global, cb);
        // Rest old browsers, IE8 goes here
        } else {
            useTimeout(global, cb);
        }
    }

    function getGlobal () {
        if (typeof window !== 'undefined') {
            return window;
        }

        if (typeof self !== 'undefined') {
            // eslint-disable-next-line
            return self
        }
        // eslint-disable-next-line
        return Function('return this')();
    }

    function exports (cb) {
        var global = getGlobal();
        immediate(global, cb);
    }
    exports.impl = immediate;

    return exports;
});

define('@searchfe/promise', ['@searchfe/promise/src/promise'], function (mod) { return mod; });
/**
 * @author harttle(yangjvn@126.com)
 * @file underscore.js
 */

// eslint-disable-next-line
define('@searchfe/underscore/src/index', ['require', '@searchfe/assert'], function (require) {
    /**
     * A lightweight underscore implementation.
     * @namespace underscore
     */

    var assert = require('@searchfe/assert');
    var arrayProto = Array.prototype;
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var stringProto = String.prototype;
    var exports = {};
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

    /**
     * Get deep property by path
     *
     * @param {Object} obj The object to query with
     * @param {string} path A dot-delimited path string
     * @return {any} the value assiciated with path
     */
    function get (obj, path) {
        var ret = obj;
        (path || '').split('.').forEach(function (key) {
            ret = ret ? ret[key] : undefined;
        });
        return ret;
    }

    /**
     * Set deep property by path
     *
     * @param {Object} obj The object to set with
     * @param {string} path A dot-delimited path string
     * @param {string} val The value to be set
     */
    function set (obj, path, val) {
        obj = obj || {};
        var arr = (path || '').split('.');
        arr.forEach(function (key, i) {
            obj[key] = (obj[key] !== undefined) ? obj[key] : {};
            if (i === arr.length - 1) {
                obj[key] = val;
            } else {
                obj = obj[key];
            }
        });
    }

    /**
     * Has deep property by path
     *
     * @param {any} obj The object to query with
     * @param {string} path A dot-delimited path string
     * @return {boolean} the value assiciated with path
     */
    function has (obj, path) {
        var paths = path.split('.');
        var i = 0;
        while (hasFunc(obj, paths[i]) && i < paths.length) {
            obj = obj[paths[i++]];
        }
        return i >= paths.length;
    }

    /**
     * Test if obj has property key
     *
     * @private
     * @param {any} obj The object to query with
     * @param {string} key The key to test
     * @return {boolean} the value assiciated with path
     */
    function hasFunc (obj, key) {
        return obj !== null && obj !== undefined && hasOwnProperty.call(obj, key);
    }

    /**
     * Parse arguments into Array
     *
     * @private
     * @param {Array-like-Object} args the arguments to be parsed
     * @return {Array} argument as array
     */
    function getArgs (args) {
        args = toArray(args);
        args.shift();
        return args;
    }

    /**
     * 公有函数
     */

    /**
     * Creates an array of the own and inherited enumerable property names of object.
     *
     * @param {Object} object The object to query.
     * @return {Array} Returns the array of property names.
     * @memberof underscore
     */
    function keysIn (object) {
        var ret = [];
        // eslint-disable-next-line
        for (var key in object) {
            ret.push(key);
        }
        return ret;
    }

    /**
     * Creates an array of the own enumerable property names of object.
     *
     * @param {Object} object The object to query.
     * @return {Array} Returns the array of property names.
     * @memberof underscore
     */
    function keys (object) {
        return Object.keys(Object(object));
    }

    /**
     * Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
     * The iteratee is invoked with three arguments: (value, key, object).
     * Iteratee functions may exit iteration early by explicitly returning false.
     *
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @return {Object} Returs object.
     * @memberof underscore
     */
    function forOwn (object, iteratee) {
        object = object || {};
        for (var k in object) {
            if (object.hasOwnProperty(k)) {
                if (iteratee(object[k], k, object) === false) {
                    break;
                }
            }
        }
        return object;
    }

    /**
     * Converts value to an array.
     *
     * @param {any} value The value to convert.
     * @return {Array} Returns the converted array.
     * @memberof underscore
     */
    function toArray (value) {
        if (!value) {
            return [];
        }
        return arrayProto.slice.call(value);
    }

    /**
     * Iterates over elements of collection and invokes iteratee for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     *
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @return {undefined} Just like Array.prototype.forEach
     * @memberof underscore
     */
    function forEach (collection, iteratee) {
        var args = getArgs(arguments);
        return arrayProto.forEach.apply(collection || [], args);
    }

    /**
     * Creates an array with all falsey values removed. The values false, null, 0, "", undefined, and NaN are falsey.
     *
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @return {Array} The filtered elements
     * @memberof underscore
     */
    function filter (collection, iteratee) {
        var args = getArgs(arguments);
        return arrayProto.filter.apply(collection || [], args);
    }

    /**
     * Creates an array of values by running each element in collection thru iteratee.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     *
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @return {Array} Returns the new mapped array.
     * @memberof underscore
     */
    function map (collection, iteratee) {
        if (isArrayLike(collection)) {
            var args = getArgs(arguments);
            return arrayProto.map.apply(collection || [], args);
        }
        var ret = [];
        forOwn(collection, function () {
            ret.push(iteratee.apply(null, arguments));
        });
        return ret;
    }

    /**
     * Reduce array or object.
     * The iteratee is invoked with three arguments: (prev, curr, index|key, collection).
     *
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {any} init The initial value.
     * @return {Array} Returns the new mapped array.
     * @memberof underscore
     */
    function reduce (collection, iteratee, init) {
        if (isArrayLike(collection)) {
            var args = getArgs(arguments);
            return arrayProto.reduce.apply(collection, args);
        }
        var ks = keys(collection);
        var ret;
        var i;
        if (arguments.length >= 3) {
            ret = init;
            i = 0;
        } else if (ks.length > 0) {
            ret = collection[ks[0]];
            i = 1;
        }
        for (; i < ks.length; i++) {
            var key = ks[i];
            ret = iteratee(ret, collection[key], key, collection);
        }
        return ret;
    }

    /**
     * Creates a slice of array from start up to, but not including, end.
     *
     * @param {Array} collection The array to slice.
     * @param {number} start The start position.
     * @param {number} end The end position.
     * @return {Array} Returns the slice of array.
     * @memberof underscore
     */
    function slice (collection, start, end) {
        var args = getArgs(arguments);
        return arrayProto.slice.apply(collection || [], args);
    }

    /**
     * This method is based on JavaScript Array.prototype.splice
     *
     * @param {Collection} collection the collection to be spliced
     * @return {Array} the spliced result
     * @memberof underscore
     */
    function splice (collection) {
        var args = getArgs(arguments);
        return arrayProto.splice.apply(collection || [], args);
    }

    /**
     * This method is based on JavaScript String.prototype.split
     *
     * @param {string} str the string to be splited.
     * @return {Array} Returns the string segments.
     * @memberof underscore
     */
    function split (str) {
        var args = getArgs(arguments);
        return stringProto.split.apply(str || '', args);
    }

    /**
     * Find and return the index of the first element predicate returns truthy for instead of the element itself.
     *
     * @param {Array} array The array to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @return {number} Returns the index of the found element, else -1.
     * @memberof underscore
     */
    function findIndex (array, predicate, fromIndex) {
        for (var i = fromIndex || 0; i < array.length; i++) {
            if (predicate(array[i], i, array)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * The missing string formatting function for JavaScript.
     *
     * @param {string} fmt The format string (can only contain "%s")
     * @return {string} The result string.
     * @memberof underscore
     * @example
     * format("foo%sfoo", "bar");   // returns "foobarfoo"
     */
    function format (fmt) {
        return getArgs(arguments).reduce(function (prev, cur) {
            return prev.replace('%s', cur);
        }, fmt);
    }

    /**
     * Assigns own and inherited enumerable string keyed properties of source objects to
     * the destination object for all destination properties that resolve to undefined.
     * Source objects are applied from left to right.
     * Once a property is set, additional values of the same property are ignored.
     *
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @memberof underscore
     * @return {Object} Returns object.
     */
    function defaults () {
        return assign.apply(null, slice(arguments, 0).reverse());
    }

    /**
     * Creates a shallow clone of value.
     *
     * @param {any} value The value to clone.
     * @return {any} Returns the cloned value.
     */
    function clone (value) {
        var ret;
        if (isArray(value)) {
            ret = [];
            value.forEach(function (item) {
                ret.push(clone(item));
            });
            return ret;
        }
        if (!isObject(value)) {
            return value;
        }
        ret = {};
        forOwn(value, function (val, key) {
            ret[key] = val;
        });
        return ret;
    }

    /**
     * This method is like _.clone except that it recursively clones value.
     *
     * @param {any} value The value to clone.
     * @return {any} Returns the cloned value.
     */
    function cloneDeep (value) {
        var ret;
        if (isFunction(value)) {
            return value;
        }
        if (isArray(value)) {
            ret = [];
            value.forEach(function (item) {
                ret.push(cloneDeep(item));
            });
            return ret;
        }
        if (!isObject(value)) {
            return value;
        }
        ret = {};
        forOwn(value, function (val, key) {
            ret[key] = cloneDeep(val);
        });
        return ret;
    }

    /**
     * Checks if value is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, new Number(0), and new String(''))
     *
     * @param {any} value The value to check.
     * @return {boolean} Returns true if value is an object, else false.
     * @memberof underscore
     */
    function isObject (value) {
        var type = typeof value;
        return value != null && (type === 'object' || type === 'function');
    }

    /**
     * Checks if value is a valid array-like length.
     *
     * @param {any} value the value to be checked
     * @return {boolean} true if value is length, false otherwise
     */
    function isLength (value) {
        return typeof value === 'number' &&
            value > -1 &&
            value % 1 === 0 &&
            value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if value is array-like
     *
     * @param {any} value the value to be checked
     * @return {boolearn} true if value is array-like, false otherwise
     */
    function isArrayLike (value) {
        return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * Checks if value is classified as a Function object.
     *
     * @param {any} value The value to check.
     * @return {boolean} Returns true if value is a function, else false.
     * @memberof underscore
     */
    function isFunction (value) {
        // safari 9 bug is omited, since it's not a mobile browser
        var type = typeof value;
        return type === 'function';
    }

    /**
     * Checks if value is classified as a String primitive or object.
     *
     * @param {any} value The value to check.
     * @return {boolean} Returns true if value is a string, else false.
     * @memberof underscore
     */
    function isString (value) {
        return value instanceof String || typeof value === 'string';
    }

    /**
     * Uses indexOf internally, if list is an Array. Use fromIndex to start your search at a given index.
     * http://underscorejs.org/#contains
     *
     * @param {Array|string} list the list of items in which to find
     * @param {any} value the value to find
     * @param {number} fromIndex Optional, default to 0
     * @return {number} Returns true if the value is present in the list, false otherwise.
     * @memberof underscore
     */
    function contains (list, value, fromIndex) {
        if (fromIndex === undefined) {
            fromIndex = 0;
        }
        return list.indexOf(value, fromIndex) > -1;
    }

    /**
     * Checks if value is classified as a RegExp object.
     *
     * @param {any} value The value to check.
     * @return {boolean} Returns true if value is a RegExp, else false.
     * @memberof underscore
     */
    function isRegExp (value) {
        return value instanceof RegExp;
    }

    /**
     * Assigns own enumerable string keyed properties of source objects to the destination object.
     * Source objects are applied from left to right.
     * Subsequent sources overwrite property assignments of previous sources.
     *
     * Note: This method mutates object and is loosely based on Object.assign.
     *
     * @param {Object} object The destination object.
     * @param {...Object} source The source objects.
     * @return {Object} Returns object.
     * @memberof underscore
     */
    function assign (object, source) {
        object = object == null ? {} : object;
        var srcs = slice(arguments, 1);
        forEach(srcs, function (src) {
            assignBinary(object, src);
        });
        return object;
    }

    function assignBinaryDeep (dst, src) {
        if (!dst) {
            return dst;
        }
        forOwn(src, function (v, k) {
            if (isObject(v) && isObject(dst[k])) {
                return assignBinaryDeep(dst[k], v);
            }
            dst[k] = v;
        });
    }

    function assignBinary (dst, src) {
        if (!dst) {
            return dst;
        }
        forOwn(src, function (v, k) {
            dst[k] = v;
        });
        return dst;
    }

    /**
     * This method is like `_.defaults` except that it recursively assigns default properties.
     *
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @return {Object} Returns object.
     * @memberof underscore
     */
    function defaultsDeep () {
        var ret = {};
        var srcs = slice(arguments, 0).reverse();
        forEach(srcs, function (src) {
            assignBinaryDeep(ret, src);
        });
        return ret;
    }

    /**
     * The inverse of `_.toPairs`; this method returns an object composed from key-value pairs.
     *
     * @param {Array} pairs The key-value pairs.
     * @return {Object} Returns the new object.
     * @memberof underscore
     */
    function fromPairs (pairs) {
        var object = {};
        map(pairs, function (arr) {
            var k = arr[0];
            var v = arr[1];
            object[k] = v;
        });
        return object;
    }

    /**
     * Checks if value is classified as an Array object.
     *
     * @param {any} value The value to check.
     * @return {boolean} Returns true if value is an array, else false.
     * @memberof underscore
     */
    function isArray (value) {
        return value instanceof Array;
    }

    /**
     * Checks if value is an empty object, collection, map, or set.
     * Objects are considered empty if they have no own enumerable string keyed properties.
     *
     * @param {any} value The value to check.
     * @return {boolean} Returns true if value is an array, else false.
     * @memberof underscore
     */
    function isEmpty (value) {
        return isArray(value) ? value.length === 0 : !value;
    }

    /**
     * Creates a function that negates the result of the predicate func.
     * The func predicate is invoked with the this binding and arguments of the created function.
     *
     * @param {Function} predicate The predicate to negate.
     * @return {Function} Returns the new negated function.
     * @memberof underscore
     */
    function negate (predicate) {
        return function () {
            return !predicate.apply(null, arguments);
        };
    }

    /**
     * Creates a function that invokes func with partials prepended to the arguments it receives.
     * This method is like `_.bind` except it does not alter the this binding.
     *
     * @param {Function} func  The function to partially apply arguments to.
     * @param {...any} partials The arguments to be partially applied.
     * @return {Function} Returns the new partially applied function.
     * @memberof underscore
     */
    function partial (func) {
        return func.bind.apply(func, slice(arguments));
    }

    /**
     * This method is like `_.partial` except that partially applied arguments are appended to the arguments it receives.
     *
     * @param {Function} func  The function to partially apply arguments to.
     * @param {...any} partials The arguments to be partially applied.
     * @return {Function} Returns the new partially applied function.
     * @memberof underscore
     */
    function partialRight (func) {
        var placeholders = slice(arguments);
        placeholders.shift();
        return function () {
            var args = slice(arguments);
            var spliceArgs = [args, arguments.length, 0].concat(placeholders);
            splice.apply(null, spliceArgs);
            return func.apply(null, args);
        };
    }

    /**
     * Creates a function that provides value to wrapper as its first argument.
     * Any additional arguments provided to the function are appended to those provided to the wrapper. The wrapper is invoked with the this binding of the created function.\
     *
     * @param  {*}        value    The value to wrap.
     * @param  {Function} wrapper  The wrapper function.
     * @return {Function}          Returns the new function.
     * @memberof underscore
     */
    function wrap (value, wrapper) {
        assert((typeof wrapper === 'function'), 'wrapper should be a function');
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(value);
            return wrapper.apply(this, args);
        };
    }

    /**
     * 为类型构造器建立继承关系
     *
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @return {Function}
     * @memberof underscore
     */
    function inherits (subClass, superClass) {
        /**
         * Temperary class
         *
         * @private
         * @class
         */
        var Empty = function () {};
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();

        for (var key in selfPrototype) {
            if (selfPrototype.hasOwnProperty(key)) {
                proto[key] = selfPrototype[key];
            }
        }
        subClass.prototype.constructor = subClass;

        return subClass;
    }

    // objectect Related
    exports.keysIn = keysIn;
    exports.keys = keys;
    exports.get = get;
    exports.set = set;
    exports.has = has;
    exports.forOwn = forOwn;
    exports.assign = assign;
    exports.clone = clone;
    exports.cloneDeep = cloneDeep;
    exports.merge = assign;
    exports.extend = assign;
    exports.defaults = defaults;
    exports.defaultsDeep = defaultsDeep;
    exports.fromPairs = fromPairs;

    // Array Related
    exports.slice = slice;
    exports.splice = splice;
    exports.forEach = forEach;
    exports.filter = filter;
    exports.map = map;
    exports.reduce = reduce;
    exports.toArray = toArray;
    exports.findIndex = findIndex;

    // String Related
    exports.split = split;
    exports.format = format;

    // Lang Related
    exports.isArray = isArray;
    exports.isFunction = isFunction;
    exports.isEmpty = isEmpty;
    exports.isString = isString;
    exports.isObject = isObject;
    exports.isArrayLike = isArrayLike;
    exports.isLength = isLength;
    exports.isRegExp = isRegExp;
    exports.inherits = inherits;
    exports.contains = contains;
    exports.noop = function () {};

    // Function Related
    exports.partial = partial;
    exports.partialRight = partialRight;
    exports.negate = negate;
    exports.wrap = wrap;

    return exports;
});

define('@searchfe/underscore', ['@searchfe/underscore/src/index'], function (mod) { return mod; });
;/*!src/utils/debounce.js*/
/**
 * @file   debounce.js
 * @author oott123
 */

define('iframe-shell/utils/debounce', ['require'], function (require) {
    return function (func, wait) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            var later = function () {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
});

;/*!src/viewer.js*/
/**
 * @file   提供 iframe-shell/viewer 模块。
 * @author oott123
 */

define('iframe-shell/viewer', ['iframe-shell/utils/debounce'], function (debounce) {

    /**
     * 渲染一个 iframe 加载 mip 页
     *
     * @constructor
     * @exports iframe-shell/viewer
     * @param  {Object}     config               iframe viewer 配置
     * @param  {DOMElement} [config.target]      渲染 iframe 的目标容器；默认为 body
     * @param  {string}     [config.src]         目标 url 的原始地址
     * @param  {string}     [config.height]      viewer height；默认 100%
     */
    var Viewer = function (config) {
        config = config || {};
        if (!config.target) {
            config.target = document.body;
        }
        if (!config.src) {
            config.src = '';
        }
        this.config = {};
        this.setConfig(config);
        this.name = 'iframe-shell-' + Math.random().toString(36).slice(2);
        var iframeElement = document.createElement('iframe');
        iframeElement.setAttribute('name', this.name);
        iframeElement.setAttribute('data-mip-loader', 'view');
        iframeElement.setAttribute('scrolling', 'yes');
        iframeElement.setAttribute('sandbox', [
            'allow-top-navigation',
            'allow-popups',
            'allow-scripts',
            'allow-forms',
            'allow-pointer-lock',
            'allow-popups-to-escape-sandbox',
            'allow-same-origin',
            'allow-modals'
        ].join(' '));
        Object.assign(iframeElement.style, {
            width: '100%',
            height: this.config.height || '100%',
            border: 'none'
        });
        /**
         * 加载 mip 页的 iframe 元素
         *
         * @public
         * @type {DOMElement}
         */
        this.iframe = iframeElement;
        var resizeLisenter = function () {
            // console.log('resize');
            this.render();
        };
        this.resizeLisenter = debounce(resizeLisenter.bind(this), 50);
        return this;
    };
    Viewer.prototype = {
        constructor: Viewer,

        /**
         * 获得或设置配置
         *
         * @public
         * @param  {Object}     [conf]           要传入的 config；不带参数则只获取 config
         * @param  {DOMElement} conf.target      渲染目标节点
         * @param  {string}     conf.src         要渲染的 url
         * @param  {Function}   conf.errorHander 要设置的错误处理函数
         * @return {Object}                      修改后的 config
         */
        setConfig: function (conf) {
            conf = conf || {};
            if (conf.target) {
                this.config.target = conf.target;
            }
            if (conf.src && this.config.src !== conf.src) {
                this.config.src = conf.src;
                this.srcUpdated = true;
            }
            if ((typeof conf.errorHandler) === 'function') {
                this.errorHandler = conf.errorHandler;
            }
            if (this.config.height !== conf.height) {
                if (this.iframe) {
                    this.iframe.style.height = conf.height;
                }
                this.config.height = conf.height;
            }
            return this.config;
        },

        /**
         * 创建一个 iframe ，但不将其加入 dom 树。
         * 若 iframe 尚不存在，将新建；若已存在，将更新之，并将调整其尺寸到合适大小。
         *
         * @public
         */
        render: function () {
            if (this.config.src) {
                if (this.srcUpdated) {
                    this.iframe.src = this.config.src;
                    this.srcUpdated = false;
                }
                // 如果当前有设置，但是又不太对，就缩放一下
                if (!this.config.height || this.iframe.style.height !== this.config.height) {
                    this.iframe.style.height = '' + this.config.target.clientHeight + 'px';
                }
            }
        },

        /**
         * 将 iframe 加入 dom 树并显示。
         *
         * @public
         */
        attach: function () {
            if (this._attached) {
                return;
            }
            this._attached = true;
            this.iframe.style.display = 'block';
            if (!this.inDom()) {
                this.config.target.appendChild(this.iframe);
            }
            window.addEventListener('resize', this.resizeLisenter);
            this.iframe.addEventListener('error', this.errorHandler);
        },

        inDom: function () {
            return this.iframe.parentElement === this.config.target;
        },

        /**
         * 将 iframe 从 dom 树移除或隐藏。
         *
         * @param {boolean} removeFromDom 是否真正从 dom 移除
         * @public
         */
        detach: function (removeFromDom) {
            if (removeFromDom && this.inDom()) {
                this.config.target.removeChild(this.iframe);
            }
            if (!this._attached) {
                return;
            }
            this._attached = false;
            this.iframe.style.display = 'none';
            window.removeEventListener('resize', this.resizeLisenter);
            this.iframe.removeEventListener('error', this.errorHandler);
        },

        /**
         * 销毁 view
         *
         * @public
         */
        destroy: function () {
            this.detach(true);
            this.iframe = null;
        },

        /**
         * 错误处理函数
         * 可被替换成自己的错误处理函数
         *
         * @abstract
         * @param  {Error} err 接受到的错误
         */
        errorHandler: function (err) {
            console.error(err);
        }
    };
    return Viewer;
});

;/*!node_modules/micro-event/dist/micro-event.js*/
'use strict';

(function () {
    function Emitter() {
        var e = Object.create(emitter);
        e.events = {};
        return e;
    }

    function Event(type) {
        this.type = type;
        this.timeStamp = new Date();
    }

    var emitter = {};

    emitter.on = function (type, handler) {
        if (this.events.hasOwnProperty(type)) {
            this.events[type].push(handler);
        } else {
            this.events[type] = [handler];
        }
        return this;
    };

    emitter.off = function (type, handler) {
        if (arguments.length === 0) {
            return this._offAll();
        }
        if (handler === undefined) {
            return this._offByType(type);
        }
        return this._offByHandler(type, handler);
    };

    emitter.trigger = function (event, args) {
        if (!(event instanceof Event)) {
            event = new Event(event);
        }
        return this._dispatch(event, args);
    };

    emitter._dispatch = function (event, args) {
        if (!this.events.hasOwnProperty(event.type)) return;
        args = args || [];
        args.unshift(event);

        var handlers = this.events[event.type] || [];
        handlers.forEach(function (handler) {
            return handler.apply(null, args);
        });
        return this;
    };

    emitter._offByHandler = function (type, handler) {
        if (!this.events.hasOwnProperty(type)) return;
        var i = this.events[type].indexOf(handler);
        if (i > -1) {
            this.events[type].splice(i, 1);
        }
        return this;
    };

    emitter._offByType = function (type) {
        if (this.events.hasOwnProperty(type)) {
            delete this.events[type];
        }
        return this;
    };

    emitter._offAll = function () {
        this.events = {};
        return this;
    };

    Emitter.Event = Event;

    Emitter.mixin = function (obj, arr) {
        var emitter = new Emitter();
        arr.map(function (name) {
            obj[name] = function () {
                return emitter[name].apply(emitter, arguments);
            };
        });
    };

    // CommonJS
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Emitter;
    }
    // Browser
    else if (typeof define === 'function' && define.amd) {
            define('iframe-shell/deps/node_modules/micro-event/dist/micro-event', ['require'], function (require) {
                return Emitter;
            });
        } else {
            window.Emitter = Emitter;
        }
})();


;/*!src/utils/event.js*/
/**
 * 一个简单的事件机制
 *
 * @file   event.js
 * @author oott123
 */

define('iframe-shell/utils/event', ['iframe-shell/deps/node_modules/micro-event/dist/micro-event'], function (Emmiter) {
    return function (targetInstance) {
        Emmiter.mixin(targetInstance, ['on', 'off', 'trigger']);
    };
});

;/*!src/utils/promise.js*/
/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 标准： Promises/A+ https://promisesaplus.com/
 */

define('iframe-shell/utils/promise', ['require'], function(require) {
    function Promise(cb) {
        if (!(this instanceof Promise)) {
            throw 'Promise must be called with new operator';
        }
        if (typeof cb !== 'function') {
            throw 'callback not defined';
        }

        this._handlers = [];
        this._state = 'init'; // Enum: init, fulfilled, rejected
        this._errors = [];
        this._results = [];

        // 标准：Promises/A+ 2.2.4, see https://promisesaplus.com/
        // In practice, this requirement ensures that
        //   onFulfilled and onRejected execute asynchronously,
        //   after the event loop turn in which then is called,
        //   and with a fresh stack.
        setTimeout(function() {
            cb(this._onFulfilled.bind(this), this._onRejected.bind(this));
        }.bind(this));
    }

    /*
     * 注册Promise成功的回调
     * @param cb 回调函数
     */
    Promise.prototype.then = function(cb) {
        //console.log('calling then', this._state);
        if (this._state === 'fulfilled') {
            //console.log(this._state);
            this._callHandler(cb, this._results);
        } else {
            this._handlers.push({
                type: 'then',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise失败的回调
     * @param cb 回调函数
     */
    Promise.prototype.catch = function(cb) {
        if (this._state === 'rejected') {
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'catch',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise最终的回调
     * @param cb 回调函数
     */
    Promise.prototype.finally = function(cb) {
        if (this._state === 'fulfilled') {
            this._callHandler(cb, this._results);
        } else if (this._state === 'rejected') {
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'finally',
                cb: cb
            });
        }
    };
    /*
     * 返回一个成功的Promise
     * @param obj 被解析的对象
     */
    Promise.resolve = function(obj) {
        var args = arguments;
        return _isThenable(obj) ? obj :
            new Promise(function(resolve, reject) {
                return resolve.apply(null, args);
            });
    };
    /*
     * 返回一个失败的Promise
     * @param obj 被解析的对象
     */
    Promise.reject = function(obj) {
        var args = arguments;
        return new Promise(function(resolve, reject) {
            return reject.apply(null, args);
        });
    };
    /*
     * 返回一个Promise，当数组中所有Promise都成功时resolve，
     * 数组中任何一个失败都reject。
     * @param promises Thenable数组，可以包含Promise，也可以包含非Thenable
     */
    Promise.all = function(promises) {
        var results = promises.map(function() {
            return undefined;
        });
        var count = 0;
        var state = 'pending';
        return new Promise(function(res, rej) {
            function resolve() {
                if (state !== 'pending') return;
                state = 'fulfilled';
                res(results);
            }

            function reject() {
                if (state !== 'pending') return;
                state = 'rejected';
                rej.apply(null, arguments);
            }
            promises
                .map(Promise.resolve)
                .forEach(function(promise, idx) {
                    promise
                        .then(function(result) {
                            results[idx] = result;
                            count++;
                            if (count === promises.length) resolve();
                        })
                        .catch(reject);
                });
        });
    };

    Promise.prototype._onFulfilled = function(obj) {
        //console.log('_onFulfilled', obj);
        if (_isThenable(obj)) {
            return obj
                .then(this._onFulfilled.bind(this))
                .catch(this._onRejected.bind(this));
        }

        this._results = arguments;
        var handler = this._getNextHandler('then');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        this._state = 'fulfilled';
    };
    Promise.prototype._onRejected = function(err) {
        //console.log('_onRejected', err);
        this._errors = arguments;
        var handler = this._getNextHandler('catch');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        this._state = 'rejected';
    };
    Promise.prototype._callHandler = function(handler, args) {
        //console.log('calling handler', handler, args);
        var result, err = null;
        try {
            result = handler.apply(null, args);
        } catch (e) {
            err = e;
        }
        if (err) {
            this._onRejected(err);
        } else {
            this._onFulfilled(result);
        }
    };
    Promise.prototype._getNextHandler = function(type) {
        var obj;
        while (obj = this._handlers.shift()) {
            if (obj.type === type) break;
        }
        return obj ? obj.cb : null;
    };

    function _isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }

    return Promise;
});

;/*!src/utils/extend.js*/
/**
 * Extend object
 *
 * @file
 * @author oott123
 */

define('iframe-shell/utils/extend', ['require'], function (require) {
    var hasProp = {}.hasOwnProperty;
    return function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
    };
});

;/*!src/messenger.js*/
/**
 * @file   提供 iframe-shell/messenger 模块。
 * @author oott123
 */

define('iframe-shell/messenger', ['iframe-shell/utils/event', 'iframe-shell/utils/promise', 'iframe-shell/utils/extend'], function (wrapEvent, Promise, extend) {
    var messageTypes = {
        twoWay: 'two-way'
    };
    var messageSentinels = {
        request: 'PM_REQUEST',
        response: 'PM_RESPONSE'
    };
    function getSessionId() {
        return ((new Date()).getTime() * 1000 + Math.ceil(Math.random() * 1000)).toString(36);
    }
    var messengerInstances = {};

    /**
     * iframe - window 单双向通信组件
     *
     * @constructor
     * @exports iframe-shell/messenger
     * @param {Object} config 实例参数
     * @param {Window} config.targetWindow  通信对端窗口（iframe; parent; top）
     * @param {string} config.targetOrigin  通信对端允许接收的 Origin
     * @param {string} config.sourceOrigins 允许的通信来源 Origin 列表
     * @param {number} config.timeout       双向通信回复超时(ms)
     * @param {string} config.name          若对端为 iframe，则填写 iframe.name；若对端为 parent，则填写 window.name(即父窗口的 iframe.name)
     */
    var Messenger = function (config) {
        wrapEvent(this);
        this.targetWindow = config.targetWindow || top;
        this.targetOrigin = config.targetOrigin || '*';
        this.sourceOrigins = config.sourceOrigins || ['*'];
        this.timeout = config.timeout || 500;
        this.name = config.name || window.name;

        /**
         * 存放回调处理函数 sessionId -> Object
         *
         * @private
         * @type    {Object}
         * @example {resolve: function, reject: function, timer: timerId}
         */
        this.defers = {};

        /**
         * 存放双向通信处理函数 eventName -> function
         *
         * @private
         * @type {Object}
         */
        this.handlers = {};

        if (messengerInstances[this.name]) {
            console.warn(
                'The old messenger created for target %O will be replaced by the new one.',
                this.name
            );
        }
        messengerInstances[this.name] = this;
        Messenger.bindHandler();
        return this;
    };
    var messageReciver = function (event) {
        // 寻找对应的 messenger 实例
        var messenger = messengerInstances[event.data.name];
        if (!messenger) {
            // console.warn('A window with no messengers is sending message', event);
            // 兼容老 mip，没有给名字
            for (var x in messengerInstances) {
                messengerInstances[x].processMessageEvent(event);
            }
        }
        else {
            messenger.processMessageEvent(event);
        }
    };
    Messenger.bindHandler = function () {
        window.removeEventListener('message', messageReciver);
        window.addEventListener('message', messageReciver);
    };
    Messenger.prototype = {

        /**
         * 处理消息事件
         *
         * @protected
         * @param  {MessageEvent} event 收到的 message event
         */
        processMessageEvent: function (event) {
            var origin = event.origin || event.originalEvent.origin;
            var messenger = this;
            // 检查 origin 是否安全
            var isSafe = false;
            for (var i = 0; i < messenger.sourceOrigins.length; i++) {
                var safeOrigin = messenger.sourceOrigins[i];
                if (safeOrigin === '*') {
                    isSafe = true;
                    break;
                }
                if (safeOrigin === origin) {
                    isSafe = true;
                    break;
                }
            }
            if (!isSafe) {
                console.warn('Origin ' + origin + ' is not safe, ignore event', event);
                return;
            }
            // 检查单双向
            var eventData = event.data;
            if (!eventData) {
                console.warn('Event data %O is invalid, missing data.', event);
                return;
            }
            // console.log(eventData);
            if (eventData.type === messageTypes.twoWay) {
                if (!eventData.sentinel || !eventData.sessionId) {
                    console.warn('Event data %O is invalid, missing sentinel or/and sessionId.', eventData);
                    return;
                }
                // 检查请求 or 回复
                if (eventData.sentinel === messageSentinels.request) {
                    // 检查是否有对应的 handler
                    var response = {};
                    if (messenger.handlers[eventData.event]) {
                        try {
                            response = messenger.handlers[eventData.event].call(messenger, eventData);
                        }
                        catch (err) {
                            response = {
                                error: err
                            };
                        }
                    }
                    else {
                        console.warn('Event ' + eventData.event + ' has no handler.');
                    }
                    var send = function (response) {
                        response = response || {};
                        extend(response, {
                            type: messageTypes.twoWay,
                            sentinel: messageSentinels.response,
                            sessionId: eventData.sessionId,
                            name: messenger.name
                        });
                        messenger.getWindow().postMessage(response, messenger.targetOrigin);
                    };
                    // 检查 promise
                    if (response && (typeof response.then) === 'function') {
                        response.then(function (response) {
                            send(response);
                        })
                        .catch(function (err) {
                            send({
                                error: err
                            });
                        });
                    }
                    else {
                        send(response);
                    }
                }
                else if (eventData.sentinel === messageSentinels.response) {
                    // 回复
                    console.log('response!', eventData);
                    var d = messenger.defers[eventData.sessionId];
                    delete messenger.defers[eventData.sessionId];
                    if (!d) {
                        console.warn('Event session is not found for two-way communication', eventData.sessionId);
                        return;
                    }
                    clearTimeout(d.timer);
                    if (eventData.error) {
                        d.reject(eventData.error);
                    }
                    else {
                        d.resolve(eventData);
                    }
                }
                else {
                    console.warn('Event sentinel is invalid ', eventData.sentinel);
                }
            }
            else {
                // 单向
                if (!eventData || !eventData.event) {
                    console.warn('Event data %O is invalid, missing event name.', eventData);
                    return;
                }
                messenger.trigger(eventData.event, [eventData]);
                messenger.trigger('recivemessage', [eventData]);
            }
        },

        /**
         * 给绑定的窗口发送消息
         *
         * @public
         * @param  {string}  eventName    消息名
         * @param  {Object}  data         消息数据；必须为 object
         * @param  {boolean} waitResponse 是否为双向消息（等待回复）
         * @return {Promise}              若为双向消息，则返回后 resolve；否则直接 resolve
         */
        sendMessage: function (eventName, data, waitResponse) {
            var messenger = this;
            return new Promise(function (resolve, reject) {
                var requestData = {
                    name: messenger.name,
                    event: eventName
                };
                var sessionId = getSessionId();
                if (waitResponse) {
                    extend(requestData, {
                        type: messageTypes.twoWay,
                        sentinel: messageSentinels.request,
                        sessionId: sessionId
                    });
                    messenger.defers[sessionId] = {
                        resolve: resolve.bind(this),
                        reject: reject.bind(this),
                        timer: setTimeout(function () {
                            delete messenger.defers[sessionId];
                            reject(new Error('timeout'));
                        }, messenger.timeout)
                    };
                }
                else {
                    setTimeout(resolve, 0);
                }
                extend(requestData, data);
                // 对于单向通信：requestData = {event, ...}
                // 对于双向通信：requestData = {event, type, sentinel, sessionId, ...}
                messenger.getWindow().postMessage(requestData, messenger.targetOrigin);
            });
        },

        /**
         * 设置双向消息处理函数
         *
         * @public
         * @param {string}   eventName 消息名字
         * @param {Function} fn        处理函数（return object or promise which solves with object）
         */
        setHandler: function (eventName, fn) {
            if ((typeof fn) !== 'function') {
                throw new Error('Invalid handler for event ' + eventName);
            }
            this.handlers[eventName] = fn;
        },

        /**
         * 移除双向消息处理函数
         *
         * @public
         * @param  {string}   eventName 消息名字
         */
        removeHandler: function (eventName) {
            this.handlers[eventName] = undefined;
        },

        /**
         * 销毁消息处理器
         *
         * @public
         */
        destory: function () {
            delete messengerInstances[this.name];
        },

        getWindow: function () {
            if (this.targetWindow instanceof HTMLIFrameElement) {
                return this.targetWindow.contentWindow;
            }
            return this.targetWindow;
        }
    };
    Messenger.prototype.constructor = Messenger;
    return Messenger;
});

;/*!src/loader.js*/
/**
 * @file   提供 iframe-shell/loader 模块。
 * @author oott123
 */

define('iframe-shell/loader',
    ['iframe-shell/viewer', 'iframe-shell/messenger', 'iframe-shell/utils/event', 'iframe-shell/utils/extend'],
function (DefaultViewer, Messenger, wrapEvent, extend) {
    var currentScheme = location.protocol === 'https:' ? 'https:' : 'http:';
    var isHttps = function (url) {
        url = '' + url;
        if (url.indexOf('//') === 0) {
            return true;
        }
        return (url.indexOf('https://') === 0);
    };

    var mipCacheUrl = currentScheme + '//mipcache.bdstatic.com/c/';
    var isMipCachedUrl = function (url) {
        url = '' + url;
        return !!url.match(/^(https?:)?\/\/mipcache\.bdstatic\.com\/c\//);
    };
    var getMipCachedUrl = function (url) {
        var pieces = url.split('//');
        pieces.shift();
        var plainUrl = pieces.join('//');
        if (isHttps(url)) {
            return mipCacheUrl + 's/' + plainUrl;
        }
        return mipCacheUrl + plainUrl;
    };

    /**
     * iframe-shell 加载器
     *
     * @constructor
     * @exports iframe-shell/loader
     * @param  {Object}  config             加载器配置
     * @param  {string}  config.url         要加载的 url
     * @param  {boolean} config.useMipCache 是否使用 mip cache 加载
     * @param  {Object}  config.viewer      Viewer 配置(see Viewer.setConfig)
     * @param  {Viewer}  [Viewer]           要使用的 Viewer 类
     * @return {Loader}
     */
    var Loader = function (config, Viewer) {
        wrapEvent(this);
        this.config = config || {};
        this.Viewer = Viewer || DefaultViewer;
        return this;
    };
    Loader.prototype = {

        /**
         * 获取最终 url
         *
         * @protected
         * @return {string} 返回最终用于加载 iframe 的 url
         */
        getFinalUrl: function () {
            var url = this.config.url || '';
            if (!url) {
                return url;
            }
            if (isMipCachedUrl(url)) {
                return url;
            }
            var useMipCache = this.config.useMipCache;
            if (!useMipCache && currentScheme === 'https:' && !isHttps(url)) {
                // useMipCache = true;
            }
            if (useMipCache) {
                return getMipCachedUrl(url);
            }
            return url;
        },

        /**
         * 转换相对 url 到绝对 url
         * 仅支持 //domain/path 形式转换为完整的 protocol://domain/path
         *
         * @public
         * @param  {string} url 要转换的 url
         * @return {string}     转换后的 url
         */
        getRelativeUrl: function (url) {
            var oldUrl = this.config.url;
            if (url.indexOf('//') === 0) {
                var protocol = oldUrl.match(/(^.*:)\/\//);
                if (protocol) {
                    protocol = protocol[1];
                }
                else {
                    protocol = location.protocol;
                }
                url = protocol + url;
            }
            /*else if (url.indexOf('/') === 0) {
                // 相对路径
                var a = document.createElement('a');
                a.href = oldUrl;
                url = a.protocol + '//' + a.host + url;
            }*/
            return url;
        },

        /**
         * 获取 viewer 配置项
         *
         * @private
         * @return {Object}  生成的 viewer 配置（带 src）
         */
        getViewerConfig: function () {
            var viewerConfig = {};
            extend(viewerConfig, this.config.viewer || {});
            viewerConfig.src = this.getFinalUrl();
            viewerConfig.errorHandler = this.errorHandler.bind(this);
            return viewerConfig;
        },

        /**
         * 获取所有的双向消息处理器
         * 第三方若需增加自己的消息处理器，可以重写这个方法。
         *
         * @return {object} eventName -> handler function
         */
        getMessageHandlers: function () {
            if (this.messageHandlers) {
                return this.messageHandlers;
            }
            var loader = this;
            this.messageHandlers = {};
            return this.messageHandlers;
        },

        /**
         * 附加消息处理器
         * 内部使用方法；将 getMessageHandlers 中获取的消息处理器附加到 messenger 上。
         *
         * @see  getMessageHandlers
         * @private
         */
        attachMessageHandlers: function () {
            var handlers = this.getMessageHandlers();
            for (var x in handlers) {
                this.messenger.setHandler(x, handlers[x]);
            }
            var loader = this;
            this.allMessageHandler = function (_, event) {
                if (handlers[event.event]) {
                    handlers[event.event](event);
                }
                loader.trigger('mip-' + event.event, [event]);
            };
            this.messenger.on('recivemessage', this.allMessageHandler);
        },

        /**
         * 移除消息处理器
         * 内部使用方法；将 getMessageHandlers 中获取的消息处理器从 messenger 上移除。
         *
         * @see getMessageHandlers
         * @private
         */
        detachMessageHandlers: function () {
            var handlers = this.getMessageHandlers();
            for (var x in handlers) {
                this.messenger.removeHandler(x);
            }
            this.messenger.off('recivemessage', this.allMessageHandler);
        },

        /**
         * 错误处理函数
         * 需要被替换成自己的错误处理
         *
         * @abstract
         * @param  {Error} err 接收到的错误
         */
        errorHandler: function (err) {
            console.log(err);
        },

        /**
         * 设置 loader 配置
         *
         * @public
         * @param {Object}  conf       配置格式同构造器
         * @param {boolean} skipUpdate 是否跳过触发更新
         */
        setConfig: function (conf, skipUpdate) {
            extend(this.config, conf);
            if (!skipUpdate) {
                this.update();
            }
        },

        /**
         * 创建一个 loader。对每个实例而言， 只应在被构造时执行一次。
         *
         * @public
         */
        create: function () {
            if (this._created || this._destoyed) {
                return;
            }
            this._created = true;
            this.trigger('create');
            this.viewer = new this.Viewer(this.getViewerConfig());
            this.messenger = new Messenger({
                targetWindow: this.viewer.iframe,
                name: this.viewer.name
            });
            this._iframeCompleted = false;
            var triggerComplete = this.triggerComplete.bind(this);
            this.viewer.iframe.addEventListener('load', triggerComplete);
            this.on('mip-performance_update', triggerComplete);
            this.on('mip-mippageload', triggerComplete);
            this.trigger('created');
        },

        /**
         * 将一个 mip 页附加到网页上，以展现给用户。此时绑定所有与用户操作相关的事件处理函数。
         *
         * @public
         */
        attach: function () {
            if (this._attached) {
                return;
            }
            this._attached = true;
            this.trigger('attach');
            this.viewer.attach();
            this.attachMessageHandlers();
            this.viewer.render();
            this.trigger('attached');
        },

        /**
         * 配置被更新后，重新渲染 mip 页的 iframe。此时按需更新 iframe 的尺寸和 url。
         *
         * @public
         */
        update: function () {
            if (!this._created) {
                return;
            }
            this.trigger('update');
            this.viewer.setConfig(this.getViewerConfig());
            this.viewer.render();
            this.trigger('updated');
        },

        /**
         * 将一个 mip 页从网页上移除，使用户不可见。此时解绑所有与用户操作相关的事件处理函数。
         *
         * @public
         */
        detach: function () {
            if (!this._attached) {
                return;
            }
            this._attached = false;
            this.trigger('detach');
            this.detachMessageHandlers();
            this.viewer.detach();
            this.trigger('detached');
        },

        /**
         * 销毁一个 mip 页实例。销毁后，该实例将不能再被 attach 到网页上，也不能再复用；若已被 attach，则会自动先 detach 再 执行 destory。
         *
         * @public
         */
        destroy: function () {
            if (!this._created || this._destoyed) {
                return;
            }
            if (this._attached) {
                this.detach();
            }
            this._destoyed = true;
            this.trigger('destroy');
            this.messenger.destory();
            this.viewer.destroy();
            this.viewer = null;
            this._iframeCompleted = false;
            this.trigger('destroyed');
        },

        triggerComplete: function () {
            if (this._iframeCompleted) {
                return;
            }
            this.trigger('complete');
            this._iframeCompleted = true;
        }
    };
    Loader.prototype.constructor = Loader;
    return Loader;
});

;/*!src/index.js*/
/**
 * @file   提供入口模块。
 * @author oott123
 */

define('iframe-shell', ['require', 'iframe-shell/loader', 'iframe-shell/messenger', 'iframe-shell/viewer'], function (require) {
    return {
        loader: require('iframe-shell/loader'),
        messenger: require('iframe-shell/messenger'),
        Messenger: require('iframe-shell/messenger'),
        viewer: require('iframe-shell/viewer')
    };
});
;
/**
 * @file action.js
 * @author harttle<harttle@harttle.com>
 */

define('ralltiir/src/action', ['require', 'ralltiir/src/utils/cache', '@searchfe/promise', '@searchfe/assert', 'ralltiir/src/utils/logger', '@searchfe/underscore', 'ralltiir/src/utils/dom', 'ralltiir/src/utils/url'], function (require) {
    /**
     * @module action
     */

    var cache = require('ralltiir/src/utils/cache');
    var Promise = require('@searchfe/promise');
    var assert = require('@searchfe/assert');
    var logger = require('ralltiir/src/utils/logger');
    var _ = require('@searchfe/underscore');
    var dom = require('ralltiir/src/utils/dom');
    var URL = require('ralltiir/src/utils/url');

    function actionFactory(router, location, history, doc, Emitter, services) {
        var exports = new Emitter();
        var pages;
        var backManually;
        var indexPageUrl;
        var isIndexPage;
        var pageId;
        var config = {};

        // The state data JUST for the next dispatch
        var stageData = {};
        var dispatchQueue = mkDispatchQueue();

        function createPages() {
            var pages = cache.create('pages', {
                onRemove: function (page, url, evicted) {
                    if (_.isFunction(page.onRemove)) {
                        page.onRemove(url, evicted);
                    }
                },
                limit: 1000000
            });
            function normalizeKey(fn, thisArg) {
                return function (url) {
                    arguments[0] = (url || '').replace(/#.*$/, '');
                    return fn.apply(thisArg, arguments);
                };
            }
            pages.get = normalizeKey(pages.get, pages);
            pages.set = normalizeKey(pages.set, pages);
            pages.contains = normalizeKey(pages.contains, pages);
            return pages;
        }

        function getCurrPageUrl() {
            return location.pathname + location.search;
        }

        /**
         * This is provided to reset closure variables which defines the inner state.
         *
         * @private
         */
        exports.init = function () {
            exports.started = false;
            services.init(this.dispatch);
            exports.pages = pages = createPages();
            backManually = false;
            config = {
                root: '/',
                visitedClassName: 'visited'
            };
            indexPageUrl = '/';
            isIndexPage = true;
            pageId = 0;
        };

        /**
         * Get the stage data being passed to next dispatch
         *
         * @private
         * @return {Object} current state
         */
        exports.getState = function () {
            return stageData;
        };

        /**
         *  Register a service instance to action
         *
         *  @static
         *  @param {string|RestFul|RegExp} pathPattern The path of the service
         *  @param {Object} service The service object to be registered
         *  @example
         *  action.regist('/person', new Service());
         *  action.regist('/person/:id', new Service());
         *  action.regist(/^person\/\d+/, new Service());
         * */
        exports.regist = function (pathPattern, service) {
            assert(pathPattern, 'invalid path pattern');
            assert(service, 'invalid service');
            service.singleton = true;
            services.register(pathPattern, null, service);
        };

        /**
         * Un-register a service by path
         *
         * @param {string|RestFul|RegExp} pathPattern The path of the service
         */
        exports.unregist = function (pathPattern) {
            services.unRegister(pathPattern);
        };

        /**
         *  Switch from the previous service to the current one.
         *  Call `prev.detach`, `prev.destroy`,
         *  `current.create`, `current.attach` in serial.
         *  Typically called by the Router,
         *  you may not want to call dispatch manually.
         *
         *  If any of these callbacks returns a `Thenable`, it'll be await.
         *  If the promise is rejected, the latter callbacks will **NOT** be called.
         *
         *  Returns a promise that
         *  resolves if all callbacks executed without throw (or reject),
         *  rejects if any of the callbacks throwed or rejected.
         *
         *  Note: If current and prev is the same service,
         *  the `prev.destroy` will **NOT** be called.
         *
         *  @static
         *  @param {Object} current The current scope
         *  @param {Object} prev The previous scope
         *  @return {Promise}
         * */
        exports.dispatch = function (current, prev) {
            assert(current, 'cannot dispatch with options:' + current);

            var src = _.get(current, 'options.src');

            var prevService = services.getOrCreate(prev.url, prev.pathPattern);
            prev.service = prevService;
            var currentService = services.getOrCreate(
                current.url,
                current.pathPattern,
                // 是 redirect 或 hijack
                src !== 'history' && src !== 'back'
            );
            current.service = currentService;

            if (!pages.contains(current.url)) {
                pages.set(current.url, {
                    id: pageId,
                    isIndex: isIndexPage
                });
            }
            current.page = pages.get(current.url);
            prev.page = pages.get(prev.url);

            var data = stageData;
            stageData = {};

            if (backManually) {
                backManually = false;
                current.options.src = 'back';
            }

            // mark initial page
            if (current.options && current.options.src === 'sync') {
                indexPageUrl = current.url || '/';
            }
            else {
                isIndexPage = false;
            }

            logger.log('action dispatching to: ' + current.url);
            exports.emit('dispatching', {
                current: current,
                previous: prev,
                extra: stageData
            });

            doc.ensureAttached();
            // Abort currently the running dispatch queue,
            // and initiate a new one.
            return dispatchQueue.reset([
                function prevDetach() {
                    if (!prevService) {
                        return;
                    }
                    return prevService.singleton
                        ? prevService.detach(current, prev, data)
                        : prevService.beforeDetach(current, prev, data);
                },
                function currCreate() {
                    if (!currentService) {
                        return;
                    }
                    return currentService.singleton
                        ? currentService.create(current, prev, data)
                        : currentService.beforeAttach(current, prev, data);
                },
                function prevDestroy() {
                    if (!prevService) {
                        return;
                    }
                    return prevService.singleton
                        ? prevService.destroy(current, prev, data)
                        : prevService.detach(current, prev, data);
                },
                function currAttach() {
                    if (!currentService) {
                        return;
                    }
                    return currentService.attach(current, prev, data);
                }
            ]).exec(function currAbort() {
                if (currentService && currentService.abort) {
                    currentService.abort(current, prev, data);
                }
            }, function errorHandler(e) {
                // eslint-disable-next-line
                console.error(e);
                if (_.get(current, 'options.src') !== 'sync') {
                    location.replace(location.href);
                }
            });
        };

        /**
         * Check if currently in initial page
         *
         * @return {boolean} whether current page is the index page
         */
        exports.isIndexPage = function () {
            return isIndexPage;
        };

        /**
         * Execute a queue of functions in serial, and previous execution will be stopped.
         * This is a singleton closure containing current execution queue and threadID.
         *
         * A thread (implemented by mapSeries) will be initiated for each execution.
         * And anytime there's a new thread initiating, the previous threads will stop running.
         *
         * @return {Object} DispatchQueue interfaces: {reset, exec}
         * @private
         */
        function mkDispatchQueue() {
            // Since we cannot quit a promise, there can be multiple threads running, actually.
            var MAX_THREAD_COUNT = 10000;
            // This is the ID of the currently running thread
            var threadID = 0;
            var lastAbortCallback;
            var queue = [];
            var exports = {
                reset: reset,
                exec: exec,
                aborted: false
            };

            /**
             * When reset called, a thread containing a queue of functions is initialized,
             * and latter functions in last thread will be ommited.
             *
             * @param {Array} q the tasks to be queued
             * @return {Object} The DispatchQueue object
             */
            function reset(q) {
                queue = q;
                threadID = (threadID + 1) % MAX_THREAD_COUNT;
                return exports;
            }

            /**
             * When exec called, current queue is executed in serial,
             * and a promise for the results of the functions is returned.
             *
             * @param {Function} abortCallback The callback to be called when dispatch aborted
             * @param {Function} errorHandler The callback to be called when error occurred
             * @return {Promise} The promise to be resolved when all tasks completed
             */
            function exec(abortCallback, errorHandler) {
                // Record the thread ID for current thread
                // To ensure there's ONLY ONE thread running.
                var thisThreadID = threadID;
                if (_.isFunction(lastAbortCallback)) {
                    lastAbortCallback();
                }
                lastAbortCallback = abortCallback;
                return Promise.mapSeries(queue, function (cb) {
                    if (typeof cb !== 'function') {
                        return;
                    }
                    // Just stop running
                    if (thisThreadID !== threadID) {
                        return;
                    }
                    logger.log('calling lifecycle', cb.name || 'anonymous');
                    return cb();
                })
                .catch(errorHandler)
                .then(function () {
                    lastAbortCallback = null;
                });
            }

            return exports;
        }

        /**
         *  Check if the specified service has been registered
         *
         *  @static
         *  @param {string} urlPattern The path of the service
         *  @return {boolean} Returns true if it has been registered, else false.
         * */
        exports.exist = function (urlPattern) {
            return services.isRegistered(urlPattern);
        };

        /**
         *  config the action, called by action.start
         *
         *  @param {Object} options key/value pairs to config the action
         *  @return {Object} result config object
         *  @static
         * */
        exports.config = function (options) {
            if (arguments.length !== 0) {
                _.assign(config, options);
                router.config(config);
            }
            return config;
        };

        /**
         * Redirect to another page, and change to next state
         *
         * @static
         * @param {string} url The URL to redirect
         * @param {string} query The query string to redirect
         * @param {Object} options The router options to redirect
         * @param {string} options.title Optional, 页面的title
         * @param {boolean} options.force Optional, 是否强制跳转
         * @param {boolean} options.silent Optional, 是否静默跳转（不改变URL）
         * @param {Object} data extended data being passed to `current.options`
         * */
        exports.redirect = function (url, query, options, data) {
            var page;
            logger.log('action redirecting to: ' + url);
            exports.emit('redirecting', url);
            url = resolveUrl(url);
            _.assign(stageData, data);
            options = _.assign({}, options, {
                id: pageId++
            });
            // 保存下浏览位置到当前url上；
            setScrollTopToPage();

            try {
                if (options.silent) {
                    transferPageTo(url, query);
                }
                router.redirect(url, query, options);
            }
            catch (e) {
                e.url = URL.resolve(config.root, url);
                location.replace(e.url);
                exports.emit('redirectFailed', e);
                throw e;
            }
        };

        function resolveUrl(url) {
            var urlObj = URL.parse(url);

            // Ralltiir protocol, eg. sfr://root
            if (urlObj.scheme === 'sfr') {
                if (urlObj.host === 'index') {
                    return indexPageUrl;
                }
            }

            // fallback to url
            return url;
        }

        function setScrollTopToPage() {
            var noRootUrl = getCurrPageUrl();
            var page;
            page = pages.get(noRootUrl);
            if (page) {
                page.scrollTop = window.pageYOffset;
            } else {
                pages.set(noRootUrl, {
                    scrollTop: window.pageYOffset
                });
            }
        }
        /**
         *  Back to last state
         *
         *  @static
         * */
        exports.back = function () {
            backManually = true;
            // 保存下浏览位置到当前url上；
            setScrollTopToPage();
            history.back();
        };

        /**
         * Reset/replace current state
         *
         * @static
         * @param {string} url The URL to reset
         * @param {string} query The query string to reset
         * @param {Object} options The router options
         * @param {string} options.title Optional, 页面的title
         * @param {boolean} options.force Optional, 是否强制跳转
         * @param {boolean} options.silent Optional, 是否静默跳转（不改变URL）
         * @param {Object} data extended data being passed to `current.options`
         * */
        exports.reset = function (url, query, options, data) {
            if (isIndexPage) {
                indexPageUrl = url;
            }

            transferPageTo(url, query);
            _.assign(stageData, data);
            router.reset(url, query, options);
        };

        function transferPageTo(url, query) {
            var noRootUrl = router.ignoreRoot(location.pathname + location.search);
            var from = router.createURL(noRootUrl).toString();
            var to = router.createURL(url, query).toString();

            logger.log('[transfering page] from:', from, 'to:', to);
            if (!pages.contains(from)) {
                console.warn('current page not found, cannot transfer to', url);
                return;
            }
            pages.set(to, pages.get(from));
            // pages.rename(from, to);
        }

        /**
         *  hijack global link href
         *
         *  @private
         *  @param {Event} event The click event object
         * */
        function onAnchorClick(event) {
            event = event || window.event;
            var anchor = closest(event.target || event.srcElement, function (el) {
                return el.tagName === 'A';
            });

            if (!anchor) {
                return;
            }

            // link href only support url like pathname,e.g:/sf?params=
            var link = anchor.getAttribute('data-sf-href');
            var options = anchor.getAttribute('data-sf-options');

            if (link) {
                event.preventDefault();
                try {
                    options = JSON.parse(options) || {};
                }
                catch (err) {
                    // eslint-disable-next-line
                    console.warn('JSON parse failed, fallback to empty options');
                    options = {};
                }
                options.src = 'hijack';
                var extra = {
                    event: event,
                    anchor: anchor
                };
                var url = baseUrl(anchor) + link;
                exports.redirect(url, null, options, extra);
                dom.addClass(anchor, config.visitedClassName);
            }
        }

        function baseUrl(anchor) {
            var rtView = closest(anchor, function (el) {
                return /(^|\s)rt-view($|\s)/.test(el.className);
            });
            if (!rtView) {
                return '';
            }
            return rtView.getAttribute('data-base') || '';
        }

        /**
         * Find the closes ancestor matching the tagName
         *
         * @private
         * @param {DOMElement} element The element from which to find
         * @param {Function} predict The predict function, called with the element
         * @return {DOMElement} The closest ancester matching the tagName
         */
        function closest(element, predict) {
            var parent = element;
            while (parent !== null && !predict(parent)) {
                parent = parent.parentNode;
            }
            return parent;
        }

        /**
         *  Action init, call this to start the action
         *
         *  @param {Object} options key/value pairs to config the action, calling action.config() internally
         *  @static
         * */
        exports.start = function (options) {
            if (arguments.length) {
                exports.config(options);
            }
            document.body.addEventListener('click', onAnchorClick);
            router.start();
            exports.started = true;
        };

        /**
         * Stop Ralltiir redirects
         */
        exports.stop = function () {
            document.body.removeEventListener('click', onAnchorClick);
            router.stop();
            router.clear();
            exports.started = false;
        };

        /**
         * Destroy the action, eliminate side effects:
         * DOM event listeners, cache namespaces, external states
         */
        exports.destroy = function () {
            exports.stop();
            cache.destroy('pages');
            services.destroy();
            exports.pages = pages = undefined;
            services.unRegisterAll();
        };

        /**
         *  Update page, reset or replace current state accordingly
         *
         *  @static
         *  @param {string} url The URL to update
         *  @param {string} query The query string to update
         *  @param {Object} options The router options to update
         *  @param {Object} data The extended data to update, typically contains `container`, `page`, and `view`
         *  @return {Object} the action object
         * */
        exports.update = function (url, query, options, data) {
            options = options ? options : {};

            // use silent mode
            if (!options.hasOwnProperty('silent')) {
                options.silent = true;
            }
            var noRootUrl = router.ignoreRoot(location.pathname + location.search);
            var prevUrl = router.createURL(noRootUrl).toString();
            var currentUrl = router.ignoreRoot(url);
            var currentPath = (currentUrl || '').replace(/\?.*/, '');
            var routerOptions = router.getState();

            var transition = {
                from: {
                    url: prevUrl
                },
                to: {
                    url: currentUrl,
                    path: currentPath
                },
                extra: data
            };
            return exports.partialUpdate(url, {
                replace: true,
                state: routerOptions,
                transition: transition,
                to: data && data.container && data.container.get(0),
                query: query,
                options: options
            });
        };

        /**
         * Update partial content
         *
         * @param {string} [url=null] The url to update to, do not change url if null
         * @param {string} [options=] Update options
         * @param {string} [options.from=] The container element or the selector of the container element in the DOM of the retrieved HTML
         * @param {string} [options.to=] The container element or the selector of the container element in the current DOM
         * @param {string} [options.fromUrl=url] The url of the HTML to be retrieved
         * @param {boolean} [options.replace=false] Whether or not to replace the contents of container element
         * @return {Promise} A promise resolves when update finished successfully, rejected otherwise
         */
        exports.partialUpdate = function (url, options) {
            var noRootUrl = router.ignoreRoot(location.pathname + location.search);
            var currUrl = router.createURL(noRootUrl).toString();
            var page = pages.get(currUrl);
            transferPageTo(url, options.query);

            options = _.assign({}, {
                fromUrl: url,
                replace: false,
                routerOptions: {},
                page: page
            }, options);

            var service = services.getOrCreate(url);
            var pending = service.partialUpdate(url, options);
            options.routerOptions.silent = true;

            // postpone URL change until fetch request is sent
            router.reset(url || location.href, options.query, options.routerOptions);

            return Promise.resolve(pending);
        };

        exports.init();

        return exports;
    }
    return actionFactory;
});

/**
 * @file config.js DI assembly configuration
 * @author harttle<yangjun14@baidu.com>
 */
define('ralltiir/src/config', ['require', 'ralltiir/src/action', 'ralltiir/src/router/router', 'ralltiir/src/view', 'ralltiir/src/service', 'ralltiir/src/services', 'ralltiir/src/resource', 'ralltiir/src/doc', 'ralltiir/src/utils/cache', 'ralltiir/src/utils/http', 'ralltiir/src/utils/url', 'ralltiir/src/utils/di', 'ralltiir/src/utils/emitter', '@searchfe/assert', '@searchfe/underscore', '@searchfe/promise', 'ralltiir/src/lang/map', 'ralltiir/src/utils/logger'], function (require) {
    var config = {
        // core
        action: {
            type: 'factory',
            module: require('ralltiir/src/action'),
            args: [
                'router',
                'location',
                'history',
                'doc',
                'emitter',
                'services'
            ]
        },
        router: {
            type: 'factory',
            module: require('ralltiir/src/router/router')
        },
        view: {
            type: 'value',
            module: require('ralltiir/src/view')
        },
        service: {
            type: 'value',
            module: require('ralltiir/src/service')
        },
        services: {
            type: 'factory',
            args: ['router'],
            module: require('ralltiir/src/services')
        },
        resource: {
            type: 'value',
            module: require('ralltiir/src/resource')
        },
        doc: {
            type: 'factory',
            module: require('ralltiir/src/doc'),
            args: ['document']
        },
        // Utils
        cache: {
            type: 'value',
            module: require('ralltiir/src/utils/cache')
        },
        http: {
            type: 'value',
            module: require('ralltiir/src/utils/http')
        },
        url: {
            type: 'value',
            module: require('ralltiir/src/utils/url')
        },
        di: {
            type: 'value',
            module: require('ralltiir/src/utils/di')
        },
        emitter: {
            type: 'value',
            module: require('ralltiir/src/utils/emitter')
        },
        // Language Enhancements
        assert: {
            type: 'value',
            module: require('@searchfe/assert')
        },
        // eslint-disable-next-line
        _: {
            type: 'value',
            module: require('@searchfe/underscore')
        },
        promise: {
            type: 'value',
            module: require('@searchfe/promise')
        },
        map: {
            type: 'value',
            module: require('ralltiir/src/lang/map')
        },
        // DOM/BOM APIs
        window: {
            type: 'value',
            value: window
        },
        document: {
            type: 'value',
            value: window.document
        },
        location: {
            type: 'value',
            value: window.location
        },
        history: {
            type: 'value',
            value: window.history
        },
        logger: {
            type: 'value',
            module: require('ralltiir/src/utils/logger')
        }
    };
    return config;
});

/**
 * @file doc.js Root document container for all SF pages
 * @author harttle<yangjun14@baidu.com>
 */

define('ralltiir/src/doc', ['require'], function (require) {

    function docFactory(mainDoc) {
        var doc = mainDoc.querySelector('#sfr-app');
        if (!doc) {
            doc = mainDoc.createElement('div');
            doc.setAttribute('id', 'sfr-app');
        }

        doc.ensureAttached = ensureAttached;
        doc.ensureAttached();

        function ensureAttached() {
            var result = mainDoc.querySelector('#sfr-app');
            if (!result) {
                mainDoc.body.appendChild(doc);
            }
        }

        return doc;
    }

    return docFactory;
});

/**
 * @file index.js The AMD entry
 * @author harttle<harttle@harttle.com>
 */

define('ralltiir/src/index', ['ralltiir/src/utils/di', 'ralltiir/src/config'], function (DI, config) {
    var di = new DI(config);

    Object.keys(config).forEach(di.resolve, di);
    return di.container;
});

/**
 * @file map Map for JavaScript with ES6-compliant API but not ES6-compliant.
 * @author harttle<harttle@harttle.com>
 *
 * Limitations:
 * * Key equivalence is value based
 * * Types of keys supported: String, RegExp
 */

/* eslint-disable no-extend-native */

define('ralltiir/src/lang/map', ['require', '@searchfe/underscore'], function (require) {

    var _ = require('@searchfe/underscore');

    /**
     * Map utility
     *
     * @constructor
	 */
    function Map() {
        this.size = 0;
        this._data = {};
    }

    /**
	 * set key into the map
     *
	 * @param {string|RegExp} key the key
	 * @param {any} value the value
	 * @return {undefined}
	 */
    Map.prototype.set = function (key, value) {
        var k = fingerprint(key);
        if (!this._data.hasOwnProperty(k)) {
            this.size++;
        }
        this._data[k] = {
            key: key,
            value: value
        };
    };

    Map.prototype.keys = function (cb) {
        var data = this._data;
        return Object.keys(this._data).map(function (k) {
            var item = data[k];
            return item.key;
        });
    };

    Map.prototype.forEach = function (cb) {
        var data = this._data;
        Object.keys(this._data).forEach(function (k) {
            var item = data[k];
            cb(item.value, item.key);
        });
    };

    /**
	 * test if the key exists
     *
	 * @param {string|RegExp} key the key
	 * @param {any} v the value
	 * @return {boolean} Returns true if contains k, return false otherwise.
	 */
    Map.prototype.has = function (key) {
        var k = fingerprint(key);
        return this._data.hasOwnProperty(k);
    };

    /**
	 * delete the specified key
     *
	 * @param {string|RegExp} key the key
	 * @return {undefined}
	 */
    Map.prototype.delete = function (key) {
        var k = fingerprint(key);
        if (this._data.hasOwnProperty(k)) {
            delete this._data[k];
            this.size--;
        }
    };

    /**
	 * get value by key
     *
	 * @param {string|RegExp} key the key
	 * @return {any} the value associated to k
	 */
    Map.prototype.get = function (key) {
        var k = fingerprint(key);
        var item = this._data[k];
        return item ? item.value : undefined;
    };

    /**
	 * clear the map, remove all keys
     *
     * @param {string|RegExp} k the key
	 */
    Map.prototype.clear = function (k) {
        this.size = 0;
        this._data = {};
    };

    /**
	 * Get string fingerprint for value
     *
     * @private
	 * @param {any} value The value to be summarized.
	 * @return {string} The fingerprint for the value.
	 */
    function fingerprint(value) {
        if (_.isRegExp(value)) {
            return 'reg_' + value;
        }
        if (_.isString(value)) {
            return 'str_' + value;
        }
        return 'other_' + value;
    }

    return Map;
});

/**
 * @file resource.js REST resource CRUD utility
 * @author harttle<yangjun14@baidu.com>
 * @module resource
 */
define('ralltiir/src/resource', ['require', 'ralltiir/src/utils/http', '@searchfe/underscore'], function (require) {
    var http = require('ralltiir/src/utils/http');
    var _ = require('@searchfe/underscore');

    /**
     * The REST resource CRUD utility
     *
     * @constructor
     * @alias module:resource
     * @param {string} url The RESTful url pattern
     */
    function Resource(url) {
        this.url = url;
    }
    Resource.prototype = {

        /**
         * Get the URL for the given optionsions
         *
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {string} A string of URL.
         */
        'getUrl': function (options) {
            var url = this.url;
            // replace slugs with properties
            _.forOwn(options, function (v, k) {
                url = url.replace(':' + k, v);
            });
            // remove remaining slugs
            url = url.replace(/:[a-zA-Z]\w*/g, '');
            return url;
        },

        /**
         * Create an Object from `obj` with the given `options`.
         *
         * @param {Object} obj A plain Object to be created on the server.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is created successful,
         * and rejects whenever there is an error.
         */
        'create': function (obj, options) {
            var url = this.getUrl(options);
            return http.post(url, obj);
        },

        /**
         * Query Objects with the given `options`.
         *
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when retrieved successful,
         * and rejects whenever there is an error.
         */
        'query': function (options) {
            var url = this.getUrl(options);
            return http.get(url);
        },

        /**
         * Update the object specified by `obj` with the given `options`.
         *
         * @param {Object} obj A plain object to update with.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is updated successful,
         * and rejects whenever there is an error.
         */
        'update': function (obj, options) {
            var url = this.getUrl(options);
            return http.put(url, obj);
        },

        /**
         * Delete objects with the given `options`.
         *
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is deleted successful, and rejects whenever there is an error.
         */
        'delete': function (options) {
            var url = this.getUrl(options);
            return http.delete(url);
        }
    };

    Resource.prototype.constructor = Resource;

    return Resource;
});

/**
 * @file Router Frontend router via popstate and pushstate.
 * @author treelite<c.xinle@gmail.com>, Firede<firede@firede.us>
 * @module Router
 */

define('ralltiir/src/router/router', ['require', '@searchfe/underscore', 'ralltiir/src/router/router/config', 'ralltiir/src/router/router/controller', 'ralltiir/src/utils/logger'], function (require) {
    var extend = require('@searchfe/underscore').extend;
    var globalConfig = require('ralltiir/src/router/router/config');
    var controller = require('ralltiir/src/router/router/controller');
    var _ = require('@searchfe/underscore');
    var logger = require('ralltiir/src/utils/logger');

    function routerFactory() {
        /**
         * @constructor
         * @alias module:Router
         */
        var router = {};

        /**
         * 路由规则
         *
         * @type {Array.<Object>}
         */
        var rules = [];

        /**
         * 上一次的route信息
         *
         * @type {Object}
         */
        var prevState = {};

        /**
         * 判断是否已存在路由处理器
         *
         * @inner
         * @param {string|RegExp} path 路径
         * @return {number}
         */
        function indexOfHandler(path) {
            var index = -1;

            path = path.toString();
            rules.some(function (item, i) {
                // toString是为了判断正则是否相等
                if (item.raw.toString() === path) {
                    index = i;
                }

                return index !== -1;
            });

            return index;
        }

        /**
         * 从path中获取query
         * 针对正则表达式的规则
         *
         * @inner
         * @param {string} path 路径
         * @param {Object} item 路由信息
         * @return {Object}
         */
        function getParamsFromPath(path, item) {
            var res = {};
            var names = item.params || [];
            var params = path.match(item.path) || [];

            for (var i = 1, name; i < params.length; i++) {
                name = names[i - 1] || '$' + i;
                res[name] = decodeURIComponent(params[i]);
            }

            return res;
        }

        /**
         * 根据URL调用处理器
         *
         * @inner
         * @param {URL} url url对象
         * @param {Object} options 参数
         * @param {string} options.title 页面标题
         */
        function apply(url, options) {
            logger.log('router apply: ' + url);
            options = options || {};

            var handler;
            var query = extend({}, url.getQuery());
            var params = {};
            var path = url.getPath();

            handler = findHandler(url);
            if (!handler) {
                throw new Error('can not find route for: ' + path);
            }

            if (handler.path instanceof RegExp && handler.path.test(path)) {
                params = getParamsFromPath(path, handler);
            }

            var curState = {
                path: path,
                pathPattern: handler.raw,
                query: query,
                params: params,
                url: controller.ignoreRoot(url.toString()),
                originalUrl: url.toString(),
                options: options
            };
            var args = [curState, prevState];
            prevState = curState;

            logger.log('router calling handler: ' + handler.name);
            handler.fn.apply(handler.thisArg, args);
        }

        /**
         * Find handler object by Url Object
         *
         * @private
         * @param {Object} url The url object
         * @return {Object} the corresponding handler for the given url
         */
        function findHandler(url) {
            var handler;
            var defHandler;
            var path = url.getPath();
            logger.log('finding handlers for', url, 'in rules:', rules);
            rules.some(function (item) {
                if (item.path instanceof RegExp) {
                    if (item.path.test(path)) {
                        handler = item;
                    }
                }
                else if (url.equalPath(item.path)) {
                    handler = item;
                }

                if (!item.path) {
                    defHandler = item;
                }

                return !!handler;
            });
            return handler || defHandler;
        }

        /**
         * 处理RESTful风格的路径
         * 使用正则表达式
         *
         * @inner
         * @param {string} path 路径
         * @return {Object}
         */
        function restful(path) {
            var res = {
                params: []
            };

            res.path = path.replace(/:([^/]+)/g, function ($0, $1) {
                res.params.push($1);
                return '([^/]+)';
            });

            res.path = new RegExp('^' + res.path + '$');

            return res;
        }


        /**
         * Find registered path pattern by url
         *
         * @param {string} url The url string
         * @return {Object} The handler object associated with the given url
         */
        router.pathPattern = function (url) {
            url = controller.ignoreRoot(url);
            var urlObj = controller.createURL(url);
            var handler = findHandler(urlObj);
            if (!handler) {
                return null;
            }
            return handler.raw;
        };

        /**
         * 重置当前的URL
         *
         * @public
         * @param {string} url 路径
         * @param {Object} query 查询条件
         * @param {Object} options 选项
         * @param {boolean} options.silent 是否静默重置，静默重置只重置URL，不加载action
         */
        router.reset = function (url, query, options) {
            controller.reset(url, query, options);
        };

        /**
         * 设置配置信息
         *
         * @public
         * @param {Object} options 配置信息
         * @param {string} options.path 默认路径
         * @param {string} options.index index文件名称
         * @param {string} options.mode 路由模式，可选async、page，默认为async
         */
        router.config = function (options) {
            options = options || {};
            // 修正root，添加头部的`/`并去掉末尾的'/'
            var root = options.root;
            if (root && root.charAt(root.length - 1) === '/') {
                root = options.root = root.substring(0, root.length - 1);
            }

            if (root && root.charAt(0) !== '/') {
                options.root = '/' + root;
            }

            extend(globalConfig, options);
        };

        /**
         * 添加路由规则
         *
         * @public
         * @param {string|RegExp} path 路径
         * @param {function(path, query)} fn 路由处理函数
         * @param {Object} thisArg 路由处理函数的this指针
         */
        router.add = function (path, fn, thisArg) {
            if (indexOfHandler(path) >= 0) {
                throw new Error('path already exist');
            }

            var rule = {
                raw: path,
                path: path,
                fn: fn,
                thisArg: thisArg
            };

            if (_.isString(path) && _.contains(path, ':')) {
                rule = extend(rule, restful(path));
            }

            rules.push(rule);
        };

        /**
         * 删除路由规则
         *
         * @public
         * @param {string} path 路径
         */
        router.remove = function (path) {
            var i = indexOfHandler(path);
            if (i >= 0) {
                rules.splice(i, 1);
            }
        };

        /**
         * 测试路由规则存在性
         *
         * @public
         * @param {string} path 路径
         * @return {boolean} 是否存在
         */
        router.exist = function (path) {
            return indexOfHandler(path) >= 0;
        };

        /**
         * 清除所有路由规则
         *
         * @public
         */
        router.clear = function () {
            rules = [];
        };

        /**
         * URL跳转
         *
         * @public
         * @param {string} url 路径
         * @param {?Object} query 查询条件
         * @param {Object} options 跳转参数
         * @param {string} options.title 跳转后页面的title
         * @param {boolean} options.force 是否强制跳转
         * @param {boolean} options.silent 是否静默跳转（不改变URL）
         */
        router.redirect = function (url, query, options) {
            logger.log('router redirecting to: ' + url);
            controller.redirect(url, query, options);
        };

        /**
         * 启动路由监控
         *
         * @public
         * @param {Object} options 配置项
         */
        router.start = function (options) {
            router.config(options);
            controller.init(apply);
        };

        /**
         * 停止路由监控
         *
         * @public
         */
        router.stop = function () {
            controller.dispose();
            router.clear();
            prevState = {};
        };

        /**
         * 更换控制器
         * 仅用于单元测试及自定义控制器的调试
         * TODO: re-implement this via DI
         *
         * @public
         * @param {Object} implement 路由控制器
         */
        router.controller = function (implement) {
            var tmp = controller;
            controller = implement;
            _.forOwn(tmp, function (v, k) {
                if (!controller.hasOwnProperty(k)) {
                    controller[k] = v;
                }
            });
        };

        /**
         * 获取当前状态
         *
         * @return {Object} 返回上一次调度后的状态
         */
        router.getState = function () {
            return prevState;
        };

        router.ignoreRoot = controller.ignoreRoot;
        router.createURL = controller.createURL;

        return router;
    }
    return routerFactory;
});

/**
 * @file url处理
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/router/router/URL', ['require', 'ralltiir/src/utils/uri/component/Path', 'ralltiir/src/utils/uri/component/Query', 'ralltiir/src/utils/uri/component/Fragment', 'ralltiir/src/router/router/config'], function (require) {

    var Path = require('ralltiir/src/utils/uri/component/Path');
    var Query = require('ralltiir/src/utils/uri/component/Query');
    var Fragment = require('ralltiir/src/utils/uri/component/Fragment');
    var config = require('ralltiir/src/router/router/config');
    // Spec. RFC3986: URI Generic Syntax
    // see: https://tools.ietf.org/html/rfc3986#page-50
    var URIRegExp = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?');

    var DEFAULT_TOKEN = '?';

    /**
     * URL
     *
     * @constructor
     * @param {string} str url
     * @param {Object=} options 选项
     * @param {Object=} options.query 查询条件
     * @param {URL=} options.base 基路径
     * @param {string=} options.root 根路径
     */
    function URL(str, options) {
        options = options || {};
        str = (str || '').trim() || config.path;

        var match = URIRegExp.exec(str);
        // ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
        //  12            3  4          5       6  7        8 9
        if (!match) {
            // eslint-disable-next-line
            console.warn('URI not valid:');
        }

        var token = this.token = options.token || DEFAULT_TOKEN;
        var root = options.root || config.root;
        if (root.charAt(root.length - 1) === '/') {
            root = root.substring(0, root.length - 1);
        }

        this.root = root;

        str = str.split('#');
        this.fragment = new Fragment(str[1]);

        str = str[0].split(token);
        var base = options.base || {};
        this.path = new Path(str[0], base.path);
        this.query = new Query(str[1]);

        // 路径修正
        // * 针对相对路径修正
        // * 添加默认的'/'
        var path = this.path.get();
        this.outRoot = path.indexOf('..') === 0;
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
            if (path.indexOf(root) === 0) {
                path = path.substring(root.length);
                this.path.set(path);
                this.outRoot = false;
            }
        }

        if (!this.outRoot && path.charAt(0) !== '/') {
            this.path.set('/' + path);
        }

        if (options.query) {
            this.query.add(options.query);
        }
    }

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    URL.prototype.toString = function () {
        var root = this.root;
        var path = this.path.get();
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
        }
        else {
            path = root + path;
        }

        return path
            + this.query.toString(this.token)
            + this.fragment.toString();
    };

    /**
     * 比较Path
     *
     * @public
     * @param {string} path 路径
     * @return {boolean}
     */
    URL.prototype.equalPath = function (path) {
        return this.path.get() === path;
    };

    /**
     * 比较Path与Query是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equal = function (url) {
        return this.query.equal(url.query)
            && this.equalPath(url.path.get());
    };

    /**
     * 比较Path, Query及Fragment是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equalWithFragment = function (url) {
        return this.equal(url)
            && this.fragment.equal(url.fragment);
    };

    /**
     * 获取查询条件
     *
     * @public
     * @return {Object}
     */
    URL.prototype.getQuery = function () {
        return this.query.get();
    };

    /**
     * 获取路径
     *
     * @public
     * @return {string}
     */
    URL.prototype.getPath = function () {
        return this.path.get();
    };

    return URL;

});

/**
 * @file 配置信息
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/router/router/config', [], {

    /**
     * 默认的路径
     * 只对hash控制器生效
     *
     * @type {string}
     */
    path: '/',

    /**
     * 默认的根路径
     *
     * @type {string}
     */
    root: '',

    /**
     * 路由模式
     * 可选async或page
     *
     * @type {string}
     */
    mode: 'async'

});

/**
 * @file controller
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

define('ralltiir/src/router/router/controller', ['require', '@searchfe/underscore', 'ralltiir/src/router/router/URL', 'ralltiir/src/router/router/config'], function (require) {
    var _ = require('@searchfe/underscore');
    var URL = require('ralltiir/src/router/router/URL');
    var config = require('ralltiir/src/router/router/config');
    var applyHandler;
    var curLocation;

    /**
     * 调用路由处理器
     *
     * @inner
     * @param {URL} url URL对象
     * @param {Object} options 参数
     */
    function callHandler(url, options) {
        if (equalWithCurLocation(url, options)) {
            return;
        }
        applyHandler(url, options);
        curLocation = url;
    }

    /**
     * 判断是否与当前路径相等
     *
     * @inner
     * @param {URL} url URL对象
     * @param {Object} options 参数
     * @return {boolean}
     */
    function equalWithCurLocation(url, options) {
        return curLocation && url.equal(curLocation) && !options.force;
    }

    /**
     * url忽略root
     *
     * @inner
     * @param {string} url url
     * @return {string}
     */
    function ignoreRoot(url) {
        var root = config.root;
        if (url.charAt(0) === '/' && root) {
            if (url.indexOf(root) === 0) {
                url = url.replace(root, '');
            }
            else {
                // 绝对地址超出了root的范围
                // 转化为相对路径
                var dirs = root.split('/').slice(1);
                dirs = dirs.map(function () {
                    return '..';
                });
                url = dirs.join('/') + url;
                // 此时的相对路径是针对root的
                // 所以把curlocation置为空
                curLocation = null;
            }
        }

        return url;
    }

    /**
     * 创建URL对象
     *
     * @inner
     * @param {string=} url url字符串
     * @param {Object=} query 查询条件
     * @return {URL}
     */
    function createURL(url, query) {
        if (!url) {
            url = ignoreRoot(location.pathname);
        }
        return new URL(url, {query: query, base: curLocation});
    }

    /**
     * 路由监控
     *
     * @inner
     * @param {Object=} e 事件参数
     * @param {boolean} isSync 是否为同步渲染
     * @return {*}
     */
    function monitor(e, isSync) {
        e = e || {};

        if (_.get(e, 'state.disableServiceDispatch')) {
            return;
        }

        var url = ignoreRoot(location.pathname);
        if (location.search.length > 1) {
            url += location.search;
        }
        url = createURL(url);

        if (url.outRoot) {
            return outOfControl(url.toString(), true);
        }

        var options = isSync ? {src: 'sync'} : _.extend({}, e.state, {src: 'history'});
        callHandler(url, options);
    }

    var exports = {};

    /**
     * URL超出控制范围
     *
     * @inner
     * @param {string} url url地址
     * @param {boolean} silent 是否不添加历史纪录 默认为false
     */
    function outOfControl(url, silent) {
        exports.dispose();

        if (silent) {
            location.replace(url);
        }
        else {
            location.href = url;
        }
    }

    /**
     * 初始化
     *
     * @public
     * @param {Function} apply 调用路由处理器
     */
    exports.init = function (apply) {
        window.addEventListener('popstate', monitor, false);
        applyHandler = apply;

        // 首次调用为同步渲染
        monitor(null, true);
    };

    /**
     * 路由跳转
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {boolean=} options.force 是否强制跳转
     * @param {boolean=} options.silent 是否静默跳转（不改变URL）
     * @return {*}
     */
    exports.redirect = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        if (url.outRoot || config.mode === 'page') {
            return !equalWithCurLocation(url, options) && outOfControl(url.toString());
        }

        if (!curLocation.equalWithFragment(url)) {
            history.pushState(options, options.title, url.toString());
        }
        if (!options.silent) {
            callHandler(url, options);
        }
    };

    /**
     * 重置当前的URL
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 重置参数
     * @param {boolean=} options.silent 是否静默重置，静默重置只重置URL，不加载action
     * @return {*}
     */
    exports.reset = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        if (url.outRoot || config.mode === 'page') {
            return !equalWithCurLocation(url, options) && outOfControl(url.toString());
        }

        if (!options.silent) {
            callHandler(url, options);
        }
        else {
            curLocation = url;
        }
        history.replaceState(options, options.title, url.toString());
    };

    /**
     * 销毁
     *
     * @public
     */
    exports.dispose = function () {
        window.removeEventListener('popstate', monitor, false);
        curLocation = null;
    };

    exports.ignoreRoot = ignoreRoot;

    exports.createURL = createURL;

    return exports;
});

/**
 * @file service.js service base class, service base lifecycle
 * @author taoqingqian01
 * @module service
 */

define('ralltiir/src/service', ['require'], function (require) {

    /**
     * a base/sample  service instance
     *
     * @constructor
     * @alias module:service
     */
    var service = function () {};

    /**
     * Called when service created
     *
     * @example
     * function(){
     *     // do initialization here
     *     this.onClick = function(){};
     * }
     */
    service.prototype.create = function () {};

    /**
     * Called when service attached
     *
     * @example
     * function(){
     *     // do stuff on global click
     *     $(window).on('click', this.onClick);
     * }
     */
    service.prototype.attach = function () {};

    /**
     * Called when service dettached
     *
     * @example
     * function(){
     *     // remove global listeners
     *     $(window).off('click', this.onClick);
     * }
     */
    service.prototype.detach = function () {};

    /**
     * Called when service destroy requested
     *
     * @example
     * function(){
     *     this.onClick = null;
     * }
     */
    service.prototype.destroy = function () {};

    /**
     * Called when service update requested
     *
     * @example
     * function(){
     *     // you may want to redraw your layout
     *     var rect = calcLayoutRect();
     *     this.redraw(rect);
     * }
     */
    service.prototype.update = function () {};

    return service;
});

/**
 * @file Services Service factory for service instances / legacy static services
 * @author harttle<harttle@harttle.com>
 */

define('ralltiir/src/services', ['require', 'ralltiir/src/lang/map', '@searchfe/underscore', '@searchfe/assert', 'ralltiir/src/utils/logger', 'ralltiir/src/utils/cache'], function (require) {
    var Map = require('ralltiir/src/lang/map');
    var _ = require('@searchfe/underscore');
    var assert = require('@searchfe/assert');
    var logger = require('ralltiir/src/utils/logger');
    var cache = require('ralltiir/src/utils/cache');

    return function (router) {
        // 所有已经存在的 Service 实例：
        // * 对于新 Service 为对应 Service 类的实例
        // * 对于旧 Service 就是 Service 类本身
        var serviceInstances;
        var urlEntries;

        var actionDispatcher;
        var url2id;
        var exports = {
            init: init,
            destroy: destroy,
            register: register,
            unRegister: unRegister,
            isRegistered: isRegistered,
            unRegisterAll: unRegisterAll,
            getOrCreate: getOrCreate,
            setInstanceLimit: setInstanceLimit,
            urlEntries: null
        };
        var id = 0;

        function setInstanceLimit(n) {
            return exports.serviceInstances.setLimit(n);
        }

        function init(dispatcher) {
            url2id = new Map();
            actionDispatcher = dispatcher;
            urlEntries = exports.urlEntries = new Map();
            serviceInstances = exports.serviceInstances = cache.create('services', {
                onRemove: function (service, url, evicted) {
                    if (!service.singleton && _.isFunction(service.destroy)) {
                        return service.destroy(url, evicted);
                    }
                },
                limit: 8
            });
        }

        function destroy() {
            cache.destroy('services');
        }

        function register(pathPattern, config, service) {
            assert(pathPattern, 'invalid path pattern');
            assert(!urlEntries.has(pathPattern), 'path already registerd');

            router.add(pathPattern, actionDispatcher);
            urlEntries.set(pathPattern, {service: service, config: config});

            logger.info('service', service, 'registered to', pathPattern);
        }

        function isRegistered(pathPattern) {
            return urlEntries.has(pathPattern);
        }

        function unRegisterAll(pathPattern) {
            urlEntries.keys().forEach(unRegister);
            urlEntries.clear();
        }

        function unRegister(pathPattern) {
            assert(pathPattern, 'invalid path pattern');
            assert(isRegistered(pathPattern), 'path not registered');
            router.remove(pathPattern);
            urlEntries.delete(pathPattern);
            logger.info('service unregistered from: ' + pathPattern);
        }

        function getService(url) {
            var id = url2id.get(url);
            if (id === undefined) {
                return undefined;
            }
            return serviceInstances.get(id);
        }

        function addInstance(url, instance) {
            var instanceId = id++;
            url2id.set(url, instanceId);
            instance.id = instanceId;
            serviceInstances.set(instanceId, instance);
            return instance;
        }

        // 由于目前还是 URL 索引页面，ignoreCache 为同样 URL 创建新的页面仍不可行
        function getOrCreate(url, pathPattern, ignoreCache) {
            // return if exist
            var service = getService(url);
            if (service) {
                return service;
            }

            // use static service instance
            if (arguments.length < 2) {
                pathPattern = router.pathPattern(url);
            }
            var entry = urlEntries.get(pathPattern);
            if (entry) {
                var Service = entry.service;
                var config = entry.config;
                var instance = Service.singleton ? Service : new Service(url, config);
                return addInstance(url, instance);
            }
        }

        return exports;
    };
});

/**
 * @file cache-namespace.js
 * @author harttle<yangjun14@baidu.com>
 */

define('ralltiir/src/utils/cache-namespace', ['require', '@searchfe/underscore'], function (require) {
    /**
     * Namespace utility for cache module
     * @module Namespace
     */

    var _ = require('@searchfe/underscore');

    /**
     * Event handler interfact used by Namespaceoptions.onRemove
     *
     * @interface
     * @param {string} v value
     * @param {string} k key
     * @param {boolean} evicted true if the entry is removed to make space, false otherwise
     */
    function onRemove(v, k, evicted) {
    }

    /**
     * Create a LRU cache namespace.
     *
     * @constructor
     * @alias module:Namespace
     * @param {string} name The namespace identifier
     * @param {number} options.limit The MAX count of cached items
     * @param {Function} options.onRemove The callback when item removed
     */
    function Namespace(name, options) {
        this.name = name;
        this.list = [];
        this.options = _.assign({
            limit: 3,
            onRemove: onRemove
        }, options);
    }
    Namespace.prototype = {
        constructor: Namespace,

        setLimit: function (limit) {
            this.options.limit = limit;
        },

        /**
         * Get a cache item, and reset the item accessed to the tail.
         *
         * @memberof Namespace
         * @param {string} key The key for your cache item
         * @return {any} The value for your cache item, or undefined if the specified item does not exist.
         */
        get: function (key) {
            var idx = this.findIndexByKey(key);
            if (idx === -1) {
                return undefined;
            }

            var item = this.list[idx];
            this.list.splice(idx, 1);
            this.list.push(item);
            return item.value;
        },

        /**
         * Set a cache item and put the item to the tail, while remove the first item when limit overflow.
         *
         * @param {string} key The key for your cache item
         * @param {any} value The value for your cache item
         * @return {Object} this
         * */
        set: function (key, value) {
            this.remove(key);

            while (this.list.length >= this.options.limit) {
                var dropped = this.list.shift();
                this.options.onRemove(dropped.value, dropped.key, true);
            }

            this.list.push({
                key: key,
                value: value
            });
            return this;
        },

        /**
         * Alias to #has
         *
         * @param {string} key The key to check with
         * @return {Object} this
         */
        contains: function (key) {
            return this.has(key);
        },

        /**
         * Check whether the given key exists within the namespace, or whether the namespace exists if key not set.
         *
         * @param {string} key The key to check with
         * @return {Object} this
         */
        has: function (key) {
            return this.findIndexByKey(key) > -1;
        },

        /**
         * Rename a cache item
         *
         * @param {string} before The source key for your cache item
         * @param {string} after The destination key for your cache item
         * @return {Object} this
         */
        rename: function (before, after) {
            if (before === after) {
                return this;
            }

            this.remove(after);
            var idx = this.findIndexByKey(before);
            if (idx === -1) {
                throw new Error('key not found:' + before);
            }

            this.list[idx].key = after;
            return this;
        },

        /**
         * Remove a specific `key` in namespace `name`
         *
         * @param {string} key The key to remove
         * @return {Object} this
         * */
        remove: function (key) {
            var idx = this.findIndexByKey(key);
            if (idx > -1) {
                var item = this.list[idx];
                this.options.onRemove(item.value, item.key, false);
                this.list.splice(idx, 1);
            }

            return this;
        },

        size: function () {
            return this.list.length;
        },

        /**
         * Clear the given namespace, or all namespaces if `name` not set.
         *
         * @param {string} name The namespace to clear.
         * @return {Object} this
         * */
        clear: function () {
            this.list = [];
            return this;
        },

        /**
         * Find the index of the given key exists in list,
         *
         * @private
         * @param {string} key The key to find
         * @return {number} return the index of the given key, false if not found
         * @example
         * findIndexByKey('k', [{'k':'v'}])    // yields 0
         */
        findIndexByKey: function (key) {
            return _.findIndex(this.list, function (item) {
                return item.key === key;
            });
        }
    };

    return Namespace;
});


/**
 * @file cache.js A simple LRU cache implementation.
 *
 * Performance Notes: Since LRU queue is implemented by JavaScript Array internally,
 * it's enough for small cache limits.
 * Large cache limits may require linklist implementation.
 * @author harttle<yangjun14@baidu.com>
 * @module Cache
 */

define('ralltiir/src/utils/cache', ['require', '@searchfe/assert', 'ralltiir/src/utils/cache-namespace'], function (require) {
    var assert = require('@searchfe/assert');
    var Namespace = require('ralltiir/src/utils/cache-namespace');
    var storage = {};
    var exports = {};

    /**
     * Create a namespaced cache instance
     *
     * @static
     * @param {string} name The namespace identifier
     * @param {Object} options The options object used to create the namespace
     * @return {Namespace} the namespace object created
     */
    exports.create = function (name, options) {
        assert(name, 'cannot create namespace with empty name');
        assert(!storage[name], 'namespace with ' + name + ' already created');

        return storage[name] = new Namespace(name, options);
    };

    exports.destroy = function (name) {
        assert(storage[name], 'namespace with ' + name + ' not exist');
        delete storage[name];
    };

    /**
     * Using a specific namespace
     *
     * @param {string} name The namespace identifier
     * @static
     * @return {Object} The scoped cache object
     */
    exports.using = function (name) {
        return usingNamespace(name);
    };

    /**
     * Set a cache item
     *
     * @static
     * @param {string} name The namespace for your cache item
     * @param {string} key The key for your cache item
     * @param {any} value The value for your cache item
     * @return {any} The return value of corresponding Namespace#set
     * */
    exports.set = function (name, key, value) {
        return usingNamespace(name).set(key, value);
    };

    /**
     *  Get a cache item
     *
     * @static
     * @param {string} name The namespace for your cache item
     * @param {string} key The key for your cache item
     * @return {any} The value for your cache item, or undefined if the specified item does not exist.
     * */
    exports.get = function (name, key) {
        return usingNamespace(name).get(key);
    };

    exports.size = function (name) {
        return usingNamespace(name).size();
    };

    /**
     * Rename a cache item
     *
     * @static
     * @param {string} name The namespace for your cache item
     * @param {string} before The source key for your cache item
     * @param {string} after The destination key for your cache item
     * @return {any} The return value of corresponding Namespace#rename
     */
    exports.rename = function (name, before, after) {
        return usingNamespace(name).rename(before, after);
    };

    /**
     * Remove a specific `key` in namespace `name`
     *
     * @static
     * @param {string} name The namespace identifier
     * @param {string} key The key to remove
     * @return {any} The return value of corresponding Namespace#remove
     * */
    exports.remove = function (name, key) {
        return usingNamespace(name).remove(key);
    };

    /**
     * Clear the given namespace, or all namespaces if `name` not set.
     *
     * @static
     * @param {string} name The namespace to clear.
     * @return {undefined|Namespace} Return the Namespace object if `name` is given, undefined otherwise.
     * */
    exports.clear = function (name) {
        if (arguments.length === 0) {
            storage = {};
        }
        else {
            return usingNamespace(name).clear();
        }
    };

    /**
     * Check whether the given key exists within the namespace, or whether the namespace exists if key not set.
     *
     * @static
     * @param {string} name The namespace to check
     * @param {string} key The key to check with
     * @return {boolean} Return if the namespace specified by `name` contains `key`
     */
    exports.contains = function (name, key) {
        if (arguments.length === 0) {
            throw new Error('namespace not specified');
        }

        // quering for namespace
        if (arguments.length === 1) {
            return storage.hasOwnProperty(name);
        }

        // quering for key
        if (!storage.hasOwnProperty(name)) {
            return false;
        }

        return storage[name].contains(key);
    };

    exports.has = function (name) {
        return storage.hasOwnProperty(name);
    };

    /**
     * Get the cache storage for specified namespace
     *
     * @private
     * @param {string} name The namespace to get
     * @return {Namespace} Return the namespace object identified by `name`
     */
    function usingNamespace(name) {
        if (!storage.hasOwnProperty(name)) {
            throw new Error('cache namespace ' + name + ' undefined');
        }

        return storage[name];
    }

    return exports;

});

/**
 * @file IoC Dependency Injector
 *   * only support sync AMD modules
 *   * cyclic dependencies are not handled
 *   * entities returned by factories are always cached
 * @author harttle<yangjun14@baidu.com>
 */
define('ralltiir/src/utils/di', ['require', '@searchfe/assert', '@searchfe/underscore'], function (require) {
    var assert = require('@searchfe/assert');
    var _ = require('@searchfe/underscore');

    /**
     * Create a IoC container
     *
     * @constructor
     * @param {Object} config The dependency tree configuration
     * @param {Function} require Optional, the require used by DI, defaults to `window.require`
     */
    function DI(config, require) {
        // this.require = require || window.require;
        this.config = this.normalize(config);
        this.container = Object.create(null);
    }

    DI.prototype.resolve = function (name) {
        var decl = this.config[name];
        assert(decl, 'module declaration not found: ' + name);

        // cache check
        if (this.container[name] && decl.cache) {
            return this.container[name];
        }

        // AMD resolving
        if (decl.value === undefined && decl.module) {
            decl.value = decl.module;
        }

        switch (decl.type) {
            case 'value':
                return this.container[name] = decl.value;
            case 'factory':
                assert(typeof decl.value === 'function', 'entity not injectable: ' + decl.value);
                var deps = decl.args || [];
                return this.container[name] = this.inject(decl.value, deps);
            default:
                throw new Error('DI type ' + decl.type + ' not recognized');
        }
    };

    DI.prototype.inject = function (factory, deps) {
        // Note: cyclic dependencies are not detected, avoid this!
        var args = deps.map(function (name) {
            return this.resolve(name);
        }, this);

        return factory.apply(null, args);
    };

    DI.prototype.normalize = function (config) {
        _.forOwn(config, function (decl, key) {
            if (decl.cache === undefined) {
                decl.cache = true;
            }

            if (decl.type === undefined) {
                decl.type = 'value';
            }

        });
        return config;
    };

    return DI;
});

/**
 * @file utils/dom.js
 * @author harttle<yangjun14@baidu.com>
 */

define('ralltiir/src/utils/dom', ['require'], function (require) {
    function addClass(el, className) {
        if (!hasClass(el, className)) {
            if (el.className) {
                el.className += ' ';
            }
            el.className += className;
        }
    }
    function hasClass(el, className) {
        return rClassName(className).test(el.className);
    }
    function rClassName(name) {
        return new RegExp('(^|\\s)' + name + '(\\s|$)');
    }
    return {
        addClass: addClass,
        hasClass: hasClass
    };
});

/**
 * @file emitter
 * @author  Firede(firede@firede.us)
 * @module Emitter
 * @example
 *
 * ```javascript
 * var emitter = new Emitter();
 * emitter.on('foo', function(value) {
 *     console.log(value);
 *  });
 *  // console.log: 'test'
 *  emitter.emit('foo', 'test');
 *  ```
 */

define('ralltiir/src/utils/emitter', ['require'], function (require) {

    /**
     * Create a emitter instance
     *
     * @constructor
     * @alias module:Emitter
     */
    function Emitter() {}

    /**
     * Emitter的prototype（为了便于访问），以及代码压缩
     *
     * @inner
     */
    var proto = Emitter.prototype;

    /**
     * 获取事件列表
     * 若还没有任何事件则初始化列表
     *
     * @private
     * @return {Object}
     */
    proto._getEvents = function () {
        if (!this._events) {
            this._events = {};
        }

        return this._events;
    };

    /**
     * 获取最大监听器个数
     * 若尚未设置，则初始化最大个数为10
     *
     * @private
     * @return {number}
     */
    proto._getMaxListeners = function () {
        if (isNaN(this.maxListeners)) {
            this.maxListeners = 10;
        }

        return this.maxListeners;
    };

    /**
     * 挂载事件
     *
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.on = function (event, listener) {
        var events = this._getEvents();
        var maxListeners = this._getMaxListeners();

        events[event] = events[event] || [];

        var currentListeners = events[event].length;
        if (currentListeners >= maxListeners && maxListeners !== 0) {
            var msg = 'Warning: possible Emitter memory leak detected. '
                + currentListeners
                + ' listeners added.';
            // eslint-disable-next-line
            console.warn(msg);
        }

        events[event].push(listener);

        return this;
    };

    /**
     * 挂载只执行一次的事件
     *
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.once = function (event, listener) {
        var me = this;

        function on() {
            me.off(event, on);
            listener.apply(this, arguments);
        }
        // 挂到on上以方便删除
        on.listener = listener;

        this.on(event, on);

        return this;
    };

    /**
     * 注销事件与监听器
     * 任何参数都`不传`将注销当前实例的所有事件
     * 只传入`event`将注销该事件下挂载的所有监听器
     * 传入`event`与`listener`将只注销该监听器
     *
     * @public
     * @param {string=} event 事件名
     * @param {Function=} listener 监听器
     * @return {Emitter}
     */
    proto.off = function (event, listener) {
        var events = this._getEvents();

        // 移除所有事件
        if (0 === arguments.length) {
            this._events = {};
            return this;
        }

        var listeners = events[event];
        if (!listeners) {
            return this;
        }

        // 移除指定事件下的所有监听器
        if (1 === arguments.length) {
            delete events[event];
            return this;
        }

        // 移除指定监听器（包括对once的处理）
        var cb;
        for (var i = 0; i < listeners.length; i++) {
            cb = listeners[i];
            if (cb === listener || cb.listener === listener) {
                listeners.splice(i, 1);
                break;
            }
        }
        return this;
    };

    /**
     * 触发事件
     *
     * @public
     * @param {string} event 事件名
     * @param {...*} args 传递给监听器的参数，可以有多个
     * @return {Emitter}
     */
    proto.emit = function (event) {
        var events = this._getEvents();
        var listeners = events[event];
        // 内联arguments的转化 提升性能
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (listeners) {
            listeners = listeners.slice(0);
            for (i = 0; i < listeners.length; i++) {
                try {
                    listeners[i].apply(this, args);
                }
                catch (e) {
                    // eslint-disable-next-line
                    console.error(e);
                }
            }
        }

        return this;
    };

    /**
     * 返回指定事件的监听器列表
     *
     * @public
     * @param {string} event 事件名
     * @return {Array} 监听器列表
     */
    proto.listeners = function (event) {
        var events = this._getEvents();
        return events[event] || [];
    };

    /**
     * 设置监听器的最大个数，为0时不限制
     *
     * @param {number} number 监听器个数
     * @return {Emitter}
     */
    proto.setMaxListeners = function (number) {
        this.maxListeners = number;

        return this;
    };

    var protoKeys = Object.keys(proto);

    /**
     * 将Emitter混入目标对象
     *
     * @param {Object} obj 目标对象
     * @return {Object} 混入Emitter后的对象
     * @static
     */
    Emitter.mixin = function (obj) {
        // forIn不利于V8的优化
        var key;
        for (var i = 0, max = protoKeys.length; i < max; i++) {
            key = protoKeys[i];
            obj[key] = proto[key];
        }
        return obj;
    };

    // Export
    return Emitter;

});

/**
 * @file http http utility
 * @author harttle<yangjun14@baidu.com>
 * @module http
 */

define('ralltiir/src/utils/http', ['require', '@searchfe/underscore', '@searchfe/promise', 'ralltiir/src/utils/url'], function (require) {
    var _ = require('@searchfe/underscore');
    var Promise = require('@searchfe/promise');
    var Url = require('ralltiir/src/utils/url');
    var exports = {};

    /**
     * Perform an asynchronous HTTP (Ajax) request.
     *
     * @param {string} url A string containing the URL to which the request is sent.
     * @param {Object} settings A set of key/value pairs that configure the Ajax request. All settings are optional.
     * @param {string} settings.method The method to open the Ajax request.
     * @param {any} settings.data The data to send, could be a string, a FormData, or a plain object. The 'Content-type' header is guessed accordingly, ie. 'application/x-www-form-urlencoded', 'multipart/form-data'.
     * @param {Object} settings.headers A set of key/value pairs that configure the Ajax request headers. If set to 'application/json', the settings.data will be JSON.stringified; If set to 'x-www-form-urlencoded', which is by default, the settings.data will be url-encoded.
     * @param {boolean} settings.jsonp [NOT implemented yet] Whether or not to use JSONP, default to `false`.
     * @param {string} settings.jsonpCallback [NOT implemented yet] Specify the callback function name for a JSONP request. This value will be used instead of the random name automatically generated by default.
     * @param {xhrFields} settings.xhrFields A set of key/value pairs that configure the fields of the xhr object. Note: onreadystatechange not supported, make use of the returned promise instead.
     * @return {Promise} A promise resolves/rejects with the xhr
     * @example
     * ajax('/foo', {
     *         method: 'POST',
     *         headers: {
     *             "content-type": "application/json"
     *         },
     *         xhrFields: {
     *             withCredentials: true
     *         }
     *     })
     *     .then(function(xhr) {
     *         xhr.status == 200;
     *         xhr.responseHeaders['Content-Type'] == 'application/json';
     *         xhr.responseText == '{"foo": "bar"}';
     *         // xhr.data is parsed from responseText according to Content-Type
     *         xhr.data === {foo: 'bar'};
     *     });
     *     .catch(function(xhr|errorThrown ) {});
     *     .finally(function(xhr|errorThrown ) { });
     */
    exports.ajax = function (url, settings) {
        // console.log('ajax with', url, settings);
        if (typeof url === 'object') {
            settings = url;
            url = '';
        }

        // normalize settings
        settings = _.defaultsDeep(settings, {
            url: url,
            method: settings && settings.type || 'GET',
            headers: {},
            data: null,
            jsonp: false,
            jsonpCallback: 'sf_http_' + Math.random().toString(36).substr(2)
        });
        _.forOwn(settings.headers, function (v, k) {
            settings.headers[k] = v.toLowerCase(v);
        });

        if (settings.headers['content-type'] || settings.data) {
            settings.headers['content-type'] = settings.headers['content-type']
                || guessContentType(settings.data);
        }

        // console.log('before parse data', settings);
        if (/application\/json/.test(settings.headers['content-type'])) {
            settings.data = JSON.stringify(settings.data);
        }
        else if (/form-urlencoded/.test(settings.headers['content-type'])) {
            settings.data = Url.param(settings.data);
        }

        // console.log('after parse data', settings);
        return doAjax(settings);
    };

    /**
     * Try guess the content-type of given data.
     *
     * @private
     * @param {any} data entity data
     * @return {string} content-type string
     */
    function guessContentType(data) {
        if (data instanceof FormData) {
            return 'multipart/form-data';
        }

        // header restrictions on CORS requests, see:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
        return 'application/x-www-form-urlencoded';
    }

    /**
     * Load data from the server using a HTTP GET request.
     *
     * @param {string} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.get = function (url, data) {
        return exports.ajax(url, {
            data: data
        });
    };

    /**
     * Load data from the server using a HTTP POST request.
     *
     * @param {string} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.post = function (url, data) {
        return exports.ajax(url, {
            method: 'POST',
            data: data
        });
    };

    /**
     * Load data from the server using a HTTP PUT request.
     *
     * @param {string} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.put = function (url, data) {
        return exports.ajax(url, {
            method: 'PUT',
            data: data
        });
    };

    /**
     * Load data from the server using a HTTP DELETE request.
     *
     * @param {string} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.delete = function (url, data) {
        return exports.ajax(url, {
            method: 'DELETE',
            data: data
        });
    };

    function doAjax(settings) {
        // console.log('doAjax with', settings);
        var xhr;
        try {
            xhr = exports.createXHR();
        }
        catch (e) {
            return Promise.reject(e);
        }
        // console.log('open xhr');
        xhr.open(settings.method, settings.url, true);

        _.forOwn(settings.headers, function (v, k) {
            xhr.setRequestHeader(k, v);
        });
        _.assign(xhr, settings.xhrFields);

        return new Promise(function (resolve, reject) {
            xhr.onreadystatechange = function () {
                // console.log('onreadystatechange', xhr.readyState, xhr.status);
                if (xhr.readyState === 4) {
                    xhr = resolveXHR(xhr);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr);
                    }
                    else {
                        reject(xhr);
                    }
                }

            };
            // console.log('doajax sending:', settings.data);
            xhr.send(settings.data);
        });
    }

    function resolveXHR(xhr) {

        /**
         * parse response headers
         */
        var headers = xhr.getAllResponseHeaders()
            // Spec: https://developer.mozilla.org/en-US/docs/Glossary/CRLF
            .split('\r\n')
            .filter(_.negate(_.isEmpty))
            .map(function (str) {
                return _.split(str, /\s*:\s*/);
            });
        xhr.responseHeaders = _.fromPairs(headers);

        /**
         * parse response body
         */
        xhr.data = xhr.responseText;
        if (xhr.responseHeaders['Content-Type'] === 'application/json') {
            try {
                xhr.data = JSON.parse(xhr.responseText);
            }
            catch (e) {
                // eslint-disable-next-line
                console.warn('Invalid JSON content with Content-Type: application/json');
            }
        }

        return xhr;
    }

    exports.createXHR = function () {
        var xhr = false;

        if (window.XMLHttpRequest) { // Mozilla, Safari,...
            xhr = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) { // IE
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        if (!xhr) {
            throw new Error('Cannot create an XHR instance');
        }

        return xhr;
    };

    return exports;
});

/**
 * @file logger.js Ralltiir Debug Utility
 * @author harttle<yangjun14@baidu.com>
 */

/* eslint-disable no-console */
define('ralltiir/src/utils/logger', ['require', '@searchfe/underscore', 'ralltiir/src/utils/emitter'], function (require) {
    var enableTiming = !!location.search.match(/rt-debug-timming/i);
    var enableDebug = !!location.search.match(/rt-debug/i);
    var _ = require('@searchfe/underscore');
    var Emitter = require('ralltiir/src/utils/emitter');

    var timeOffset = Date.now();
    var lastTime = timeOffset;
    var exports = new Emitter();

    if (enableDebug) {
        // eslint-disable
        console.log('Ralltiir debug enabled');
    }
    if (enableTiming) {
        console.log('Ralltiir timming debug enabled');
    }

    function reset() {
        lastTime = timeOffset = Date.now();
    }

    function assemble() {
        var args = Array.prototype.slice.call(arguments);

        if (enableTiming) {
            args.unshift('[' + getTiming() + ']');
        }

        var stack = (new Error('logger track')).stack || '';
        var line = stack.split('\n')[3] || '';
        var match;
        var location = '';

        match = /at\s+\(?(.*):\d+:\d+\)?$/.exec(line) || [];
        var url = match[1];

        match = /([^/?#]+)([?#]|$)/.exec(url) || [];
        var fileName = match[1];
        location += fileName ? fileName + ':' : '';

        match = /at ([\w\d.]+)\s*\(/.exec(line) || [];
        var funcName = match[1] || 'anonymous';
        location += funcName;

        args.unshift('[' + location + ']');
        return args;
    }

    function getTiming() {
        var now = Date.now();
        var duration = (now - timeOffset) / 1000;
        var ret = duration + '(+' + (now - lastTime) + ')';
        lastTime = now;
        return ret;
    }

    function send(level, impl, args) {
        impl.apply(console, args);
        args.unshift(level);
        exports.emit.apply(exports, args);
    }

    function logFactory(level, impl) {
        if (!enableDebug && /log|debug|info/.test(level)) {
            return _.noop;
        }
        return function () {
            var args = assemble.apply(null, arguments);
            send(level, impl, args);
        };
    }

    exports.log = logFactory('log', console.log);
    exports.debug = logFactory('debug', console.log);
    exports.info = logFactory('info', console.info);
    exports.warn = logFactory('warn', console.warn);
    exports.error = logFactory('error', console.error);
    exports.reset = reset;

    return exports;
});
/* eslint-enable no-console */

/**
 * @file URI
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/URI', ['require', 'ralltiir/src/utils/uri/util/uri-parser', 'ralltiir/src/utils/uri/component/Scheme', 'ralltiir/src/utils/uri/component/UserName', 'ralltiir/src/utils/uri/component/Password', 'ralltiir/src/utils/uri/component/Host', 'ralltiir/src/utils/uri/component/Port', 'ralltiir/src/utils/uri/component/Path', 'ralltiir/src/utils/uri/component/Query', 'ralltiir/src/utils/uri/component/Fragment'], function (require) {

    var parseURI = require('ralltiir/src/utils/uri/util/uri-parser');

    /**
     * 属性构造函数
     *
     * @const
     * @type {Object}
     */
    var COMPONENTS = {
        scheme: require('ralltiir/src/utils/uri/component/Scheme'),
        username: require('ralltiir/src/utils/uri/component/UserName'),
        password: require('ralltiir/src/utils/uri/component/Password'),
        host: require('ralltiir/src/utils/uri/component/Host'),
        port: require('ralltiir/src/utils/uri/component/Port'),
        path: require('ralltiir/src/utils/uri/component/Path'),
        query: require('ralltiir/src/utils/uri/component/Query'),
        fragment: require('ralltiir/src/utils/uri/component/Fragment')
    };

    /**
     * URI
     *
     * @constructor
     * @param {string|Object} data URL
     */
    function URI(data) {
        data = parseURI(data);

        var Factory;
        var me = this;
        Object.keys(COMPONENTS).forEach(function (name) {
            Factory = COMPONENTS[name];
            me[name] = new Factory(data[name]);
        });
    }

    /**
     * 字符串化authority
     *
     * @inner
     * @param {URI} uri URI对象
     * @return {string}
     */
    function stringifyAuthority(uri) {
        var res = [];
        var username = uri.username.toString();
        var password = uri.password.toString();
        var host = uri.host.toString();
        var port = uri.port.toString();

        if (username || password) {
            res.push(username + ':' + password + '@');
        }

        res.push(host);
        res.push(port);

        return res.join('');
    }

    /**
     * 设置属性
     *
     * @public
     * @param {string=} name 属性名称
     * @param {...*} args 数据
     */
    URI.prototype.set = function () {
        var i = 0;
        var arg = {};
        if (arguments.length > 1) {
            arg.name = arguments[i++];
        }
        arg.data = Array.prototype.slice.call(arguments, i);

        var component = this[arg.name];
        if (component) {
            component.set.apply(component, arg.data);
        }
        else {
            var me = this;
            var data = parseURI(arg.data[0]);
            Object.keys(COMPONENTS).forEach(function (name) {
                me[name].set(data[name]);
            });
        }
    };

    /**
     * 获取属性
     *
     * @public
     * @param {string} name 属性名称
     * @return {*}
     */
    URI.prototype.get = function () {
        var arg = {
                name: arguments[0],
                data: Array.prototype.slice.call(arguments, 1)
            };
        var component = this[arg.name];

        if (component) {
            return component.get.apply(component, arg.data);
        }
    };

    /**
     * 转化成字符串
     *
     * @public
     * @param {string=} name 属性名称
     * @return {string}
     */
    URI.prototype.toString = function (name) {
        var str;
        var component = this[name];

        if (component) {
            str = component.toString();
        }
        else {
            str = [];
            var scheme = this.scheme.toString();
            if (scheme) {
                str.push(scheme + ':');
            }
            var authority = stringifyAuthority(this);
            if (scheme && authority) {
                str.push('//');
            }
            str.push(authority);
            str.push(this.path.toString());
            str.push(this.query.toString());
            str.push(this.fragment.toString());
            str = str.join('');
        }

        return str;
    };

    /**
     * 比较uri
     *
     * @public
     * @param {string|URI} uri 待比较的URL对象
     * @return {boolean}
     */
    URI.prototype.equal = function (uri) {
        if (!(uri instanceof URI)) {
            uri = new URI(uri);
        }

        var res = true;
        var names = Object.keys(COMPONENTS);

        for (var i = 0, name; res && (name = names[i]); i++) {
            if (name === 'port') {
                res = this[name].equal(uri[name].get(), this.scheme.get());
            }
            else {
                res = this[name].equal(uri[name]);
            }
        }

        return res;
    };

    return URI;

});

/**
 * @file abstract component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Abstract', ['require'], function (require) {

    /**
     * URI Component 虚基类
     * 提供基础方法
     *
     * @constructor
     * @param {string} data 数据
     */
    function Abstract() {
        var args = Array.prototype.slice.call(arguments);
        this.set.apply(this, args);
    }

    /**
     * 获取数据
     *
     * @public
     * @return {string}
     */
    Abstract.prototype.get = function () {
        return this.data;
    };

    /**
     * 设置数据
     *
     * @public
     * @param {string} data 数据
     */
    Abstract.prototype.set = function (data) {
        this.data = data || '';
    };

    /**
     * 添加数据
     *
     * @public
     * @param {string} data 数据
     */
    Abstract.prototype.add = function (data) {
        this.set(data);
    };

    /**
     * 移除数据
     *
     * @public
     */
    Abstract.prototype.remove = function () {
        this.data = '';
    };

    /**
     * 字符串输出
     *
     * @public
     * @return {string}
     */
    Abstract.prototype.toString = function () {
        return this.data.toString();
    };

    /**
     * 数据比较
     *
     * @public
     * @param {Object} data 带比较对象
     * @return {boolean}
     */
    Abstract.prototype.equal = function (data) {
        if (data instanceof Abstract) {
            data = data.get();
        }
        // 需要类型转化的比较
        /* eslint-disable eqeqeq */
        return this.data == data;
        /* eslint-enable eqeqeq */
    };

    return Abstract;
});

/**
 * @file fragment component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Fragment', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract'], function (require) {
    var inherits = require('@searchfe/underscore').inherits;
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');

    var DEFAULT_PREFIX = '#';

    /**
     * Fragment
     *
     * @constructor
     * @param {string} data 数据
     */
    function Fragment(data) {
        Abstract.call(this, data);
    }

    inherits(Fragment, Abstract);

    /**
     * 字符串化
     *
     * @public
     * @param {string=} prefix 前缀分割符
     * @return {string}
     */
    Fragment.prototype.toString = function (prefix) {
        prefix = prefix || DEFAULT_PREFIX;
        return this.data ? prefix + this.data : '';
    };

    return Fragment;
});

/**
 * @file host component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Host', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract'], function (require) {
    var inherits = require('@searchfe/underscore').inherits;
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');

    /**
     * Host
     *
     * @constructor
     * @param {string} data 数据
     */
    function Host(data) {
        Abstract.call(this, data);
    }

    inherits(Host, Abstract);

    /**
     * 设置host
     * 忽略大小写
     *
     * @public
     * @param {string} host Host
     */
    Host.prototype.set = function (host) {
        host = host || '';
        this.data = host.toLowerCase();
    };

    /**
     * 比较host
     * 忽略大小写
     *
     * @public
     * @param {string|Host} host Host
     * @return {boolean}
     */
    Host.prototype.equal = function (host) {
        if (host instanceof Host) {
            host = host.get();
        }
        else {
            host = host || '';
        }
        return this.data === host.toLowerCase();
    };

    return Host;
});

/**
 * @file password component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Password', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract'], function (require) {
    var inherits = require('@searchfe/underscore').inherits;
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');

    /**
     * Password
     *
     * @constructor
     * @param {string} data 数据
     */
    function Password(data) {
        Abstract.call(this, data);
    }

    inherits(Password, Abstract);

    return Password;
});

/**
 * @file path component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Path', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract'], function (require) {
    var inherits = require('@searchfe/underscore').inherits;
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');

    /**
     * normalize path
     * see rfc3986 #6.2.3. Scheme-Based Normalization
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function normalize(path) {
        if (!path) {
            path = '/';
        }

        return path;
    }

    /**
     * 获取目录
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function dirname(path) {
        path = path.split('/');
        path.pop();
        return path.join('/');
    }

    /**
     * 处理路径中的相对路径
     *
     * @inner
     * @param {Array} paths 分割后的路径
     * @param {boolean} overRoot 是否已超出根目录
     * @return {Array}
     */
    function resolveArray(paths, overRoot) {
        var up = 0;
        for (var i = paths.length - 1, item; item = paths[i]; i--) {
            if (item === '.') {
                paths.splice(i, 1);
            }
            else if (item === '..') {
                paths.splice(i, 1);
                up++;
            }
            else if (up) {
                paths.splice(i, 1);
                up--;
            }
        }

        if (overRoot) {
            while (up-- > 0) {
                paths.unshift('..');
            }
        }

        return paths;
    }

    /**
     * Path
     *
     * @constructor
     * @param {string} data 路径
     * @param {string|Path=} base 相对路径
     */
    function Path(data, base) {
        Abstract.call(this, data, base);
    }

    /**
     * 应用路径
     *
     * @public
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    Path.resolve = function (from, to) {
        to = to || '';

        if (to.charAt(0) === '/') {
            return Path.resolve(to);
        }

        var isAbsolute = from.charAt(0) === '/';
        var isDir = false;
        if (to) {
            from = dirname(from);
            isDir = to.charAt(to.length - 1) === '/';
        }
        // 对于`/`不处理
        else if (from.length > 1) {
            isDir = from.charAt(from.length - 1) === '/';
        }

        var path = from.split('/')
            .concat(to.split('/'))
            .filter(
                function (item) {
                    return !!item;
                }
            );

        path = resolveArray(path, !isAbsolute);


        return (isAbsolute ? '/' : '')
            + (path.length > 0 ? path.join('/') + (isDir ? '/' : '') : '');
    };

    inherits(Path, Abstract);

    /**
     * 设置path
     *
     * @public
     * @param {string} path 路径
     * @param {string|Path=} base 相对路径
     */
    Path.prototype.set = function (path, base) {
        if (base instanceof Path) {
            base = base.get();
        }

        var args = [path || ''];
        if (base) {
            args.unshift(base);
        }
        this.data = Path.resolve.apply(Path, args);
    };

    /**
     * 比较path
     *
     * @public
     * @param {string|Path} path 路径
     * @return {boolean}
     */
    Path.prototype.equal = function (path) {
        var myPath = normalize(this.data);

        if (path instanceof Path) {
            path = normalize(path.get());
        }
        else {
            path = normalize(Path.resolve(path || ''));
        }

        return myPath === path;
    };

    /**
     * 应用路径
     *
     * @public
     * @param {string|Path} path 起始路径
     * @param {boolean} from 目标路径
     */
    Path.prototype.resolve = function (path, from) {
        if (path instanceof Path) {
            path = path.get();
        }

        var args = [this.data];
        if (from) {
            args.unshift(path);
        }
        else {
            args.push(path);
        }

        this.data = Path.resolve.apply(Path, args);
    };

    return Path;
});

/**
 * @file port component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Port', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract'], function (require) {
    var inherits = require('@searchfe/underscore').inherits;
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');

    /**
     * 常见协议的默认端口号
     *
     * @const
     * @type {Object}
     */
    var DEFAULT_PORT = {
            ftp: '21',
            ssh: '22',
            telnet: '23',
            http: '80',
            https: '443',
            ws: '80',
            wss: '443'
        };

    /**
     * Prot
     *
     * @constructor
     * @param {string} data 端口号
     */
    function Port(data) {
        Abstract.call(this, data);
    }

    inherits(Port, Abstract);

    /**
     * 比较port
     *
     * @public
     * @param {string|Port} port 端口号
     * @param {string=} scheme 协议
     * @return {boolean}
     */
    Port.prototype.equal = function (port, scheme) {
        var myPort = this.data || DEFAULT_PORT[scheme];
        if (port instanceof Port) {
            port = port.get();
        }
        port = port || DEFAULT_PORT[scheme];

        return myPort === port;
    };

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    Port.prototype.toString = function () {
        return this.data ? ':' + this.data : '';
    };

    return Port;
});

/**
 * @file query component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Query', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract', 'ralltiir/src/utils/uri/util/parse-query', 'ralltiir/src/utils/uri/util/stringify-query'], function (require) {
    var _ = require('@searchfe/underscore');
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');
    var parse = require('ralltiir/src/utils/uri/util/parse-query');
    var stringify = require('ralltiir/src/utils/uri/util/stringify-query');

    /**
     * 默认的查询条件分割符
     *
     * @const
     * @type {string}
     */
    var DEFAULT_PREFIX = '?';

    /**
     * 比较数组
     *
     * @inner
     * @param {Array} a 待比较数组
     * @param {Array} b 待比较数组
     * @return {boolean}
     */
    function compareArray(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            return false;
        }

        if (a.length !== b.length) {
            return false;
        }

        a = a.slice(0);
        a = a.slice(0);
        a.sort();
        b.sort();

        var res = true;
        for (var i = 0, len = a.length; res && i < len; i++) {
            // 需要类型转化的比较
            /* eslint-disable eqeqeq */
            res = a[i] == b[i];
            /* eslint-enable eqeqeq */
        }

        return res;
    }

    /**
     * 比较对象
     *
     * @inner
     * @param {Object} a 待比较对象
     * @param {Object} b 待比较对象
     * @return {boolean}
     */
    function compareObject(a, b) {

        if (!_.isObject(a) || !_.isObject(b)) {
            return false;
        }

        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) {
            return false;
        }

        var res = true;
        for (var i = 0, key, item; res && (key = aKeys[i]); i++) {
            if (!b.hasOwnProperty(key)) {
                res = false;
                break;
            }

            item = a[key];
            if (Array.isArray(item)) {
                res = compareArray(item, b[key]);
            }
            else {
                // 需要类型转化的比较
                /* eslint-disable eqeqeq */
                res = item == b[key];
                /* eslint-enable eqeqeq */
            }
        }

        return res;
    }

    /**
     * 解码数据
     *
     * @inner
     * @param {string|Array.<string>} value 数据
     * @return {string|Array.<string>}
     */
    function decodeValue(value) {
        if (Array.isArray(value)) {
            value = value.map(function (k) {
                return decodeComponent(k);
            });
        }
        else if (value === null || value === undefined) {
            value = null;
        }
        else {
            value = decodeComponent(value);
        }
        return value;
    }

    function decodeComponent(value) {
        value = String(value).replace(/\+/g, '%20');
        return decodeURIComponent(value);
    }

    /**
     * 添加查询条件
     *
     * @inner
     * @param {string} key 键
     * @param {string|Array.<string>} value 值
     * @param {Object} items 目标数据
     * @return {Object}
     */
    function addQueryItem(key, value, items) {
        var item = items[key];

        value = decodeValue(value);

        if (item) {
            if (!Array.isArray(item)) {
                item = [item];
            }
            if (Array.isArray(value)) {
                item = item.concat(value);
            }
            else {
                item.push(value);
            }
        }
        else {
            item = value;
        }

        items[key] = item;

        return items;
    }

    /**
     * Query
     *
     * @constructor
     * @param {string|Object} data 查询条件
     */
    function Query(data) {
        data = data || {};
        Abstract.call(this, data);
    }

    _.inherits(Query, Abstract);

    /**
     * 设置query
     *
     * @public
     * @param {...string|Object} data 查询条件
     */
    Query.prototype.set = function () {

        if (arguments.length === 1) {
            var query = arguments[0];
            if (_.isObject(query)) {
                var data = this.data = {};
                _.forOwn(query, function (val, key) {
                    data[key] = decodeValue(val);
                });
            }
            else {
                this.data = parse(query);
            }
        }
        else {
            this.data[arguments[0]] = decodeValue(arguments[1]);
        }

    };

    /**
     * 获取query
     *
     * @public
     * @param {string=} name 查询条件名称
     * @return {*}
     */
    Query.prototype.get = function (name) {
        return name ? this.data[name] : _.extend({}, this.data);
    };

    /**
     * 字符串化
     *
     * @public
     * @param {string=} prefix 前缀分割符
     * @return {string}
     */
    Query.prototype.toString = function (prefix) {
        prefix = prefix || DEFAULT_PREFIX;
        var str = stringify(this.data);

        return str ? prefix + str : '';
    };

    /**
     * 比较query
     *
     * @public
     * @param {string|Object|Query} query 查询条件
     * @return {boolean}
     */
    Query.prototype.equal = function (query) {
        if (_.isString(query)) {
            query = parse(query);
        }
        else if (query instanceof Query) {
            query = query.get();
        }

        return compareObject(this.data, query);
    };

    /**
     * 添加query item
     *
     * @public
     * @param {string|Object} key 键
     * @param {string=} value 值
     */
    Query.prototype.add = function (key, value) {
        var data = this.data;

        if (_.isObject(key)) {
            Object.keys(key).forEach(function (k) {
                addQueryItem(k, key[k], data);
            });
        }
        else {
            addQueryItem(key, value, data);
        }

        this.data = data;
    };

    /**
     * 删除query item
     *
     * @public
     * @param {string=} key 键，忽略该参数则清除所有的query item
     */
    Query.prototype.remove = function (key) {
        if (!key) {
            this.data = {};
        }
        else if (this.data.hasOwnProperty(key)) {
            delete this.data[key];
        }
    };

    return Query;
});

/**
 * @file scheme component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/Scheme', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract'], function (require) {
    var _ = require('@searchfe/underscore');
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');

    /**
     * Scheme
     *
     * @constructor
     * @param {string} data 协议
     */
    function Scheme(data) {
        Abstract.call(this, data);
    }

    _.inherits(Scheme, Abstract);

    /**
     * 设置scheme
     * 忽略大小写
     *
     * @public
     * @param {string} scheme 协议
     */
    Scheme.prototype.set = function (scheme) {
        scheme = scheme || '';
        this.data = scheme.toLowerCase();
    };

    /**
     * 比较scheme
     * 忽略大小写
     *
     * @public
     * @param {string|Scheme} scheme 协议
     * @return {boolean}
     */
    Scheme.prototype.equal = function (scheme) {
        if (scheme instanceof Scheme) {
            scheme = scheme.get();
        }
        else {
            scheme = scheme || '';
        }
        return this.data === scheme.toLowerCase();
    };

    return Scheme;
});

/**
 * @file username component
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/component/UserName', ['require', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Abstract'], function (require) {
    var _ = require('@searchfe/underscore');
    var Abstract = require('ralltiir/src/utils/uri/component/Abstract');

    /**
     * UserName
     *
     * @constructor
     * @param {string} data 用户名
     */
    function UserName(data) {
        Abstract.call(this, data);
    }

    _.inherits(UserName, Abstract);

    return UserName;
});

/**
 * @file parse query
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/util/parse-query', ['require'], function (require) {

    /**
     * 解析query
     *
     * @public
     * @param {string} query 查询条件
     * @return {Object}
     */
    function parse(query) {
        var res = {};

        query = query.split('&');
        var key;
        var value;
        query.forEach(function (item) {
            if (!item) {
                return;
            }

            item = item.split('=');
            key = item[0];
            value = item.length >= 2
                ? decodeValue(item[1])
                : null;

            if (res[key]) {
                if (!Array.isArray(res[key])) {
                    res[key] = [res[key]];
                }
                res[key].push(value);
            }
            else {
                res[key] = value;
            }
        });

        return res;
    }

    function decodeValue(value) {
        value = String(value).replace(/\+/g, '%20');
        return decodeURIComponent(value);
    }

    return parse;

});

/**
 * @file stringify query
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/util/stringify-query', ['require'], function (require) {

    /**
     * 字符串化query
     *
     * @public
     * @param {Object} query 查询条件
     * @return {string}
     */
    function stringify(query) {
        var str = [];
        var item;

        Object.keys(query).forEach(function (key) {
            item = query[key];

            if (!Array.isArray(item)) {
                item = [item];
            }

            item.forEach(function (value) {
                if (value === null) {
                    str.push(key);
                }
                else {
                    str.push(key + '=' + encodeURIComponent(value || ''));
                }
            });
        });

        return str.join('&');
    }

    return stringify;
});

/**
 * @file uri parser
 * @author treelite(c.xinle@gmail.com)
 */

define('ralltiir/src/utils/uri/util/uri-parser', ['require', '@searchfe/underscore'], function (require) {

    var UNDEFINED;

    var _ = require('@searchfe/underscore');

    /**
     * 标准化URI数据
     *
     * @inner
     * @param {Object} data URI数据
     * @return {Object}
     */
    function normalize(data) {
        var res = {};
        // URI组成
        // http://tools.ietf.org/html/rfc3986#section-3
        var components = [
                'scheme', 'username', 'password', 'host',
                'port', 'path', 'query', 'fragment'
            ];

        components.forEach(function (name) {
            res[name] = data[name] || UNDEFINED;
        });

        return res;
    }

    /**
     * 解析authority
     * ! 不支持IPv6
     *
     * @inner
     * @param {string} str authority
     * @return {Object}
     */
    function parseAuthority(str) {
        var res = {};

        str.replace(
            /^([^@]+@)?([^:]+)(:\d+)?$/,
            function ($0, userInfo, host, port) {
                if (userInfo) {
                    userInfo = userInfo.slice(0, -1);
                    userInfo = userInfo.split(':');
                    res.username = userInfo[0];
                    res.password = userInfo[1];
                }

                res.host = host;

                if (port) {
                    res.port = port.substring(1);
                }
            }
        );

        return res;

    }

    /**
     * 检测是否有port
     *
     * @inner
     * @param {string} str uri字符串
     * @param {Object} data 数据容器
     * @return {boolean}
     */
    function detectPort(str, data) {
        // 忽略scheme 与 userinfo
        var res = /[^:]+:\d{2,}(\/|$)/.test(str);

        // 有port
        // 必定没有scheme
        if (res) {
            str = str.split('/');
            _.extend(data, parseAuthority(str.shift()));
            if (str.length > 0) {
                data.path = '/' + str.join('/');
            }
        }

        return res;
    }

    /**
     * 检测是否有scheme
     *
     * @inner
     * @param {string} str uri字符串
     * @param {Object} data 数据容器
     * @return {boolean}
     */
    function detectScheme(str, data) {
        var i = str.indexOf(':');
        var slashIndex = str.indexOf('/');
        slashIndex = slashIndex >= 0 ? slashIndex : str.length;

        // 不考虑authority
        var res = i >= 0 && i < slashIndex;

        if (res) {
            data.scheme = str.substring(0, i);
            data.path = str.substring(i + 1);
        }

        return res;
    }

    /**
     * 解析字符串
     *
     * @inner
     * @param {string} str uri字符串
     * @return {Object}
     */
    function parse(str) {
        var res = {};

        // 提取fragment
        var i = str.indexOf('#');
        if (i >= 0) {
            res.fragment = str.substring(i + 1);
            str = str.substring(0, i);
        }

        // 提取query
        i = str.indexOf('?');
        if (i >= 0) {
            res.query = str.substring(i + 1);
            str = str.substring(0, i);
        }

        // 检测是否同时有scheme与authority
        i = str.indexOf('://');
        if (i >= 0) {
            res.scheme = str.substring(0, i);
            str = str.substring(i + 3);
            // 特例 `file` 不存在 authority
            if (res.scheme === 'file') {
                res.path = str;
            }
            else {
                str = str.split('/');
                _.extend(res, parseAuthority(str.shift()));
                if (str.length > 0) {
                    res.path = '/' + str.join('/');
                }
            }
            return res;
        }

        // 检测是否含有port
        // 如果有必定不存在scheme
        if (detectPort(str, res)) {
            return res;
        }

        // 检测是否含有scheme
        // 如果有必定不存在authority
        if (detectScheme(str, res)) {
            return res;
        }

        // 只有host与path
        str = str.split('/');
        res.host = str.shift();
        if (str.length > 0) {
            res.path = '/' + str.join('/');
        }

        return res;
    }

    /**
     * 解析URI
     *
     * @public
     * @param {string|Object} data uri
     * @return {Object}
     */
    return function (data) {
        if (_.isString(data)) {
            data = parse(data);
        }

        return normalize(data);
    };

});

/**
 * @file URL url parse utility
 * @author treelite(c.xinle@gmail.com)
 * @module url
 */

define('ralltiir/src/utils/url', ['require', 'ralltiir/src/utils/uri/URI', '@searchfe/underscore', 'ralltiir/src/utils/uri/component/Path', 'ralltiir/src/utils/uri/util/uri-parser'], function (require) {

    var URI = require('ralltiir/src/utils/uri/URI');
    var _ = require('@searchfe/underscore');
    var Path = require('ralltiir/src/utils/uri/component/Path');
    var uRIParser = require('ralltiir/src/utils/uri/util/uri-parser');

    /**
     * 创建URI对象
     *
     * @constructor
     * @alias module:url
     * @param {...string|Object} data uri
     * @return {Object}
     */
    function url(data) {
        return new URI(data);
    }

    /**
     * 解析URI字符串
     *
     * @static
     * @param {string} str URI字符串
     * @return {Object} The URL Object
     */
    url.parse = function (str) {
        return uRIParser(str);
    };

    /**
     * resolve path
     *
     * @static
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    url.resolve = function (from, to) {
        return Path.resolve(from, to);
    };

    /**
     * Format a plain object into query string.
     *
     * @static
     * @param {Object} obj The object to be formated.
     * @return {string} The result query string.
     * @example
     * param({foo:'bar ', bar: 'foo'});     // yields "foo=bar%20&bar=foo"
     */
    url.param = function (obj) {
        if (!_.isObject(obj)) {
            return obj;
        }

        return _.map(obj, function (v, k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(v);
        })
            .join('&');
    };

    return url;
});

/**
 * @file view.js View prototype for service implementations
 * @author harttle <yangjun14@baidu.com>
 * @module view
 */

define('ralltiir/src/view', ['require'], function (require) {

    /**
     * Create a new view instance
     *
     * @alias module:view
     * @constructor
     */
    var View = function () {
        this._init();
    };

    View.prototype = {
        constructor: View,

        // eslint-disable-next-line
        _init: function () {},

        /**
         * Initialize properties
         * */
        set: function () {},

        /**
         * Get properties
         */
        get: function () {},

        /**
         * Called when view created
         */
        create: function () {},

        /**
         *  Render the DOM, called when render requested. Override this to render your HTML
         * */
        render: function () {},

        /**
         *  Update the view, called when update requested. Override this to update or re-render your HTML.
         * */
        update: function () {},

        /**
         * Callback when view attached to DOM
         */
        attach: function () {},

        /**
         * Callback when view detached from DOM
         */
        detach: function () {},

        /**
         * Destroy the view, called when destroy requested.
         * */
        destroy: function () {},

        /**
         * Bind an event to the view.
         *
         * @param {string} name The name of the event
         * @param {Function} callback The callback when the event triggered
         * */
        on: function (name, callback) {},

        /**
         * Unbind the given event
         *
         * @param {string} name The event name to unbind
         * */
        off: function (name) {}
    };

    return View;
});

define('ralltiir', ['ralltiir/src/index'], function (mod) { return mod; });
// inlinePackage('ralltiir-application');
/**
 * @file rt-app configuration
 * @author harttle<harttle@harttle.com>
 */
define('ralltiir-iframe/config', ['require'], function (require) {
    var config = {
        debugEnabled: /rt-debug/.test(location.search),
        cacheDisabled: /rt-cache-disable/.test(location.search),
        duration: getDuration(),
        animationEase: 'ease'
    };

    function getDuration() {
        var match = /rt-duration=(\d+)/.exec(location.search);
        return match ? Number(match[1]) : 300;
    }

    /* eslint-disable no-console */
    if (config.enabled) {
        console.log('Ralltiir Application debug enabled');
    }
    if (config.cacheDisabled) {
        console.log('Ralltiir Application cache disabled');
    }
    /* eslint-enable no-console */
    return config;
});

/**
 * 通用 service
 *
 * @file    service.js
 * @author  harttle<harttle@harttle.com>
 */
define('ralltiir-iframe/service', ['require', 'ralltiir', 'ralltiir-iframe/view/view', 'ralltiir-iframe/utils/performance', '@searchfe/underscore', 'ralltiir-iframe/config'], function (require) {
    var rt = require('ralltiir');
    var Promise = rt.promise;
    var View = require('ralltiir-iframe/view/view');
    var Performance = require('ralltiir-iframe/utils/performance');
    var _ = require('@searchfe/underscore');
    var logger = rt.logger;
    var config = require('ralltiir-iframe/config');

    // eslint-disable-next-line
    function Service(url, options) {
        this.options = normalize(options);
        this.scope = {
            performance: new Performance(),
            options: this.options
        };
        this.name = this.options.name;
    }

    Service.prototype.hasValidView = function () {
        return this.view && this.view.valid;
    };

    Service.prototype.shouldUseCache = function (current, useAnimation) {
        if (config.cacheDisabled) {
            return false;
        }
        if (this.options.isolateCSS && useAnimation) {
            return false;
        }
        var reason = _.get(current, 'options.src');
        return reason === 'back' || reason === 'history';
    };

    Service.prototype.beforeAttach = function (current) {
        this.scope.performance.startNavigation();
        _.assign(this.options, current.options);
        var useAnimation = this.shouldEnterAnimate(current);
        logger.debug('service.beforeAttach', this.beforeAttach);

        if (this.shouldUseCache(current, useAnimation) && this.hasValidView()) {
            logger.info('using cached dom for', current.url);
            this.view.reuse();
        }
        else if (isServerRendered(current)) {
            var rootEl = document.querySelector('#sfr-app .rt-view');
            this.view = new View(this.scope, rootEl);
        }
        else {
            this.view = new View(this.scope);
            this.view.fetchUrl(current.url);
        }

        return this.view.enter(useAnimation);
    };

    Service.prototype.shouldEnterAnimate = function (state) {
        if (isServerRendered(state)) {
            return false;
        }
        var reason = _.get(state, 'options.src');
        return !reason || reason === 'hijack';
    };

    Service.prototype.shouldExitAnimate = function (current, prev) {
        if (this.options.isolateCSS) {
            if (!this.name) {
                return false;
            }
            if (this.name !== _.get(current, 'service.name')) {
                return false;
            }
        }
        var reason = _.get(current, 'options.src');
        return reason === 'back';
    };

    Service.prototype.attach = function (current) {
        var view = this.view;
        view.setActive();

        return Promise.resolve()
        .then(function () {
            return view.populated ? '' : view.render();
        })
        .then(function () {
            return view.setAttached();
        })
        .catch(function (err) {
            var code = err.code || 999;
            var msg = err.message || 'unkown';
            var query = location.search + (location.search ? '&' : '?');

            // eslint-disable-next-line
            console.error(err);
            if (_.get(current, 'options.src') !== 'sync' && query.indexOf('rt-err=') === -1) {
                query += 'rt-err=' + code;
                query += '&rt-msg=' + encodeURIComponent(msg);
                var url = location.protocol + '//' + location.host
                    + location.pathname + query + location.hash;
                location.replace(url);
            }
        });
    };

    Service.prototype.beforeDetach = function (current, prev) {
        return this.view.prepareExit(this.shouldExitAnimate(current, prev));
    };

    Service.prototype.detach = function (current, prev, extra) {
        var view = this.view;
        return view
        .exit(this.shouldExitAnimate(current, prev))
        .then(function () {
            view.setDetached();
        });
    };

    Service.prototype.destroy = function () {
        return this.view.destroy();
    };

    Service.setBackHtml = function (html) {
        View.backHtml = html;
    };

    function isServerRendered(state) {
        return _.get(state, 'options.src') === 'sync';
    }

    function normalize(options) {
        if (!options) {
            return {};
        }
        options = _.cloneDeep(options);
        if (options.view || options.head) {
            // eslint-disable-next-line
            console.warn(
                '[DEPRECATED] options.head, options.view will not be supported in future version',
                'checkout: https://ralltiir.github.io/ralltiir/get-started/view-options.html'
            );
        }
        options = _.assign({}, options, options.view, options.head);

        if (_.isString(options.title)) {
            options.title = {html: options.title};
        }
        if (_.isString(options.subtitle)) {
            options.subtitle = {html: options.subtitle};
        }
        if (_.isString(options.back)) {
            options.back = {html: options.back};
        }
        _.forEach(options.actions, function (action, i) {
            if (_.isString(action)) {
                options.actions[i] = {html: action};
            }
        });
        if (options.baseUrl === undefined) {
            options.baseUrl = '';
        }
        return options;
    }

    return Service;
});

/**
 * @file page animation
 * @author taoqingqian01
 * */
define('ralltiir-iframe/utils/animation', ['require', 'ralltiir-iframe/utils/ua', 'ralltiir', '@searchfe/underscore', '@searchfe/promise', 'ralltiir-iframe/utils/dom', 'ralltiir-iframe/utils/spark', 'ralltiir-iframe/config'], function (require) {
    var UA = require('ralltiir-iframe/utils/ua');
    var rt = require('ralltiir');
    var _ = require('@searchfe/underscore');
    var Promise = require('@searchfe/promise');
    var logger = rt.logger;
    var dom = require('ralltiir-iframe/utils/dom');
    var Spark = require('ralltiir-iframe/utils/spark');
    var config = require('ralltiir-iframe/config');
    var exports = {};

    exports.enter = function (el, sx, sy) {
        dom.css(el, {
            'display': 'block',
            'position': 'fixed',
            'z-index': '600',
            'top': 0,
            'left': 0,
            'height': '100%',
            'width': '100%',
            'overflow': 'hidden',
            'opacity': 0,
            '-webkit-transform': translate3d('100%', 0, 0),
            'transform': translate3d('100%', 0, 0)
        });
        restoreFixedPosition(el, sx, sy);
        return new Promise(function (resolve) {
            Spark.css3(el, {
                'opacity': 1,
                '-webkit-transform': translate3d(0, 0, 0),
                'transform': translate3d(0, 0, 0)
            }, config.duration, config.animationEase, 0, resolve);
        });
    };

    function restoreFixedPosition(el, sx, sy) {
        logger.debug('[restoreFixedPosition] with scrollLeft/Top:', sx, sy);
        el.scrollLeft = sx;
        el.scrollTop = sy;
        dom.css(el.querySelector('.rt-head'), {
            'z-index': '610',
            'top': (sy || 0) + 'px'
        });
        _.forEach(el.querySelectorAll('.rt-fixed'), function (el) {
            dom.css(el, {opacity: '0'});
        });
    }

    exports.prepareExit = function (el, sx, sy) {
        logger.debug('prepareing exit animation with scrollX/scrollY', sx, sy);
        dom.css(el, {
            'position': 'fixed',
            'z-index': '600',
            'top': 0,
            'left': 0,
            'opacity': 1,
            'height': '100%',
            'width': '100%',
            'overflow': 'hidden',
            '-webkit-transform': translate3d(0, 0, 0),
            'transform': translate3d(0, 0, 0)
        });
        if (shouldScrollFixed()) {
            restoreFixedPosition(el, sx, sy);
        }
    };

    exports.exit = function (el, sx, sy) {
        return new Promise(function (resolve) {
            Spark.css3(el, {
                'left': '100%',
                '-webkit-transform': translate3d(0, 0, 0),
                'transform': translate3d(0, 0, 0)
            }, config.duration, config.animationEase, 0, function () {
                dom.css(el, {display: 'none'});
                resolve();
            });
        });
    };

    exports.exitSilent = function (el) {
        dom.css(el, {
            display: 'none'
        });
        return Promise.resolve();
    };

    exports.resetStyle = function (viewEl) {
        logger.debug('resetting styles for', viewEl);
        dom.css(viewEl, {
            'display': '',
            'opacity': '',
            'position': '',
            'z-index': '',
            'top': '',
            'left': '',
            'height': '',
            'width': '',
            'overflow': '',
            '-webkit-transform': '',
            'transform': ''
        });
        dom.css(viewEl.querySelector('.rt-head'), {
            'z-index': '',
            'position': '',
            'top': ''
        });
        _.forEach(viewEl.querySelectorAll('.rt-fixed'), function (el) {
            dom.css(el, {opacity: ''});
        });
    };

    function shouldScrollFixed() {
        if (!UA.isIOS) {
            return true;
        }
        return UA.isWKWebView && !UA.isBaidu;
    }
    function translate3d(x, y, z) {
        x = x ? x : 0;
        y = y ? y : 0;
        z = z ? z : 0;
        if (typeof x === 'number') {
            x += 'px';
        }
        if (typeof y === 'number') {
            y += 'px';
        }
        if (typeof z === 'number') {
            z += 'px';
        }
        return 'translate3d(' + x + ',' + y + ',' + z + ')';
    }

    return exports;
});

/**
 * @file dom utility
 * @author harttle<harttle@harttle.com>
 */
define('ralltiir-iframe/utils/dom', ['require', 'ralltiir'], function (require) {
    var _ = require('ralltiir')._;

    function removeNode(node) {
        node.remove();
    }

    function closest(element, predict) {
        var parent = element;
        while (parent !== null && !predict(parent)) {
            parent = parent.parentNode;
        }
        return parent;
    }

    function truthy(val) {
        return !!val;
    }

    function addClass(el, name) {
        var cls = (el.className || '') + ' ' + name;
        var map = {};
        cls.split(/\s+/g).forEach(function (cls) {
            map[cls] = true;
        });
        el.className = _.keys(map).join(' ');
    }

    function removeClass(el, name) {
        var cls = (el.className || '');
        var map = {};
        cls.split(/\s+/g).forEach(function (cls) {
            map[cls] = true;
        });

        (name || '').split(/\s+/g).forEach(function (cls) {
            delete map[cls];
        });
        el.className = _.keys(map).join(' ');
    }

    function elementFromString(html) {
        return wrapElementFromString(html).childNodes[0];
    }
    function createElement(name) {
        return document.createElement(name);
    }
    function wrapElementFromString(html) {
        var div = document.createElement('div');
        div.innerHTML = html || '';
        return div;
    }
    function trigger(el, type, options) {
        var event = new Event(type, {
            bubbles: true
        });
        _.assign(event, options);
        el.dispatchEvent(event);
    }
    function css(el, obj) {
        var style = {};
        var currStyle = el.getAttribute('style') || '';
        currStyle
            .split(';')
            .forEach(function (statement) {
                var tokens = statement.split(':');
                var key = (tokens[0] || '').trim();
                var val = (tokens[1] || '').trim();
                if (key && val) {
                    style[key] = val;
                }
            });
        _.assign(style, obj);
        var styleText = '';
        _.forOwn(style, function (val, key) {
            if (val === '') {
                return;
            }
            styleText += key + ':' + val + ';';
        });
        el.setAttribute('style', styleText);
    }

    function show(el) {
        css(el, {display: 'block'});
    }

    function hide(el) {
        css(el, {display: 'none'});
    }

    return {
        css: css,
        removeClass: removeClass,
        addClass: addClass,
        elementFromString: elementFromString,
        wrapElementFromString: wrapElementFromString,
        trigger: trigger,
        show: show,
        removeNode: removeNode,
        closest: closest,
        hide: hide
    };
});

/**
 * @file feature detects
 * @author oott123
 */

define('ralltiir-iframe/utils/features', ['require'], function (require) {
    function detectCSS(text) {
        var el = document.createElement('div');
        el.style.cssText = text;
        return !!el.style.length;
    }
    function detectCSSCalc() {
        return detectCSS('width: calc(100px)');
    }
    function detectCSSViewportUnits() {
        return detectCSS('width: 100vw');
    }

    return {
        detectCSS: detectCSS,
        detectCSSCalc: detectCSSCalc,
        detectCSSViewportUnits: detectCSSViewportUnits
    };
});


/**
 * 通用 service
 *
 * @file    service.js
 * @author  harttle<harttle@harttle.com>
 */
define('ralltiir-iframe/utils/performance', ['require'], function (require) {

    /**
     * Page Performance Data
     *
     * @class
     */
    function Performance() {
        this.init();
    }

    Performance.prototype.init = function () {
        this.navigationStart = null;
        this.requestStart = null;
        this.domLoading = null;
        this.headInteractive = null;
        this.domContentLoaded = null;
        this.domInteractive = null;
    };

    Performance.prototype.startNavigation = function () {
        this.init();
        this.navigationStart = Date.now();
    };
    return Performance;
});

/**
 * @file Overview: naboo framework core code
 * @author: zhulei05
 * @email: zhulei05@baidu.com
 * @version 1.0
 * @copyright 2015 Baidu.com, Inc. All Rights Reserved
 */

(function (window, factory) {
    if (typeof define === 'function' && define.amd) {
        define('ralltiir-iframe/utils/spark', [], factory);
    }
    else {
        window.Spark = factory();
    }
})(this, function () {
    // 动画工具集
    var Spark = {};

    // Spark析构flag，析构时设置为true
    Spark.disposed = false;

    // Spark析构函数
    Spark.dispose = function () {
        Spark.disposed = true;
    };

    // css3动画

    /**
     * @fileOverview 工具集之css3动画（animation + transition）
     * @author: zhulei05
     * @email: zhulei05@baidu.com
     */

    (function () {
        // 定义一批检测浏览器特性需要的变量
        var prefix = '';
        var eventPrefix;
        var vendors = {
            Webkit: 'webkit',
            Moz: '',
            O: 'o'
        };
        var testEl = document.createElement('div');
        var supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i;
        var isNaN = Number.isNaN || window.isNaN;
        var transform;
        var transitionProperty;
        var transitionDuration;
        var transitionTiming;
        var transitionDelay;
        var animationName;
        var animationDuration;
        var animationTiming;
        var animationDelay;
        var animationFillMode;
        var transitionEnd;
        var animationEnd;

        function dasherize(str) {
            return str.replace(/([A-Z])/g, '-$1').toLowerCase();
        }

        function normalizeEvent(name) {
            return eventPrefix ? eventPrefix + name : name.toLowerCase();
        }

        // 检测浏览器特性
        if (testEl.style.transform === undefined) {
            for (var prop in vendors) {
                if (testEl.style[prop + 'TransitionProperty'] !== undefined) {
                    prefix = '-' + prop.toLowerCase() + '-';
                    eventPrefix = vendors[prop];
                    break;
                }

            }
        }

        // css tranform属性名
        transform = prefix + 'transform';

        // css transition各属性名
        transitionProperty = prefix + 'transition-property';
        transitionDuration = prefix + 'transition-duration';
        transitionDelay = prefix + 'transition-delay';
        transitionTiming = prefix + 'transition-timing-function';
        transitionEnd = normalizeEvent('TransitionEnd');

        // css animation各属性名
        animationName = prefix + 'animation-name';
        animationDuration = prefix + 'animation-duration';
        animationDelay = prefix + 'animation-delay';
        animationTiming = prefix + 'animation-timing-function';
        animationFillMode = prefix + 'animation-fill-mode';
        animationEnd = normalizeEvent('AnimationEnd');

        // 动画完成后清空设置
        var cssReset = {};
        cssReset[transitionProperty] = '';
        cssReset[transitionDuration] = '';
        cssReset[transitionDelay] = '';
        cssReset[transitionTiming] = '';
        cssReset[animationName] = '';
        cssReset[animationDuration] = '';
        cssReset[animationDelay] = '';
        cssReset[animationTiming] = '';

        // 是否不支持transition
        var off = eventPrefix === undefined && testEl.style.transitionProperty === undefined;

        /**
         * 各种缓动函数
         *
         * 如果有需求，可以通过 cubic-bezier 添加更多类型
         *
         * @type {Object}
         */
        var timing = {
            'linear': 'linear',
            'ease': 'ease',
            'ease-in': 'ease-in',
            'ease-out': 'ease-out',
            'ease-in-out': 'ease-in-out'
        };

        // 获取keyframes的动画名字的正则
        var keyFrameReg = /^@(?:-webkit-)?keyframes\s+(?:['"])?(\w+)(?:['"])?\s*{/;

        /**
         * 设置dom对象的css
         *
         * 实现方法同zepto的css
         *
         * @param {Object} dom 要设置css的dom节点
         * @param {Object} obj 存放css信息的对象
         */
        function setCss(dom, obj) {
            var css = '';

            for (var key in obj) {
                if (!obj[key] && obj[key] !== 0) {
                    dom.style.removeProperty(dasherize(key));
                }
                else {
                    css += dasherize(key) + ':' + obj[key] + ';';
                }
            }

            dom.style.cssText += ';' + css;
        }

        /**
         * 判断一个css属性是否需要px单位
         *
         * @param  {string} prop 属性名
         *
         * @return {boolean}     true表示需要，false表示不需要
         */
        function needPx(prop) {
            if (prop.indexOf('translate') > -1) {
                return true;
            }

            testEl.style[prop] = 0;
            if (testEl.style[prop].replace(/\d/g, '') === 'px') {
                return true;
            }

            return false;
        }

        /**
         * css3动画函数，供插件开发者调用
         *
         * @param  {Object}   dom      要进行动画的dom对象
         * @param  {Object | string}   property   要改变的css属性键值对或者keyframes字符串
         * @param  {number}   duration 动画执行时间
         * @param  {string}   ease     缓动函数
         * @param  {number}   delay    延迟时间
         * @param  {Function} cb       动画完成后的回调函数
         */
        Spark.css3 = function (dom, property, duration, ease, delay, cb) {
            Spark.disposed = false;
            if (dom && property) {
                if (!dom.getAttribute('data-naboo')) {
                    dom.setAttribute('data-naboo', 0);
                }

                dom.setAttribute('data-naboo', +dom.getAttribute('data-naboo') + 1);
                if (off) {
                    duration = 0;
                }
                duration = Math.max(duration, 0);
                // 缓动函数默认为 linear
                ease = timing[ease] || 'linear';
                // 延迟时间默认为 0，单位ms
                delay = Number(delay) || 0;

                var cssValues = {};
                var endEvent;

                duration /= 1000;
                delay /= 1000;

                // keyframe动画
                if (typeof property === 'string') {
                    // 动画名称
                    var name;
                    if (keyFrameReg.test(property)) {
                        name = property.match(keyFrameReg)[1];
                        var newName = name + '_' + Date.now();
                        var styleTag = document.createElement('style');
                        styleTag.innerText = property.replace(new RegExp(name, 'g'), newName);
                        document.head.appendChild(styleTag);
                        name = newName;
                    }
                    else {
                        name = property;
                    }
                    cssValues[animationName] = dom.style[animationName]
                        + (dom.style[animationName] ? ', ' : '') + name;
                    cssValues[animationDuration] = dom.style[animationDuration]
                        + (dom.style[animationDuration] ? ', ' : '') + duration + 's';
                    cssValues[animationTiming] = dom.style[animationTiming]
                        + (dom.style[animationTiming] ? ', ' : '') + ease;
                    cssValues[animationDelay] = dom.style[animationDelay]
                        + (dom.style[animationDelay] ? ', ' : '')
                        + delay + 's';
                    cssValues[animationFillMode] = 'both';
                    endEvent = animationEnd;
                }
                // transition动画
                else if (Object.prototype.toString.call(property) === '[object Object]') {
                    var cssProperty = [];
                    var transformCollection = '';
                    for (var key in property) {
                        var value = property[key];
                        if (!isNaN(Number(value)) && needPx(key)) {
                            value += 'px';
                        }

                        if (supportedTransforms.test(key)) {
                            transformCollection += key + '(' + value + ') ';
                        }
                        else {
                            cssValues[key] = value;
                            cssProperty.push(dasherize(key));
                        }
                    }
                    if (transformCollection) {
                        cssValues[transform] = transformCollection;
                        cssProperty.push(transform);
                    }

                    if (duration > 0) {
                        cssValues[transitionProperty] = dom.style[transitionProperty]
                            + (dom.style[transitionProperty] ? ', ' : '') + cssProperty.join(', ');
                        cssValues[transitionDuration] = dom.style[transitionDuration]
                            + (dom.style[transitionDuration] ? ', ' : '') + duration + 's';
                        cssValues[transitionTiming] = dom.style[transitionTiming]
                            + (dom.style[transitionTiming] ? ', ' : '') + ease;
                        cssValues[transitionDelay] = dom.style[transitionDelay]
                            + (dom.style[transitionDelay] ? ', ' : '') + delay + 's';
                    }

                    endEvent = transitionEnd;
                }

                // 回调是否执行
                var fired = false;

                // 包装后的回调函数
                var wrappedCallback = function (event) {
                    if (event && (event.elapsedTime !== (duration + delay))) {
                        return;
                    }

                    if (typeof event !== 'undefined') {
                        if (event.target !== event.currentTarget) {
                            // 确保事件不是从底部冒泡上来的
                            return;
                        }

                        event.target.removeEventListener(endEvent, wrappedCallback);
                    }
                    else {
                        // 由setTimeout触发
                        dom.removeEventListener(endEvent, wrappedCallback);
                    }
                    fired = true;
                    dom.setAttribute('data-naboo', +dom.getAttribute('data-naboo') - 1);
                    (+dom.getAttribute('data-naboo') === 0) && setCss(dom, cssReset);
                    cb && cb();
                };

                if (duration > 0) {
                    dom.addEventListener(endEvent, wrappedCallback);

                    // 在某些老式的android手机上，transitionEnd事件有可能不会触发，这时候我们需要手动执行回调
                    setTimeout(function () {
                        if (Spark.disposed) {
                            return;
                        }

                        if (!fired) {
                            wrappedCallback();
                        }

                    }, (duration + delay) * 1000 + 25);
                }

                // 触发reflow让元素可以执行动画
                dom.clientLeft;
                setCss(dom, cssValues);
            }

        };
    })();

    // js动画

    /**
     * @fileOverview 工具集之js动画（setTimeout or requestAnimationFrame）
     * @author: zhulei05
     * @email: zhulei05@baidu.com
     */

    (function () {
        /* eslint-disable */
        /*
         * Tween.js
         * t: current time（当前时间）；
         * b: beginning value（初始值）；
         * c: change in value（变化量）；
         * d: duration（持续时间）。
         * you can visit 'http://easings.net/zh-cn' to get effect
         */
        var Tween = {
            Linear: {
                easeIn: function (t, b, c, d) {
                    return c * t / d + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * t / d + b;
                },
                easeInOut: function (t, b, c, d) {
                    return c * t / d + b;
                }
            },
            Quad: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t + b;
                    }

                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                }
            },
            Cubic: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t * t + b;
                    }

                    return c / 2 * ((t -= 2) * t * t + 2) + b;
                }
            },
            Quart: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t * t * t + b;
                    }

                    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
                }
            },
            Quint: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t * t * t * t + b;
                    }

                    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
                }
            },
            Sine: {
                easeIn: function (t, b, c, d) {
                    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * Math.sin(t / d * (Math.PI / 2)) + b;
                },
                easeInOut: function (t, b, c, d) {
                    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
                }
            },
            Expo: {
                easeIn: function (t, b, c, d) {
                    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
                },
                easeOut: function (t, b, c, d) {
                    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if (t == 0) {
                        return b;
                    }

                    if (t == d) {
                        return b + c;
                    }

                    if ((t /= d / 2) < 1) {
                        return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                    }

                    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
                }
            },
            Circ: {
                easeIn: function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                    }

                    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
                }
            },
            Elastic: {
                easeIn: function (t, b, c, d, a, p) {
                    var s;
                    if (t == 0) {
                        return b;
                    }

                    if ((t /= d) == 1) {
                        return b + c;
                    }

                    if (typeof p == 'undefined') {
                        p = d * .3;
                    }

                    if (!a || a < Math.abs(c)) {
                        s = p / 4;
                        a = c;
                    }
                    else {
                        s = p / (2 * Math.PI) * Math.asin(c / a);
                    }
                    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                },
                easeOut: function (t, b, c, d, a, p) {
                    var s;
                    if (t == 0) {
                        return b;
                    }

                    if ((t /= d) == 1) {
                        return b + c;
                    }

                    if (typeof p == 'undefined') {
                        p = d * .3;
                    }

                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    }
                    else {
                        s = p / (2 * Math.PI) * Math.asin(c / a);
                    }
                    return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
                },
                easeInOut: function (t, b, c, d, a, p) {
                    var s;
                    if (t == 0) {
                        return b;
                    }

                    if ((t /= d / 2) == 2) {
                        return b + c;
                    }

                    if (typeof p == 'undefined') {
                        p = d * (.3 * 1.5);
                    }

                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    }
                    else {
                        s = p / (2 * Math.PI) * Math.asin(c / a);
                    }
                    if (t < 1) {
                        return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                    }

                    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
                }
            },
            Back: {
                easeIn: function (t, b, c, d, s) {
                    if (typeof s == 'undefined') {
                        s = 1.70158;
                    }

                    return c * (t /= d) * t * ((s + 1) * t - s) + b;
                },
                easeOut: function (t, b, c, d, s) {
                    if (typeof s == 'undefined') {
                        s = 1.70158;
                    }

                    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                },
                easeInOut: function (t, b, c, d, s) {
                    if (typeof s == 'undefined') {
                        s = 1.70158;
                    }

                    if ((t /= d / 2) < 1) {
                        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                    }

                    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
                }
            },
            Bounce: {
                easeIn: function (t, b, c, d) {
                    return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b;
                },
                easeOut: function (t, b, c, d) {
                    if ((t /= d) < (1 / 2.75)) {
                        return c * (7.5625 * t * t) + b;
                    }
                    else if (t < (2 / 2.75)) {
                        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                    }
                    else if (t < (2.5 / 2.75)) {
                        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                    }
                    else {
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                    }
                },
                easeInOut: function (t, b, c, d) {
                    if (t < d / 2) {
                        return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                    }
                    else {
                        return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
                    }
                }
            }
        };

        // requestAnimationFrame polyfill
        (function () {
            var lastTime = 0;
            var vendors = ['webkit', 'moz'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
                    window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                        if (Spark.disposed) {
                            return;
                        }

                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }

        }());

        /**
         * 对单个属性执行动画
         *
         * @param  {Object}   dom      dom对象
         * @param  {string}   attr     修改的属性
         * @param  {number}   origin   初始值
         * @param  {number}   dest     目标值
         * @param  {string}   unit     属性值的单位
         * @param  {number}   duration 动画时长，单位ms
         * @param  {Function} easeFn   缓动函数
         * @param  {Function} cb       动画结束时的回调
         *
         * @return {Undefined}
         */
        function _animate(dom, attr, origin, dest, unit, duration, easeFn, cb) {
            var lastTime = Date.now();
            var curTime;
            var change = dest - origin;
            function _run() {
                curTime = Date.now();
                var start = curTime - lastTime;
                var pos = easeFn(start, origin, change, duration);
                if (unit) {
                    pos += '' + unit;
                }

                if (dom.style[attr] !== undefined) {
                    dom.style[attr] = pos;
                }
                else {
                    dom[attr] = pos;
                }
                if (start < duration) {
                    window.requestAnimationFrame(_run);
                }
                else {
                    (dom.style[attr] !== undefined) ? (dom.style[attr] = dest + '' + unit) : (dom[attr] = dest + '' + unit);
                    cb();
                }
            }
            _run();
        }

        /**
         * js动画函数，供插件开发者调用
         *
         * @param  {Object}   dom      要进行动画的dom对象
         * @param  {Object}   property   要改变的css属性键值对
         * @param  {number}   duration 动画执行时间
         * @param  {string}   tween    缓动函数曲线次方
         * @param  {string}   ease     缓动函数
         * @param  {number}   delay    延迟时间
         * @param  {Function} cb       动画完成后的回调函数
         *
         * @return {Object}            当前实例
         */
        Spark.js = function (dom, property, duration, tween, ease, delay, cb) {
            Spark.disposed = false;
            var easeFn = Tween[tween][ease];
            var originProperty = dom.ownerDocument.defaultView.getComputedStyle(dom, null);
            if (!cb) {
                cb = delay;
                delay = 0;
            }

            var reg = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
            setTimeout(function () {
                if (Spark.disposed) {
                    return;
                }

                var n = 0;
                for (var key in property) {
                    n++;
                    var origin = originProperty[key] || originProperty.getPropertyValue(key);
                    if (!origin && origin !== 0) {
                        origin = dom[key];
                    }

                    var parts = reg.exec(origin);
                    var unit = parts[3];
                    origin = parseFloat(parts[2]);
                    var dest = parseFloat(property[key]);
                    _animate(dom, key, origin, dest, unit, duration, easeFn, function () {
                        n--;
                        if (n <= 0) {
                            cb();
                        }

                    });
                }
            }, delay);
        };
        /* eslint-enable */
    })();

    return Spark;
});

/**
 * @file UA related tests
 * @author harttle<harttle@harttle.com>
 */
define('ralltiir-iframe/utils/ua', ['require'], function (require) {
    var ua = navigator.userAgent;
    var isIOS = /(iPad|iPhone|iPod)/.test(ua);

    var match = ua.match(/ applewebkit\/(\d+)/i);
    var awVersion = match && parseFloat(match[1]);
    var isWKWebView = +awVersion > 600;

    var isBaidu = /baiduboxapp|baiduhi/.test(ua);

    return {
        isIOS: isIOS,
        isWKWebView: isWKWebView,
        isBaidu: isBaidu
    };
});

/**
 * @file url utility
 * @author harttle<harttle@harttle.com>
 */
define('ralltiir-iframe/utils/url', ['require', 'ralltiir'], function (require) {
    // TODO replace this with WHATWG URL
    var exports = {};
    var _ = require('ralltiir')._;

    function setQuery(url, key, val) {
        if (typeof key === 'object') {
            _.forOwn(key, function (val, key) {
                url = setQuery(url, key, val);
            });
            return url;
        }
        url += /\?/.test(url) ? '&' : '?';
        url += encodeURIComponent(key) + '=' + encodeURIComponent(val);
        return url;
    }

    return {setQuery: setQuery};
});

define('ralltiir-iframe/view/handleMessages', ['require', 'ralltiir'], function (require) {
    var rt = require('ralltiir');
    // 熊掌号登录相关逻辑
    function setupLogin(view) {
        // 构建登录所需的 url
        var oobUrlParser = document.createElement('a');
        oobUrlParser.href = 'oob.html?';
        var oobUrl = oobUrlParser.href;
        var authUrl = 'https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&scope=snsapi_userinfo';

        // MIP 页面请求登录
        // 打开新页面，携带 login=1 的 url 参数（为了区别缓存）
        // 将当前的 options 都存到 prevOptions 里，一并传过去
        view.loader.on('mip-login-xzh', function (_, event) {
            var state = event.data.state;
            var clientId = event.data.clientId;
            if (!state || !clientId) {
                console.error('state and clientid are required!');
                return;
            }
            var redirectUrl = oobUrl + 'url=' + encodeURIComponent(location.pathname + location.search);
            var iframedUrl = authUrl
                + '&client_id=' + encodeURIComponent(clientId)
                + '&redirect_uri=' + encodeURIComponent(redirectUrl)
                + '&state=' + encodeURIComponent(state)
                + '&_=' + Date.now();
            var options = {
                backendUrl: iframedUrl,
                notMip: true
            };
            setTimeout(function () {
                rt.action.redirect('external.html?url=' + encodeURIComponent(iframedUrl), null, options);
            }, 200);
        });

        // MIP 页面登录完成回调
        // 找 prevOptions 然后继续放过去
        view.loader.on('mip-login-xzh-oob', function (_, event) {
            var state = event.data.state;
            var code = event.data.code;
            var url = event.data.url;
            if (!state || !code || event.data.status !== 'success') {
                // 登录失败……
                console.error('missing state or code or data');
                rt.back();
                return;
            }

            var success = $([
                '<div class="sfa-view-loggedin">',
                    '<svg t="1524813991084" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1132" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M398.72 800a32 32 0 0 1-22.4-9.28l-226.24-227.84a32 32 0 0 1 0-45.12 32 32 0 0 1 45.12 0l203.52 203.52L828.8 291.2a32 32 0 0 1 45.12 0 32 32 0 0 1 0 45.44L421.44 789.12a32 32 0 0 1-22.72 10.88z" p-id="1133"></path></svg>',
                    '<div class="sfa-view-loggedin-text">登录成功</div>',
                '</div>'
            ].join(''));

            $(view.bodyEl).append(success);
            setTimeout(function () {
                view.loading.hide();
                success.addClass('sfa-view-loggedin-fadein');
            }, 50);

            setTimeout(function () {
                success.remove();
                rt.action.reset(url, null, {
                    backendUrl: url
                        + '#state=' + encodeURIComponent(state)
                        + '&code=' + encodeURIComponent(code)
                        + '&redirect_uri=' + encodeURIComponent(oobUrl + 'url=' + encodeURIComponent(url))
                        + '&_'
                });
            }, 1800);
        });
    }

    // 百度钱包支付相关逻辑
    function setupSimplePay(view) {
        // 构建登录所需的 url
        view.loader.on('mip-simple-pay', function (_, event) {
            var url = event.data.url;
            if (!url || !url.match(/^https\:\/\/www\.baifubao\.com\/api\/0\/pay\/0\/wapdirect\//)) {
                console.log('Simple pay URL not allowed, only baifubao urls are allowed');
                return;
            }
            // 百度钱包在 iOS 11.3+ 下，iframe 会取不到跨域 cookies
            // 经测试换成 qianbao 二级域名就可以了
            var qianbaoUrl = url.replace(/^https\:\/\/www\.baifubao\.com\//, 'https://qianbao.baidu.com/');
            rt.action.redirect('external.html?url=' + encodeURIComponent(qianbaoUrl), null, {
                backendUrl: qianbaoUrl,
                notMip: true,
                iframeTopOffset: -44
            });
        });
    }

    function setupNewPage(view) {
        view.loader.on('mip-loadiframe', function (_, event) {
            var url = event.data.url;
            if (!url) {
                return;
            }
            var click = {};
            if (event.data.click) {
                try {
                    click = JSON.parse(event.data.click);
                }
                catch (e) {
                    click = {};
                }
            }
            var redirectUrl = '';
            var redirectFunction = click.replace ? 'reset' : 'redirect';
            var redirectOptions = {};
            if (url.match(/^(https?:)?\/\//)) {
                redirectUrl = 'external.html?url=' + encodeURIComponent(url);
                redirectOptions.backendUrl = url;
            }
            else {
                redirectUrl = url;
            }
            rt.action[redirectFunction](redirectUrl, null, redirectOptions);
        });
    }

    return function (view) {
        setupSimplePay(view);
        setupLogin(view);
        setupNewPage(view);
    };
});

/**
 * @file    载入动画
 * @author  harttle@harttle.com
 */

define('ralltiir-iframe/view/loading', ['require', 'ralltiir-iframe/utils/dom'], function (require) {
    var dom = require('ralltiir-iframe/utils/dom');

    var html = [
        '<div class="rt-loading">',
        '  <span class="rt-loading-logo"></span>',
        '  <span class="rt-loading-bar"></span>',
        '</div>'
    ].join('\n');

    function Loading(parent) {
        this.container = parent;
        this.element = dom.elementFromString(html);
    }

    Loading.prototype.show = function () {
        dom.css(this.container, {'background-color': '#fff'});
        this.container.appendChild(this.element);
    };

    Loading.prototype.hide = function () {
        dom.css(this.container, {'background-color': ''});
        this.element.remove();
    };

    return Loading;
});

/**
 * @file render streamed partial render impl
 * @author harttle<harttle@harttle.com>
 * The Template Render, render templates in serial.
 */
define('ralltiir-iframe/view/render', ['require', '@searchfe/assert', '@searchfe/underscore', '@searchfe/promise', 'ralltiir-iframe/utils/dom'], function (require) {
    var assert = require('@searchfe/assert');
    var _ = require('@searchfe/underscore');
    var Promise = require('@searchfe/promise');
    // reference: https://github.com/jquery/jquery/blob/master/src/manipulation/var/rscriptType.js
    var rscriptType = /^$|\/(?:java|ecma)script/i;
    var rstylesheetType = /stylesheet/i;
    var dom = require('ralltiir-iframe/utils/dom');

    /**
     * Render utility
     *
     * @class
     */
    function Render() {}

    Render.prototype.moveClasses = function (from, to) {
        (from.className || '').split(/\s+/).forEach(function (cls) {
            dom.addClass(to, cls);
        });
    };

    Render.prototype.render = function (parent, docfrag, options) {
        var renderid = Math.random().toString(36).substr(1);

        return Promise.resolve()
            .then(function () {
                assert(docfrag, 'root element not exist');
                var links = docfrag.querySelectorAll('link');
                markRenderID(links, renderid);
                return enforceCSS(links, parent);
            })
            .then(function () {
                if (options.replace) {
                    _
                    .filter(parent.childNodes, notMarkedBy(renderid))
                    .forEach(dom.removeNode);
                }
                moveNodes(docfrag, parent);
                options.onContentLoaded && options.onContentLoaded();
            })
            .then(function () {
                return this.enforceJS(parent, options.boforeEvalScript);
            }.bind(this));
    };

    /**
     * Parse HTML to DOM Object
     *
     * @param {string} html The html string to render with
     * @return {HTMLElement} element containing the DOM tree from `html`
     */
    Render.parse = function (html) {
        // documentFragment does not allow setting arbitrary innerHTML,
        // use <div> instead.
        var docfrag = document.createElement('div');
        docfrag.innerHTML = html;

        _.forEach(docfrag.querySelectorAll('[data-rt-omit]'), function (el) {
            el.remove();
        });
        return docfrag;
    };

    function moveNodes(from, to) {
        while (from.childNodes.length > 0) {
            to.appendChild(from.childNodes[0]);
        }
    }

    /**
     * Wait for `<link rel="stylesheet">` loading within the given HTML element
     *
     * @param {HTMLElementCollection} links The elements containing `<link rel="stylesheet">` tags
     * @param {HTMLElement} parent the parent dom to which links will attach
     * @return {Promise} resolves when all links complete/error, never rejects
     */
    function enforceCSS(links, parent) {
        var pendingCSS = _
            .toArray(links)
            .filter(function (link) {
                return rstylesheetType.test(link.rel);
            });

        return new Promise(function (resolve) {
            var pendingCount = pendingCSS.length;

            if (pendingCount === 0) {
                pendingCount = 1;
                return done();
            }

            pendingCSS.forEach(function (link) {
                parent.appendChild(link);
                Render.loadResource(link, done);
            });

            function done() {
                pendingCount--;
                if (pendingCount === 0) {
                    resolve();
                }
            }
        });
    }

    /**
     * Enforce `<script>` execution within the given HTML element
     * script element created by .innerHTML = '' will not get executed by default,
     * see: http://harttle.land/2017/01/16/dynamic-script-insertion.html
     *
     * @param {HTMLElement} container The container element to insert `<script>`
     * @return {Promise} resolves when all scripts complete/error, never rejects
     */
    Render.prototype.enforceJS = function (container) {
        var fp = createEvaluator(this.global);
        var pendingJS = _
            .toArray(container.querySelectorAll('script'))
            .filter(function (script) {
                return rscriptType.test(script.type);
            })
            .map(function (script) {
                return script.src ? cloneScript(script) : this.wrapScript(script, fp);
            }, this);

        return new Promise(function (resolve) {
            var pendingCount = pendingJS.length;

            if (pendingCount === 0) {
                return done();
            }

            pendingJS.forEach(function (script) {
                domEval(script, container, done);
            });

            function done() {
                pendingCount--;
                if (pendingCount <= 0) {
                    destroyEvaluator(fp);
                    resolve();
                }
            }
        });
    };

    function createEvaluator() {
        var fp = 'sf_closure_eval_' + Math.random().toString(36).substr(2);

        window[fp] = function (client) {
            client();
        };

        return fp;
    }

    function destroyEvaluator(fp) {
        delete window[fp];
    }

    /**
     * Wrap script with the randomized callback wrapper
     *
     * @param {HTMLElement} el the element to be wrapped
     * @param {string} wrapper the function name to be used as wrapper
     * @return {HTMLScriptElement} the wrapped script element
     */
    Render.prototype.wrapScript = function (el, wrapper) {
        var script = document.createElement('script');
        script.text = wrapper + '(' + this.clientFunction(el.innerHTML) + ');';
        return script;
    };

    /**
     * Get client function from code text
     *
     * @param {string} code The code block of client code
     * @return {string} A function body in string
     */
    Render.prototype.clientFunction = function (code) {
        return 'function(){' + code + '}';
    };

    /**
     * Execute the given external script
     *
     * @param {HTMLElement} el the element to attach
     * @param {Function} parent parent node to insert into
     * @param {Function} cb the callback to be called when render complete (or error)
     */
    function domEval(el, parent, cb) {
        parent.appendChild(el);

        // we DO NOT need to wait for inline scripts
        if (!el.src) {
            done();
        }
        // listen to onstatechange immediately
        else {
            Render.loadResource(el, done);
        }

        function done() {
            el.remove();
            cb();
        }
    }

    /**
     * Scripts inserted by innerHTML will **NOT** be executed,
     * no matter inlined or external
     *
     * @param {HTMLScriptElement} el the script element to be cloned
     * @return {HTMLScript} the cloned script
     */
    function cloneScript(el) {
        var script = document.createElement('script');
        script.src = el.src;
        return script;
    }

    /**
     * Load the given external resource element
     * Note: this **CANNOT** return a promise, since we should listen to onstatechange immediately after appendChild
     *
     * @param {HTMLElement} el The element to load
     * @param {Function} cb the function to be called when load complete (or error)
     */
    Render.loadResource = function (el, cb) {
        var completed = false;
        // Polyfill: 直接绑定onloadend会不被触发
        // spec. https://xhr.spec.whatwg.org/#interface-progressevent
        el.onload = el.onerror = el.onreadystatechange = function () {
            var readyState = el.readyState;
            if (typeof readyState === 'undefined' || /^(loaded|complete)$/.test(readyState)) {
                if (completed) {
                    return;
                }

                completed = true;
                setTimeout(function () {
                    cb(el);
                });
            }

        };
    };

    function markRenderID(nodes, id) {
        if (!_.isArrayLike(nodes)) {
            nodes = [nodes];
        }
        _.forEach(nodes, function (node) {
            if (node.nodeType === 1) {
                node.setAttribute('rt-renderid', id);
            }
        });
    }

    function notMarkedBy(id) {
        return function isLegacy(node) {
            if (node.nodeType === 1) {
                var attrId = node.getAttribute('rt-renderid');
                node.removeAttribute('rt-renderid');
                return attrId !== id;
            }
            return true;
        };
    }

    return Render;
});

/**
 * @file    view 一个 Ralltiir 页面的视图对象，可被缓存
 * @author  harttle<harttle@harttle.com>
 */

define('ralltiir-iframe/view/view', ['require', 'ralltiir-iframe/utils/animation', 'ralltiir-iframe/view/handleMessages', 'ralltiir-iframe/utils/ua', 'ralltiir-iframe/utils/features', 'ralltiir-iframe/utils/url', 'ralltiir-iframe/view/loading', 'ralltiir-iframe/utils/dom', 'ralltiir', '@searchfe/underscore', '@searchfe/promise', '@searchfe/assert', 'ralltiir-iframe/view/render', 'iframe-shell'], function (require) {
    var animation = require('ralltiir-iframe/utils/animation');
    var handleMessages = require('ralltiir-iframe/view/handleMessages');
    var ua = require('ralltiir-iframe/utils/ua');
    var features = require('ralltiir-iframe/utils/features');
    var URL = require('ralltiir-iframe/utils/url');
    var Loading = require('ralltiir-iframe/view/loading');
    var dom = require('ralltiir-iframe/utils/dom');
    var rt = require('ralltiir');
    var _ = require('@searchfe/underscore');
    var Promise = require('@searchfe/promise');
    var assert = require('@searchfe/assert');
    var Render = require('ralltiir-iframe/view/render');
    var logger = rt.logger;
    var http = rt.http;
    var action = rt.action;
    var html = [
        '<div class="rt-view active">',
        '  <div class="rt-head">',
        '    <div class="rt-back"></div>',
        '    <div class="rt-actions"></div>',
        '    <div class="rt-center">',
        '      <span class="rt-title"></span>',
        '      <span class="rt-subtitle"></span>',
        '    </div>',
        '  </div>',
        '  <div class="rt-body"></div>',
        '</div>'
    ].join('');

    var iframeShell = require('iframe-shell');
    var Loader = iframeShell.loader;

    var supportCalcHeight = false && features.detectCSSCalc() && features.detectCSSViewportUnits();

    prepareEnvironment();

    // eslint-disable-next-line
    function View(scope, viewEl) {
        this.renderer = new Render();
        this.options = normalize(scope.options);
        this.performance = scope.performance;
        this.valid = true;

        if (viewEl) {
            this.initElement(viewEl);
            this.populated = true;
            this.options = _.defaultsDeep(normalize(optionsFromDOM(viewEl)), this.options);
            this.setData(this.options);
        }
        else {
            this.initElement(this.createContainer());
            this.setData(this.options);
        }
        this.loading = new Loading(this.viewEl);
        this.resizeContainer = this._resizeContainer.bind(this);
    }

    View.prototype.initElement = function (viewEl) {
        assert(viewEl, '.rt-view not exist');
        this.viewEl = viewEl;
        this.viewEl.setAttribute('data-base', this.options.baseUrl || '');

        this.headEl = this.viewEl.querySelector('.rt-head');
        assert(this.headEl, '.rt-view>.rt-head not exist');

        this.bodyEl = this.viewEl.querySelector('.rt-body');
        assert(this.bodyEl, '.rt-view>rt-body not exist');

        this.viewEl.ralltiir = this;
    };

    View.prototype.render = function () {
        var self = this;
        // return this.pendingFetch
        return Promise.resolve()
        .then(function () {
            self.performance.domLoading = Date.now();

            var height = supportCalcHeight
                ? 'calc(100vh - ' + self.headEl.clientHeight + 'px)'
                : self._getViewerHeight() + 'px'
            ;
            // debugger;
            self.loader = new Loader({
                url: self.backendUrl,
                useMipCache: false,
                viewer: {
                    target: self.bodyEl,
                    height: height
                }
            });
            handleMessages(self);

            self.loader.on(self.options.notMip ? 'complete' : 'mip-mippageload', function () {
                self.loading.hide();
            });

            self.loader.create();
            self.loader.attach();

            // self.loading.hide();

            // var view = docfrag.querySelector('.rt-view');
            // if (!view) {
            //     var message = '".rt-view" not found in retrieved HTML'
            //     + '(from ' + self.backendUrl + ' )'
            //     + 'abort rendering...';
            //     throw new Error(message);
            // }
            // self.renderer.moveClasses(view, self.viewEl);

            // return Promise.resolve()
            // .then(function () {
            //     // return self.renderer.render(self.headEl, docfrag.querySelector('.rt-head'), {
            //     //     replace: true,
            //     //     onContentLoaded: function normalizeSSR() {
            //     //         var opts = optionsFromDOM(dom.wrapElementFromString(html));
            //     //         self.setData(normalize(opts));
            //     //     }
            //     // })
            //     // .catch(function (err) {
            //     //     err.code = err.code || 910;
            //     //     throw err;
            //     // });
            // })
            // .then(function () {
            //     // self.performance.headInteractive = Date.now();
            //     // return self.renderer.render(self.bodyEl, docfrag.querySelector('.rt-body'), {
            //     //     replace: true,
            //     //     onContentLoaded: function normalizeSSR() {
            //     //         self.performance.domContentLoaded = Date.now();
            //     //     }
            //     // })
            //     // .catch(function (err) {
            //     //     err.code = err.code || 911;
            //     //     throw err;
            //     // });
            // });
        })
        .then(function () {
            self.populated = true;
        })
        .catch(function (err) {
            err.code = err.code || 919;
            throw err;
        });
    };

    View.prototype.partialUpdate = function (url, options) {
        url = this.resolveUrl(url);

        var renderer = this.renderer;
        var body = this.bodyEl;
        var to = options.to ? body.querySelector(options.to) : body;
        var data = {url: url, options: options};
        var loading = new Loading(to);

        if (url !== location.pathname + location.search) {
            this.valid = false;
        }

        if (!options.to) {
            options.to = '.rt-body';
        }

        if (!options.from) {
            options.from = options.to;
        }

        if (!options.fromUrl) {
            options.fromUrl = url;
        }

        dom.trigger(to, 'rt.willUpdate', data);

        if (options.replace) {
            to.innerHTML = '';
            loading.show();
        }

        var token = Math.random().toString(36).substr(2);
        to.setAttribute('data-rt-token', token);

        return this.fetch(URL.setQuery(options.fromUrl, {
            'rt-partial': 'true',
            'rt-selector': options.from
        }))
        .then(function (xhr) {
            loading.hide();

            if (to.getAttribute('data-rt-token') !== token) {
                return;
            }
            rt.action.reset(url, null, {silent: true});

            var docfrag = Render.parse(xhr.data || '');
            docfrag = options.from ? docfrag.querySelector(options.from) : docfrag;

            return renderer.render(to, docfrag, {replace: options.replace})
            .then(function () {
                dom.trigger(to, 'rt.updated', data);
            });
        })
        .catch(function (e) {
            // eslint-disable-next-line
            console.warn('partialUpdate Error, redirecting', e);
            location.href = url;
        });
    };

    View.prototype.setData = function (desc) {
        var headEl = this.headEl;

        this.updateTitleBarElement(headEl.querySelector('.rt-back'), desc.back);
        this.updateTitleBarElement(headEl.querySelector('.rt-title'), desc.title);
        this.updateTitleBarElement(headEl.querySelector('.rt-subtitle'), desc.subtitle);

        if (desc.actions) {
            var toolEl = headEl.querySelector('.rt-actions');
            toolEl.innerHTML = '';
            _.forEach(desc.actions, function (icon) {
                var iconEl = dom.elementFromString('<span class="rt-action">');
                icon.tryReplace = true;
                var resultIconEl = this.updateTitleBarElement(iconEl, icon);
                toolEl.appendChild(resultIconEl);
            }, this);
        }
    };

    View.prototype.resetStyle = function () {
        animation.resetStyle(this.viewEl);
    };

    View.prototype.setAttached = function () {
        var self = this;
        return new Promise(function (resolve) {
            self.resetStyle();
            self.restoreStates();
            self.attached = true;
            self.performance.domInteractive = Date.now();
            self._startListenResize();
            setTimeout(function () {
                self.trigger('rt.attached');
                resolve();
            });
        });
    };

    View.prototype.setActive = function () {
        this.trigger('rt.ready');
        dom.addClass(this.viewEl, 'active');
    };

    View.prototype.reuse = function () {
        rt.doc.appendChild(this.viewEl);
    };

    View.prototype.setDetached = function () {
        this.attached = false;
        this.viewEl.remove();
        this._stopListenResize();
        this.trigger('rt.detached');
    };

    View.prototype.trigger = function (event) {
        return dom.trigger(this.viewEl, event);
    };

    View.prototype.enter = function (useEnterAnimation) {
        this.trigger('rt.willAttach');
        logger.debug('[view.enter] resetting styles, useEnterAnimation', useEnterAnimation);
        this.resetStyle();
        if (!useEnterAnimation) {
            logger.debug('[view.enter] animation disabled restoreStates...');
            this.restoreStates();
            return Promise.resolve();
        }
        var el = this.viewEl;
        logger.debug('[view.enter] calling animaiton.enter with', this.scrollX, this.scrollY);
        return animation.enter(el, this.scrollX, this.scrollY);
    };

    View.prototype.prepareExit = function (useAnimation) {
        this.trigger('rt.willDetach');
        this.scrollX = window.scrollX;
        this.scrollY = window.scrollY;
        logger.debug('[view.prepareExit] saving scrollX/scrollY', this.scrollX, this.scrollY);
        dom.removeClass(this.viewEl, 'active');
        // need prepare regardless useAnimation, scrollTop will be effected otherwise
        return animation.prepareExit(this.viewEl, this.scrollX, this.scrollY);
    };

    View.prototype.exit = function (useAnimation) {
        return useAnimation
            ? animation.exit(this.viewEl, this.scrollX, this.scrollY)
            : animation.exitSilent(this.viewEl);
    };

    View.prototype.destroy = function () {
        this.trigger('rt.destroyed');
        this.viewEl.remove();
        this.loader.destroy();
        delete this.viewEl;
        delete this.headEl;
        delete this.bodyEl;
    };

    View.prototype.restoreStates = function () {
        logger.debug('restoring states to', this.scrollX, this.scrollY);
        if (this.hasOwnProperty('scrollX')) {
            scrollTo(this.scrollX, this.scrollY);
        }
    };

    View.prototype.fetchUrl = function (url) {
        this.loading.show();
        this.pendingFetch = this.fetch(url);
    };

    View.prototype.fetch = function (url, headers) {
        this.backendUrl = this.getBackendUrl(url);
        this.backendUrl = URL.setQuery(this.backendUrl, 'rt', 'true');
        this.performance.requestStart = Date.now();
        return Promise.resolve(null);
        // return http.ajax(this.backendUrl, {
        //     headers: headers || {},
        //     xhrFields: {withCredentials: true}
        // })
        // .catch(function (err) {
        //     err.code = err.status || 900;
        //     throw err;
        // });
    };

    View.prototype.getBackendUrl = function (url) {
        var result = '';
        if (_.isFunction(this.options.backendUrl)) {
            result = this.options.backendUrl(url);
        }
        else if (_.isString(this.options.backendUrl)) {
            result = this.options.backendUrl;
        }
        else {
            var root = rt.action.config().root.replace(/\/+$/, '');
            result = root + url;
        }
        if (result.indexOf('#') < 0) {
            result = result + '#r=' + Date.now();
        }
        return result;
    };

    View.backHtml = '<i class="c-icon">&#xe750;</i>';

    function normalize(options) {
        options = options || {};
        options = _.cloneDeep(options);
        if (_.get(options, 'back.html') === undefined
            && history.length > 1) {
            _.set(options, 'back.html', '<rt-back>' + View.backHtml + '</rt-back>');
        }
        return options;
    }

    function prepareEnvironment() {
        // ios 设为 manual 时回退时页面不响应 1s
        if (('scrollRestoration' in history) && !ua.isIOS) {
            // Back off, browser, I got this...
            history.scrollRestoration = 'manual';
        }
    }

    function optionsFromDOM(el) {
        var headEl = el.querySelector('.rt-head');
        var ret = {};

        var backEl = headEl.querySelector('.rt-back');
        if (backEl && backEl.innerHTML) {
            ret.back = {html: backEl.innerHTML};
        }

        var titleEl = headEl.querySelector('.rt-title');
        if (titleEl && titleEl.innerHTML) {
            ret.title = {html: titleEl.innerHTML};
        }

        var subtitleEl = headEl.querySelector('.rt-subtitle');
        if (subtitleEl && subtitleEl.innerHTML) {
            ret.subtitle = {html: subtitleEl.innerHTML};
        }

        var actionEl = headEl.querySelector('.rt-actions');
        if (actionEl && actionEl.children.length) {
            ret.actions = [];
            _.forEach(actionEl.children, function (el) {
                if (el && el.outerHTML) {
                    ret.actions.push({html: el.outerHTML});
                }
            });
        }

        return ret;
    }

    View.prototype._resizeContainer = function () {
        // console.log('_resizeContainer', this);
        if (this.headEl && this.bodyEl) {
            var height = this._getViewerHeight();
            // console.log('height', height);
            this.loader.setConfig({
                viewer: {
                    height: height + 'px'
                }
            });
        }
    };

    View.prototype._getViewerHeight = function () {
        if (this.headEl) {
            var height = window.innerHeight - this.headEl.clientHeight;
            return height;
        }
        return window.innerHeight - 44;
    };

    View.prototype._startListenResize = function () {
        logger.debug('_startListenResize', supportCalcHeight);
        if (!supportCalcHeight && this.loader) {
            window.addEventListener('resize', this.resizeContainer);
        }
    };

    View.prototype._stopListenResize = function () {
        logger.debug('_stopListenResize', supportCalcHeight);
        if (!supportCalcHeight && this.loader) {
            window.removeEventListener('resize', this.resizeContainer);
        }
    };

    View.prototype.createContainer = function () {
        var viewEl = dom.elementFromString(html);
        rt.doc.appendChild(viewEl);
        return viewEl;
    };

    View.prototype.updateTitleBarElement = function (el, options) {
        if (_.has(options, 'html')) {
            el.innerHTML = options.html || '';
            // special markups
            if (el.querySelector('rt-back')) {
                el.innerHTML = el.innerHTML || View.backHtml;
                options.onClick = action.back.bind(action);
            }
            else if (el.querySelector('rt-empty')) {
                el.innerHTML = '';
            }
            if (options.tryReplace && el.children.length) {
                el = el.children[0];
            }
        }
        if (!el.rtClickHandler) {
            el.rtClickHandler = _.noop;
            el.addEventListener('click', function () {
                el.rtClickHandler();
            });
        }
        if (_.has(options, 'onClick')) {
            el.rtClickHandler = _.get(options, 'onClick');
        }
        return el;
    };

    View.prototype.resolveUrl = function (url) {
        return this.options.baseUrl + url;
    };

    return View;
});

define('ralltiir-iframe', ['ralltiir-iframe/service'], function (mod) { return mod; });
/**
 * @file
 * @author oott123 <git@public.oott123.com>
 */

define('mip-iframe-shell/index', ['require', 'ralltiir', 'zepto', 'ralltiir-iframe', 'customElement', 'dom/event'], function (require) {
    var rt = require('ralltiir');
    var $ = require('zepto');
    // var DomService = require('ralltiir-application');
    var IframeService = require('ralltiir-iframe');
    var started = false;

    var isInIframe = window.name.indexOf('iframe-shell') === 0;

    var ShellElement = require('customElement').create();

    ShellElement.prototype.build = function () {
        if (started) {
            return;
        }
        if (isInIframe) {
            $('<style>').text(".rt-view .rt-head {\n    display: none;\n}\n\n.rt-view .rt-body {\n    padding-top: 0 !important;\n}\n").appendTo('head');
        }
        else {
            $('<style>').text(".rt-view .rt-head {\n    display: block;\n}\n\n.rt-view .rt-body {\n    padding-top: 44px !important;\n}\n").appendTo('head');
        }
        // rt.services.register('/', {
        //     title: {
        //         html: __inline('/example/include/index-header.html')
        //     }
        // }, DomService);
        rt.services.register('/', {
            title: {
                html: '微咖啡'
            },
            back: {
                html: ''
            }
        }, IframeService);
        rt.services.register(/.*/, {
            title: {
                html: '微咖啡'
            },
            back: {
                html: '<rt-back>' + "<?xml version=\"1.0\" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"><svg t=\"1524809019326\" class=\"icon\" style=\"\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1245\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"200\" height=\"200\"><defs><style type=\"text/css\"></style></defs><path d=\"M688 924.16a32 32 0 0 1-22.72-9.28l-352-352a32 32 0 0 1 0-45.12l352-352a32 32 0 0 1 45.44 45.12l-329.6 329.28 329.6 329.6a32 32 0 0 1 0 45.12 32 32 0 0 1-22.72 9.28z\" p-id=\"1246\"></path></svg>" + '</rt-back>'
            }
        }, IframeService);
        rt.action.start();
        delegateLink();
    };

    ShellElement.prototype.detachedCallback = function () {
        // rt.action.stop();
    };

    return ShellElement;

    function encodeHtml(str) {
        // 正则 /</ 格式会影响首页异步
        return str
            .replace(new RegExp('&', 'g'), '&amp;')
            .replace(new RegExp('"', 'g'), '&quot;')
            .replace(new RegExp('\'', 'g'), '&#39;')
            .replace(new RegExp('<', 'g'), '&lt;')
            .replace(new RegExp('>', 'g'), '&gt;');
    }

    function delegateLink() {
        var delegate = require('dom/event').delegate;
        delegate(document.body, 'a', 'click', function (event) {
            if (this.rel === 'external') {
                return;
            }
            if (this.host !== location.host) {
                return;
            }
            if (isInIframe) {
                this.setAttribute('mip-link', true);
                return;
            }
            var text = this.innerText.trim();
            if (this.getAttribute('title')) {
                text = this.getAttribute('title');
            }
            else if (this.querySelector('.title, h1, h2')) {
                text = this.querySelector('.title, h1, h2').innerText;
            }
            var url = this.pathname + this.search + this.hash;
            rt.action.redirect(url, null, {
                title: {
                    html: encodeHtml(text)
                }
            });
            event.preventDefault();
        });
    }
});
;
define('mip-iframe-shell', ['mip-iframe-shell/index'], function (mod) { return mod; });

        require(['mip', 'mip-iframe-shell'], function registerComponent(mip, component) {
            mip.registerMipElement('mip-iframe-shell', component, ".rt-view {\n    font: 14px/22px Arial, Helvetica, sans-serif;\n    word-break: break-word;\n    word-wrap: break-word;\n    z-index: 500;\n    width: 100%;\n    min-height: 100%;\n    background-color: #f2f2f2;\n}\n.rt-view .rt-body {\n    text-align: left;\n    padding-top: 44px;\n}\n.rt-view .rt-head {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    z-index: 510;\n    height: 44px;\n    color: #333;\n    font-size: 16px;\n    line-height: 44px;\n    background-color: #fff;\n    color: #333;\n    -webkit-user-select: none;\n            user-select: none;\n    -webkit-transform: translate3d(0, 0, 0);\n            transform: translate3d(0, 0, 0);\n}\n\n.rt-view .rt-actions .c-icon {\n    cursor: pointer;\n    font-size: 21px;\n}\n\n.rt-view .rt-head .rt-back {\n    width: 50px;\n    height: 44px;\n    float: left;\n    padding-left: 2px;\n    text-align: center;\n}\n.rt-view .rt-head .rt-center {\n    position: absolute;\n    left: 90px;\n    right: 90px;\n    top: 0;\n    bottom: 0;\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    text-align: center;\n}\n.rt-view .rt-head .rt-title {\n    color: #000;\n    vertical-align: middle;\n    font-weight: 700;\n    font-size: 18px;\n}\n.rt-view .rt-head .rt-subtitle {\n    font-size: 14px;\n    margin-left: 5px;\n    vertical-align: middle;\n}\n.rt-view .rt-head .rt-actions {\n    min-width: 44px;\n    height: 44px;\n    float: right;\n    text-align: center;\n    font-size: 16px;\n    color: #333;\n}\n\n.rt-view .rt-actions > * {\n    margin-right: 15px;\n    margin-left: 0;\n}\n.rt-view .rt-actions * {\n    vertical-align: middle;\n}\n\n.rt-view .rt-loading {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    width: 161px;\n    height: 49px;\n    line-height: 49px;\n    border-radius: 1px;\n    overflow: hidden;\n    padding: 0;\n    margin: -24px auto auto -80px;\n    color: #fff;\n}\n.rt-view .rt-loading span {\n    display: inline-block;\n    color: #6b6b6b;\n    font-size: 18px;\n    vertical-align: middle;\n}\n.rt-view .rt-loading .rt-loading-logo {\n    background: url(//m.baidu.com/se/static/img/iphone/tab_loading__bg_logo.png) no-repeat;\n    background-size: 147px 48px;\n    height: 48px;\n    width: 147px;\n}\n.rt-view .rt-loading .rt-loading-bar {\n    display: inline-block;\n    position: absolute;\n    height: 60px;\n    width: 12px;\n    top: 0;\n    left: 0;\n    background-color: rgba(255, 255, 255, .5);\n    -webkit-transform: skew(20deg);\n            transform: skew(20deg);\n    -webkit-animation: 1s rt-lodingframes infinite;\n            animation: 1s rt-loadingframes infinite;\n}\n@keyframes rt-loadingframes {\n    0% {\n        left: 0;\n    }\n    100% {\n        left: 150px;\n    }\n}\n@-webkit-keyframes rt-loadingframes {\n    0% {\n        left: 0;\n    }\n    100% {\n        left: 150px;\n    }\n}\n\n");
        });
    }
});
