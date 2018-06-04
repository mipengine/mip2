/**
 * @file main entry
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {getLocation} from './util/path';
import {isSameRoute, getFullPath, convertPatternToRegexp} from './util/route';
import {
    getMIPShellConfig,
    addMIPCustomScript,
    createIFrame,
    removeIFrame,
    getIFrame,
    frameMoveIn,
    frameMoveOut,
    createLoading
} from './util/dom';
import {scrollTop} from './util/ease-scroll';
import {DEFAULT_SHELL_CONFIG} from './const';

import {customEmit} from '../vue-custom-element/utils/custom-event';
import util from '../util';
import Router from './router';
import AppShell from './appshell';
import '../styles/mip.less';

import {
    MESSAGE_APPSHELL_REFRESH, MESSAGE_APPSHELL_EVENT,
    MESSAGE_ROUTER_PUSH, MESSAGE_ROUTER_REPLACE
} from './const';

const CUSTOM_EVENT_SCROLL_TO_HASH = 'scroll-to-hash';

class Page {
    constructor() {
        if (window.parent && window.parent.MIP_ROOT_PAGE) {
            this.isRootPage = false;
        }
        else {
            window.MIP_ROOT_PAGE = true;
            this.isRootPage = true;
        }
        this.pageId = undefined;
        this.appshellRoutes = [];
        this.appshellCache = {};

        // root page
        this.appshell = undefined;
        this.children = [];
        this.currentChildPageId = undefined;
        this.messageHandlers = [];

        /**
         * transition will be executed only when `Back` button clicked,
         * due to a bug when going back with gesture in mobile Safari.
         */
        this.allowTransition = false;
    }

    initRouter() {
        let router;

        // generate pageId
        this.pageId = window.location.href;

        // outside iframe
        if (this.isRootPage) {
            router = new Router();
            router.rootPage = this;
            router.init();
            router.listen(this.render.bind(this));

            window.MIP_ROUTER = router;

            this.messageHandlers.push((type, data) => {
                if (type === MESSAGE_ROUTER_PUSH) {
                    router.push(data.route);
                }
                else if (type === MESSAGE_ROUTER_REPLACE) {
                    router.replace(data.route);
                }
            });

            window.MIP.viewer.on('changeState', ({data: {state, url}}) => {
                router.replace(url);
            })
        }
        // inside iframe
        else {
            router = window.parent.MIP_ROUTER;
            router.rootPage.addChild(this);
        }

        this.router = router;
    }

    initAppShell() {
        /**
         * in root page, we need to:
         * 1. read global config from <mip-shell>
         * 2. refresh appshell with current data in <mip-shell>
         * 3. listen to a refresh event emited by current child iframe
         */
        if (this.isRootPage) {
            this.readMIPShellConfig();

            let rootPageMeta = this.findMetaByPageId(this.pageId);

            this.appshell = new AppShell({
                data: rootPageMeta
            }, this);

            // Create loading div
            createLoading(rootPageMeta.header.show);
        }
        /**
         * in child page:
         * 1. notify root page to refresh appshell at first time
         * 2. listen to appshell events such as `click-button` emited by root page
         */
        else {
            this.messageHandlers.push((type, event) => {
                if (type === MESSAGE_APPSHELL_EVENT) {
                    this.emitEventInCurrentPage(event);
                }
            });
        }
    }

    initHashScroller() {
        // scroll to current hash if exists
        this.scrollToHash(window.location.hash);

        window.addEventListener(CUSTOM_EVENT_SCROLL_TO_HASH, (e) => {
            this.scrollToHash(e.detail && e.detail[0].hash);
        });
    }

    /**
     * notify root page with an eventdata
     *
     * @param {Object} data eventdata
     */
    notifyRootPage(data) {
        parent.postMessage(data, window.location.origin);
    }

    /**
     * scroll to hash with ease transition
     *
     * @param {string} hash hash
     */
    scrollToHash(hash) {
        if (hash) {
            let $hash = document.querySelector(decodeURIComponent(hash));
            if ($hash) {
                // scroll to current hash
                scrollTop($hash.offsetTop, {
                    scroller: this.isRootPage ? window : window.document.body
                });
            }
        }
    }

    start() {
        // Don't let browser restore scroll position.
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // Set global mark
        window.MIP.MIP_ROOT_PAGE = window.MIP_ROOT_PAGE;

        this.initRouter();
        this.initAppShell();
        addMIPCustomScript();

        // Listen message from inner iframes
        window.addEventListener('message', (e) => {
            if (e.source.location.origin === window.location.origin) {
                this.messageHandlers.forEach(handler => {
                    handler.call(this, e.data.type, e.data.data || {});
                });
            }
        }, false);

        // Job complete!
        document.body.setAttribute('mip-ready', '');

        this.initHashScroller();
    }

    /**** Root Page methods ****/

    /**
     * emit a custom event in current page
     *
     * @param {Object} event event
     * @param {string} event.name event name
     * @param {Object} event.data event data
     */
    emitEventInCurrentPage({name, data = {}}) {
        // notify current iframe
        if (this.currentChildPageId) {
            let $iframe = getIFrame(this.currentChildPageId);
            $iframe && $iframe.contentWindow.postMessage({
                type: MESSAGE_APPSHELL_EVENT,
                data: {name, data}
            }, window.location.origin);
        }
        // emit CustomEvent in current iframe
        else {
            customEmit(window, name, data);
        }
    }

    /**
     * read <mip-shell> if provided
     *
     */
    readMIPShellConfig() {
        // read <mip-shell> and save in `data`
        this.appshellRoutes = getMIPShellConfig().routes || [];

        this.appshellRoutes.forEach(route => {
            route.meta = util.fn.extend(true, {}, DEFAULT_SHELL_CONFIG, route.meta || {});
            route.regexp = convertPatternToRegexp(route.pattern || '*');

             // get title from <title> tag
            if (!route.meta.header.title) {
                route.meta.header.title = (document.querySelector('title') || {}).innerHTML || '';
            }
        });
    }

    /**
     * find route.meta by pageId
     *
     * @param {string} pageId pageId
     * @return {Object} meta object
     */
    findMetaByPageId(pageId) {
        if (this.appshellCache[pageId]) {
            return this.appshellCache[pageId];
        }
        else {
            let route;
            for (let i = 0; i < this.appshellRoutes.length; i++) {
                route = this.appshellRoutes[i];
                if (route.regexp.test(pageId)) {
                    this.appshellCache[pageId] = route.meta;
                    return route.meta;
                }
            }
        }
        return Object.assign({}, DEFAULT_SHELL_CONFIG);
    }

    /**
     * refresh appshell with data from <mip-shell>
     *
     * @param {string} targetPageId targetPageId
     * @param {Object} extraData extraData
     */
    refreshAppShell(targetPageId, extraData) {
        let meta = this.findMetaByPageId(targetPageId);
        this.appshell.refresh(util.fn.extend(true, {}, meta, extraData), targetPageId);
    }

    /**
     * apply transition effect to relative two pages
     *
     * @param {string} targetPageId targetPageId
     */
    applyTransition(targetPageId) {
        // Disable scrolling of first page when iframe is covered
        if (targetPageId === this.pageId) {
            document.body.classList.remove('no-scroll');
        }
        else {
            document.body.classList.add('no-scroll');
        }

        if (this.currentChildPageId) {
            frameMoveOut(this.currentChildPageId, {
                transition: this.allowTransition,
                onComplete: () => {
                    this.allowTransition = false;
                }
            });
        }

        frameMoveIn(targetPageId, {
            transition: this.allowTransition,
            onComplete: () => {
                this.allowTransition = false;
            }
        });
    }

    /**
     * add page to `children`
     *
     * @param {Page} page page
     */
    addChild(page) {
        if (this.isRootPage) {
            this.children.push(page);
        }
    }

    /**
     * compare with two pageIds
     *
     * @param {string} pageId pageId
     * @param {string} anotherPageId another pageId
     * @return {boolean} result
     */
    isSamePage(pageId, anotherPageId) {
        let hashReg = /#.*$/;
        if (pageId && anotherPageId) {
            return pageId.replace(hashReg, '') === anotherPageId.replace(hashReg, '');
        }
        return false;
    }

    /**
     * get page by pageId
     *
     * @param {string} pageId pageId
     * @return {Page} page
     */
    getPageById(pageId) {
        if (!pageId) {
            return this;
        }
        return this.isSamePage(pageId, this.pageId) ?
            this : this.children.find(child => this.isSamePage(child.pageId, pageId));
    }

    /**
     * render with current route
     *
     * @param {Route} from route
     * @param {Route} to route
     */
    render(from, to) {
        /**
         * if `to` route is the same with `from` route in path & query,
         * scroll in current page
         */
        if (isSameRoute(from, to, true)) {
            this.emitEventInCurrentPage({
                name: CUSTOM_EVENT_SCROLL_TO_HASH,
                data: {
                    hash: to.hash
                }
            });
            return;
        }

        // otherwise, render target page
        let targetPageId = getFullPath(to);
        let targetPage = this.getPageById(targetPageId);

        if (!targetPage) {
            // create an iframe
            let targetFrame = createIFrame(targetPageId);
            this.applyTransition(targetPageId);
        }
        else {
            this.applyTransition(targetPageId);
            MIP.$recompile();
        }
        this.refreshAppShell(targetPageId, to.meta);

        this.currentChildPageId = targetPageId;
    }
}

export default Page;
