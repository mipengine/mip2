/**
 * @file mip entry
 * @author sfe
 */

import Vue from 'vue';
import customElement from './vue-custom-element/index';
// import customElementBuildInComponents from './components';
import util from './util';
import sandbox from './sandbox';
import layout from './layout';
import viewer from './viewer';
import viewport from './viewport';
import page from './page/index';
import builtinComponents from './components';
import registerElement from './register-element';

import sleepWakeModule from './sleepWakeModule';
import performance from './performance';

import './log/monitor';

import 'script-loader!deps/zepto';
import 'script-loader!deps/fetch.js';
import 'script-loader!fetch-jsonp';
import 'script-loader!document-register-element/build/document-register-element';

// mip1 的兼容代码
import mip1PolyfillInstall from './mip1-polyfill';

import './polyfills';

let mip = {
    version: '2',
    Vue,
    // 暴露注册 Vue 组件的方法
    registerVueCustomElement(tag, component) {
        Vue.customElement(tag, component);
    },
    // 暴露注册 mip 组件的方法
    registerCustomElement(tag, component) {
        registerElement(tag, component);
    },
    util,
    viewer,
    viewport,
    hash: util.hash,
    sandbox,
    css: {}
};

if (window.MIP) {
    let exts = window.MIP;
    mip.extensions = exts;
}

window.MIP = window.mip = mip;
// 当前是否是独立站
mip.standalone = typeof window.top.mip !== 'undefined';
mip.viewer.isIframed = !mip.standalone;
mip.viewport.init();

// before document ready
mip.push = function (extensions) {
    if (!mip.extensions) {
        mip.extensions = [];
    }

    mip.extensions.push(extensions);
};

// install mip1 polyfill
mip1PolyfillInstall(mip);

Vue.use(customElement);
// Vue.use(customElementBuildInComponents);
builtinComponents.register();

util.dom.waitDocumentReady(() => {
    // Initialize sleepWakeModule
    sleepWakeModule.init();

    // Initialize viewer
    viewer.init();

    // Find the default-hidden elements.
    let hiddenElements = Array.prototype.slice.call(document.getElementsByClassName('mip-hidden'));

    // Regular for checking mip elements.
    let mipTagReg = /mip-/i;

    // Apply layout for default-hidden elements.
    hiddenElements.forEach(element => element.tagName.search(mipTagReg) > -1 && layout.applyLayout(element));

    // Register builtin extensions
    // components.register();

    performance.start(Date.now());

    // send performance data until the data collection is completed
    performance.on('update', timing => {
        if (timing.MIPDomContentLoaded
            && timing.MIPStart
            && timing.MIPPageShow
            && timing.MIPFirstScreen
        ) {
            viewer.sendMessage('performance_update', timing);
        }
    });

    // Show page
    viewer.show();

    page.start();

    // clear cookie
    let storage = util.customStorage(2);
    storage.delExceedCookie();
});

export default mip;
