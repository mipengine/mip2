/**
 * @file keep-alive.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/* eslint-disable guard-for-in */

import {isRegExp, remove} from 'shared/util';
import {getFirstComponentChild} from 'core/vdom/helpers/index';

function getComponentName(opts) {
    return opts && (opts.Ctor.options.name || opts.tag);
}

function matches(pattern, name) {
    if (Array.isArray(pattern)) {
        return pattern.indexOf(name) > -1;
    }
    else if (typeof pattern === 'string') {
        return pattern.split(',').indexOf(name) > -1;
    }
    else if (isRegExp(pattern)) {
        return pattern.test(name);
    }

    /* istanbul ignore next */
    return false;
}

function pruneCache(keepAliveInstance, filter) {
    const {
        cache,
        keys,
        /* eslint-disable */
        _vnode
        /* eslint-enable */
    } = keepAliveInstance;
    for (const key in cache) {
        const cachedNode = cache[key];
        if (cachedNode) {
            const name = getComponentName(cachedNode.componentOptions);
            if (name && !filter(name)) {
                pruneCacheEntry(cache, key, keys, _vnode);
            }
        }
    }
}

function pruneCacheEntry(
    cache,
    key,
    keys,
    current
) {
    const cached = cache[key];
    if (cached && cached !== current) {
        cached.componentInstance.$destroy();
    }

    cache[key] = null;
    remove(keys, key);
}

const patternTypes = [String, RegExp, Array];

export default {
    name: 'keep-alive',
    abstract: true,

    props: {
        include: patternTypes,
        exclude: patternTypes,
        max: [String, Number]
    },

    created() {
        this.cache = Object.create(null);
        this.keys = [];
    },

    destroyed() {
        for (const key in this.cache) {
            pruneCacheEntry(this.cache, key, this.keys);
        }
    },

    watch: {
        include(val) {
            pruneCache(this, name => matches(val, name));
        },
        exclude(val) {
            pruneCache(this, name => !matches(val, name));
        }
    },

    render() {
        const vnode = getFirstComponentChild(this.$slots.default);
        const componentOptions = vnode && vnode.componentOptions;
        if (componentOptions) {
            // check pattern
            const name = getComponentName(componentOptions);
            if (name && (
                (this.include && !matches(this.include, name))
                    || (this.exclude && matches(this.exclude, name))
                )) {
                return vnode;
            }

            const {cache, keys} = this;
            const key = vnode.key == null
                // same constructor may get registered as different local components
                // so cid alone is not enough (#3269)
                ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
                : vnode.key;
            if (cache[key]) {
                vnode.componentInstance = cache[key].componentInstance;
                // make current key freshest
                remove(keys, key);
                keys.push(key);
            }
            else {
                cache[key] = vnode;
                keys.push(key);
                // prune oldest entry
                if (this.max && keys.length > parseInt(this.max, 10)) {
                    pruneCacheEntry(cache, keys[0], keys, this._vnode);
                }
            }

            vnode.data.keepAlive = true;
        }

        return vnode;
    }
};
