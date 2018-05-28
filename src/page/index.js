/**
 * @file main entry
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import * as util from './util';
import {customEmit} from '../vue-custom-element/utils/custom-event';
import Router from './router';
import AppShell from './appshell';
import '../styles/mip.less';

import {
    MESSAGE_APPSHELL_REFRESH, MESSAGE_APPSHELL_EVENT,
    MESSAGE_ROUTER_PUSH, MESSAGE_ROUTER_REPLACE, MESSAGE_ROUTER_FORCE
} from './const';

class Page {
    constructor() {
        this.pageId = util.getPath(window.location.href);
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
    }

    initRouter() {
        let router;
        // outside iframe
        if (this.isRootPage) {
            router = new Router({
                routes: [
                    {
                        path: window.location.pathname
                    }
                ]
            });
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
                else if (type === MESSAGE_ROUTER_FORCE) {
                    window.location.href = data.location;
                }
            });
        }
        // inside iframe
        else {
            router = window.parent.MIP_ROUTER;
            router.addRoute({
                path: window.location.pathname
            });
            router.rootPage.addChild(this);
        }

        // proxy <a mip-link>
        util.installMipLink(router, this);
    }

    initAppShell() {
        // read <mip-shell> and save in `data`
        this.data.appshell = util.getMIPShellConfig();
        if (!this.data.appshell.header.title) {
            this.data.appshell.header.title = document.querySelector('title').innerHTML;
        }

        /**
         * in root page, we need to:
         * 1. refresh appshell with current data in <mip-shell>
         * 2. listen to a refresh event emited by current child iframe
         */
        if (this.isRootPage) {
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
     * notify root page with an eventdata
     *
     * @param {Object} data eventdata
     */
    notifyRootPage(data) {
        parent.postMessage(data, window.location.origin);
    }

    start() {
        // Set global mark
        mip.MIP_ROOT_PAGE = window.MIP_ROOT_PAGE;

        this.initRouter();
        this.initAppShell();
        util.addMIPCustomScript();
        document.body.setAttribute('mip-ready', '');

        // listen message from iframes
        window.addEventListener('message', (e) => {
            if (e.source.origin === window.location.origin) {
                this.messageHandlers.forEach(handler => {
                    handler.call(this, e.data.type, e.data.data || {});
                });
            }
        }, false);
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
            let $iframe = util.getIFrame(this.currentChildPageId);
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
        if (this.currentChildPageId) {
            util.frameMoveOut(this.currentChildPageId, {
                onComplete: () => {
                    // 没有引用 mip.js 的错误页
                    if (!this.getPageById(this.currentChildPageId)) {
                        util.removeIFrame(this.currentChildPageId);
                    }
                    this.currentChildPageId = targetPageId;
                }
            });
        }

        util.frameMoveIn(targetPageId, {
            onComplete: () => {
                this.currentChildPageId = targetPageId;
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
        console.log(from, to);
        let targetPageId = to.fullPath;
        let targetPage = this.getPageById(targetPageId);

        if (!targetPage) {
            this.appshell.showLoading();
            // create an iframe and hide loading when finished
            let targetFrame = util.createIFrame(targetPageId, {
                onLoad: () => {
                    this.appshell.hideLoading();
                    this.applyTransition(targetPageId);
                }
            });
        }
        else {
            this.refreshAppShell(targetPage.data.appshell, targetPageId);
            this.applyTransition(targetPageId);
        }

    }
}

export default new Page();
