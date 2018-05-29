import Regexp from 'path-to-regexp';
import {resolvePath, parsePath, cleanPath} from '../util/path';
import {resolveQuery} from '../util/query';
import {createRoute, getFullPath} from '../util/route';

const regexpCompileCache = Object.create(null);

function fillParams(path, params, routeMsg) {
    try {
        const filler = regexpCompileCache[path] ||
        (regexpCompileCache[path] = Regexp.compile(path));
        return filler(params || {}, {
            pretty: true
        });
    }
    catch (e) {
        return '';
    }
}

export function createMatcher(routes, router) {
    const {
        pathList,
        pathMap,
        nameMap
    } = createRouteMap(routes);

    function addRoutes(routes) {
        createRouteMap(routes, pathList, pathMap, nameMap);
    }

    function match(raw, currentRoute, redirectedFrom) {
        const location = normalizeLocation(raw, currentRoute, false, router);
        if (location.path) {
            location.params = {};
            for (let i = 0; i < pathList.length; i++) {
                const path = pathList[i];
                const record = pathMap[path];
                if (matchRoute(record.regex, location)) {
                    return createRoute(record, location, redirectedFrom, router);
                }

            }
        }

        // no match
        return createRoute(null, location, null, router);
    }

    return {
        match,
        addRoutes
    };
}

function matchRoute(regex, {path, params, fullpath}) {
    const m = fullpath.match(regex);

    if (!m) {
        return false;
    }
    else if (!params) {
        return true;
    }

    for (let i = 1, len = m.length; i < len; ++i) {
        const key = regex.keys[i - 1];
        const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
        if (key) {
            params[key.name] = val;
        }

    }

    return true;
}

function resolveRecordPath(path, record) {
    return resolvePath(path, record.parent ? record.parent.path : '/', true);
}

function createRouteMap(routes, oldPathList, oldPathMap, oldNameMap) {
    // the path list is used to control path matching priority
    const pathList = oldPathList || [];
    // $flow-disable-line
    const pathMap = oldPathMap || Object.create(null);
    // $flow-disable-line
    const nameMap = oldNameMap || Object.create(null);

    routes.forEach(route => {
        addRouteRecord(pathList, pathMap, nameMap, route);
    });

    // ensure wildcard routes are always at the end
    for (let i = 0, l = pathList.length; i < l; i++) {
        if (pathList[i] === '*') {
            pathList.push(pathList.splice(i, 1)[0]);
            l--;
            i--;
        }
    }

    return {
        pathList,
        pathMap,
        nameMap
    };
}

function addRouteRecord(pathList, pathMap, nameMap, route, parent, matchAs) {
    const {path, name} = route;

    const pathToRegexpOptions = route.pathToRegexpOptions || {};
    const normalizedPath = normalizePath(
        path,
        parent,
        pathToRegexpOptions.strict
    );

    const record = {
        path: normalizedPath,
        regex: Regexp(normalizedPath, [], pathToRegexpOptions),
        components: route.components || {
            default: route.component
        },
        instances: {},
        name,
        parent,
        matchAs,
        redirect: route.redirect,
        beforeEnter: route.beforeEnter,
        meta: route.meta || {},
        props: {}
    };

    if (!pathMap[record.path]) {
        pathList.push(record.path);
        pathMap[record.path] = record;
    }
}

function normalizePath(path, parent, strict) {
    if (!strict) {
        path = path.replace(/\/$/, '');
    }

    if (path[0] === '/') {
        return path;
    }

    if (parent == null) {
        return path;
    }

    return cleanPath(`${parent.path}/${path}`);
}

export function normalizeLocation(raw, current, append, router) {
    let next = typeof raw === 'string' ? {
        path: raw
    } : raw;
    // named target
    if (next.name || next._normalized) {
        return next;
    }

    // relative params
    if (!next.path && next.params && current) {
        next = Object.assign({}, next);
        next._normalized = true;
        const params = Object.assign({}, current.params, next.params);

        if (current.matched.length) {
            const rawPath = current.matched[current.matched.length - 1].path;
            next.path = fillParams(rawPath, params, `path ${current.path}`);
        }

        return next;
    }

    const parsedPath = parsePath(next.path || '');
    const basePath = (current && current.path) || '/';
    const path = parsedPath.path
        ? resolvePath(parsedPath.path, basePath, append || next.append)
        : basePath;

    const query = resolveQuery(
        parsedPath.query,
        next.query,
        router && router.options.parseQuery
    );

    let hash = next.hash || parsedPath.hash;
    if (hash && hash.charAt(0) !== '#') {
        hash = `#${hash}`;
    }

    return {
        _normalized: true,
        path,
        query,
        hash,
        fullpath: getFullPath({path, query, hash})
    };
}
