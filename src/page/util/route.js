import {stringifyQuery} from './query';

const trailingSlashRE = /\/?$/;

export function createRoute (record, location, redirectedFrom, router) {
    let query = location.query || {};
    try {
        query = clone(query);
    }
    catch (e) {}

    const route = {
        meta: (record && record.meta) || {},
        path: location.path || '/',
        hash: location.hash || '',
        query,
        params: location.params || {},
        fullPath: getFullPath(location),
        matched: record ? formatMatch(record) : []
    };
    if (redirectedFrom) {
        route.redirectedFrom = getFullPath(redirectedFrom);
    }
    return Object.freeze(route);
}

function clone (value) {
    if (Array.isArray(value)) {
        return value.map(clone);
    }
    else if (value && typeof value === 'object') {
        const res = {};
        for (const key in value) {
            res[key] = clone(value[key]);
        }
        return res;
    }
    else {
        return value;
    }
}

// the starting route that represents the initial state
export const START = createRoute(null, {
    path: '/'
});

function formatMatch (record) {
    const res = [];
    while (record) {
        res.unshift(record);
        record = record.parent;
    }
    return res;
}

export function getFullPath ({ path, query = {}, hash = '' }) {
    return (path || '/') + stringifyQuery(query) + hash;
}

export function isSameRoute (a, b) {
    if (b === START) {
        return a === b;
    }
    else if (!b) {
        return false;
    }
    else if (a.path && b.path) {
        return a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '')
            && a.hash === b.hash
            && isObjectEqual(a.query, b.query);
    }
    return false;
}

function isObjectEqual (a = {}, b = {}) {
    // handle null value #1566
    if (!a || !b) {
        return a === b;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    return aKeys.every(key => {
        const aVal = a[key];
        const bVal = b[key];
        // check nested equality
        if (typeof aVal === 'object' && typeof bVal === 'object') {
            return isObjectEqual(aVal, bVal);
        }
        return String(aVal) === String(bVal);
    });
}

export function isIncludedRoute (current, target) {
    return (
        current.path.replace(trailingSlashRE, '/').indexOf(
            target.path.replace(trailingSlashRE, '/')
        ) === 0
        && (!target.hash || current.hash === target.hash)
        && queryIncludes(current.query, target.query)
    );
}

function queryIncludes (current, target) {
    for (const key in target) {
        if (!(key in current)) {
            return false;
        }
    }
    return true;
}
