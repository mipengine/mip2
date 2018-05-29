import HTML5History from './history';
import {createMatcher, normalizeLocation} from './matcher';
import {cleanPath} from '../util/path';

export default class Router {
    constructor(options = {}) {
        this.options = options;
        this.matcher = createMatcher(options.routes || [], this);
        this.mode = 'history';
        this.history = new HTML5History(this, options.base || '');
    }

    init() {
        const history = this.history;

        let currentLocation = history.getCurrentLocation();
        history.transitionTo(currentLocation);
    }

    listen(cb) {
        this.history.listen(cb);
    }

    push(location, onComplete, onAbort) {
        this.history.push(location, onComplete, onAbort);
    }

    replace(location, onComplete, onAbort) {
        this.history.replace(location, onComplete, onAbort);
    }

    go(n) {
        this.history.go(n);
    }

    back() {
        this.go(-1);
    }

    forward() {
        this.go(1);
    }

    match(raw, current, redirectedFrom) {
        return this.matcher.match(raw, current, redirectedFrom);
    }

    resolve(to, current, append) {
        const location = normalizeLocation(
            to,
            current || this.history.current,
            append,
            this
        );
        const route = this.match(location, current);
        const fullPath = route.redirectedFrom || route.fullPath;
        const base = this.history.base;
        const href = createHref(base, fullPath, this.mode);
        return {
            location,
            route,
            href
        };
    }

    addRoute(route) {
        this.matcher.addRoutes([route]);
    }
}

function createHref(base, fullPath, mode) {
    var path = mode === 'hash' ? '#' + fullPath : fullPath;
    return base ? cleanPath(base + '/' + path) : path;
}
