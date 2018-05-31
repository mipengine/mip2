/**
 * @file main entry
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {getLocation} from './util/path';
import {isOnlyDifferentInHash, getFullPath} from './util/route';
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

import {customEmit} from '../vue-custom-element/utils/custom-event';
import Router from './router';
import AppShell from './appshell';
import '../styles/mip.less';

import {
    MESSAGE_APPSHELL_REFRESH, MESSAGE_APPSHELL_EVENT,
    MESSAGE_ROUTER_PUSH, MESSAGE_ROUTER_REPLACE
} from './const';

class Page {
    constructor() {
        if (window.parent && window.parent.MIP_ROOT_PAGE) {
            this.isRootPage = false;
        }
        else {
            window.MIP_ROOT_PAGE = true;
            this.isRootPage = true;
        }
        this.data = {
            appshell: {}
        };

        // root page
        this.appshell = null;
        this.children = [];
        this.currentChildPageId = null;
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
                    router.push(data.location);
                }
                else if (type === MESSAGE_ROUTER_REPLACE) {
                    router.replace(data.location);
                }
            });
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
         * 1. create a loading
         * 2. refresh appshell with current data in <mip-shell>
         * 3. listen to a refresh event emited by current child iframe
         */
        if (this.isRootPage) {
            // Create loading div
            createLoading();

            this.messageHandlers.push((type, {appshellData, pageId}) => {
                if (type === MESSAGE_APPSHELL_REFRESH) {
                    this.refreshAppShell(appshellData, pageId);
                }
            });
            this.refreshAppShell(this.data.appshell);
        }
        /**
         * in child page:
         * 1. notify root page to refresh appshell at first time
         * 2. listen to appshell events such as `click-button` emited by root page
         */
        else {
            this.notifyRootPage({
                type: MESSAGE_APPSHELL_REFRESH,
                data: {
                    appshellData: this.data.appshell,
                    pageId: this.pageId
                }
            });
            this.messageHandlers.push((type, event) => {
                if (type === MESSAGE_APPSHELL_EVENT) {
                    this.emitEventInCurrentPage(event);
                }
            });
        }
    }

    /**
     * read <mip-shell> if provided
     *
     */
    readMIPShellConfig() {
        // read <mip-shell> and save in `data`
        let config = getMIPShellConfig();

        // try to resolve base in <base> tag
        if (!config.view.base) {
            config.view.base = (document.getElementsByTagName('base')[0] || {}).href || '';
        }
        config.view.base = config.view.base.replace(/\/$/, '');

        // get title from <title> tag
        if (!config.header.title) {
            config.header.title = (document.querySelector('title') || {}).innerHTML || '';
        }

        this.data.appshell = config;
    }

    /**
     * notify root page with an eventdata
     *
     * @param {Object} data eventdata
     */
    notifyRootPage(data) {
        parent.postMessage(data, window.location.origin);
    }

    start() {
        // Set global mark
        window.MIP.MIP_ROOT_PAGE = window.MIP_ROOT_PAGE;

        this.readMIPShellConfig();
        this.initRouter();
        this.initAppShell();
        addMIPCustomScript();

        // Create loading div
        if (this.isRootPage) {
            createLoading(this.data.appshell.header.show);
        }

        // Listen message from iframes
        window.addEventListener('message', (e) => {
            if (e.source.location.origin === window.location.origin) {
                this.messageHandlers.forEach(handler => {
                    handler.call(this, e.data.type, e.data.data || {});
                });
            }
        }, false);

        // Job complete!
        document.body.setAttribute('mip-ready', '');
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
     * refresh appshell with data from <mip-shell>
     *
     * @param {Object} appshellData data
     * @param {string} targetPageId targetPageId
     */
    refreshAppShell(appshellData, targetPageId) {
        if (!this.appshell) {
            this.appshell = new AppShell({
                data: appshellData
            }, this);
        }
        else {
            this.appshell.refresh(appshellData, targetPageId);
        }
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
     * get page by pageId
     *
     * @param {string} pageId pageId
     * @return {Page} page
     */
    getPageById(pageId) {
        if (!pageId) {
            return this;
        }
        return pageId === this.pageId ?
            this : this.children.find(child => child.pageId === pageId);
    }

    /**
     * render with current route
     *
     * @param {Route} from route
     * @param {Route} to route
     */
    render(from, to) {
        /**
         * if `to` route is different with `from` route only in hash,
         * do nothing and let browser jump to that anchor
         */
        if (isOnlyDifferentInHash(from, to)) {
            return;
        }

        // otherwise, render target page
        let targetPageId = getFullPath({path: to.path, query: to.query});
        let targetPage = this.getPageById(targetPageId);

        if (!targetPage) {
            // create an iframe
            let targetFrame = createIFrame(targetPageId);
            this.applyTransition(targetPageId);
        }
        else {
            this.refreshAppShell(targetPage.data.appshell, targetPageId);
            this.applyTransition(targetPageId);
            MIP.$recompile();
        }

        this.currentChildPageId = targetPageId;
    }
}

export default Page;
