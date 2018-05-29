import {START, isSameRoute, isOnlyDifferentInHash} from '../util/route';
import {
    pushState,
    replaceState,
    supportsPushState
} from '../util/push-state';
import {cleanPath, getLocation} from '../util/path';

export default class HTML5History {
    constructor(router, base) {
        this.router = router;
        this.base = base;
        // start with a route object that stands for "nowhere"
        this.current = START;
        this.pending = null;
        this.ready = false;
        this.readyCbs = [];
        this.readyErrorCbs = [];
        this.errorCbs = [];
        this.cb = null;

        const initLocation = getLocation(this.base);
        window.addEventListener('popstate', e => {
            const current = this.current;

            // Avoiding first `popstate` event dispatched in some browsers but first
            // history route not updated since async guard at the same time.
            const location = getLocation(this.base);
            if (this.current === START && location === initLocation) {
                return;
            }

            this.transitionTo(location);
        });
    }

    listen(cb) {
        this.cb = cb;
    }

    go(n) {
        window.history.go(n);
    }

    push(location, onComplete, onAbort) {
        const {current: fromRoute} = this;
        this.transitionTo(location, route => {
            pushState(cleanPath(this.base + route.fullPath));
            onComplete && onComplete(route);
        }, onAbort);
    }

    replace(location, onComplete, onAbort) {
        const {current: fromRoute} = this;
        this.transitionTo(location, route => {
            replaceState(cleanPath(this.base + route.fullPath));
            onComplete && onComplete(route);
        }, onAbort);
    }

    ensureURL(push) {
        if (getLocation(this.base) !== this.current.fullPath) {
            const current = cleanPath(this.base + this.current.fullPath);
            push ? pushState(current) : replaceState(current);
        }
    }

    getCurrentLocation() {
        return getLocation(this.base);
    }

    transitionTo(location, onComplete) {
        const route = this.router.match(location, this.current);

        if (!isSameRoute(this.current, route)) {
            this.updateRoute(route);
            onComplete && onComplete(route);
            this.ensureURL();

            // fire ready cbs once
            if (!this.ready) {
                this.ready = true;
                this.readyCbs.forEach(cb => {
                    cb(route);
                });
            }
        }
    }

    updateRoute(route) {
        const prev = this.current;
        this.current = route;
        this.cb && this.cb(prev, route);
    }
}
