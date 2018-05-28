import {START, isSameRoute} from '../util/route';
import {
    pushState,
    replaceState,
    supportsPushState
} from '../util/push-state';
import {cleanPath} from '../util/path';

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

    transitionTo(location, onComplete, onAbort, fromMissHook) {
        const route = this.router.match(location, this.current);

        this.confirmTransition(route, () => {
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

        }, err => {
            if (onAbort) {
                onAbort(err);
            }

            if (err && !this.ready) {
                this.ready = true;
                this.readyErrorCbs.forEach(cb => {
                    cb(err);
                });
            }
        });
    }

    confirmTransition(route, onComplete, onAbort) {
        const current = this.current;
        const abort = err => {
            if (isError(err)) {
                if (this.errorCbs.length) {
                    this.errorCbs.forEach(cb => {
                        cb(err);
                    });
                }
                else {
                    warn(false, 'uncaught error during route navigation:');
                    console.error(err);
                }
            }

            onAbort && onAbort(err);
        };
        if (
            isSameRoute(route, current) &&
            // in the case the route map has been dynamically appended to
            route.matched.length === current.matched.length
        ) {
            this.ensureURL();
            return abort();
        }

        onComplete && onComplete();
    }

    updateRoute(route) {
        const prev = this.current;
        this.current = route;
        this.cb && this.cb(route);
    }
}

function getLocation(base) {
    let path = window.location.pathname;
    if (base && path.indexOf(base) === 0) {
        path = path.slice(base.length);
    }

    return (path || '/') + window.location.search + window.location.hash;
}
