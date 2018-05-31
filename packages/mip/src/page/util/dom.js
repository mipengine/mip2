/**
 * @file define dom functions
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css';
import sandbox from '../../sandbox';
import {cleanPath} from './path';
import util from '../../util';

import {
    MIP_CONTENT_IGNORE_TAG_LIST,
    DEFAULT_SHELL_CONFIG,
    MIP_IFRAME_CONTAINER
} from '../const';

let {window: sandWin, document: sandDoc} = sandbox;
let activeZIndex = 10000;

export function createIFrame(path, {base, onLoad, onError} = {}) {
    let container = document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${path}"]`);

    if (!container) {
        let loading = getLoading();
        css(loading, {display: 'block'});
        container = document.createElement('iframe');
        container.onload = () => {
            setTimeout(() => css(loading, {display: 'none'}), 320);
            typeof onLoad === 'function' && onLoad();
        };
        container.onerror = () => {
            setTimeout(() => css(loading, {display: 'none'}), 320);
            typeof onError === 'function' && onError();
        };
        // TODO: use XHR to load iframe so that we can get httpRequest.status 404
        container.setAttribute('src', cleanPath(base + path));
        container.setAttribute('class', MIP_IFRAME_CONTAINER);

        /**
         * Fix an iOS iframe width bug, see examples/mip1/test.html
         * https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari
         */
        container.setAttribute('width', '100%');
        container.setAttribute('scrolling', 'no');

        container.setAttribute('data-page-id', path);
        container.setAttribute('sandbox', 'allow-top-navigation allow-popups allow-scripts allow-forms allow-pointer-lock allow-popups-to-escape-sandbox allow-same-origin allow-modals')
        document.body.appendChild(container);
    }
    else {
        if (typeof onLoad === 'function') {
            onLoad();
        }
    }

    return container;
}

export function removeIFrame(pageId) {
    let container = document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${pageId}"]`);
    if (container) {
        container.parentNode.removeChild(container);
    }
}

export function getIFrame(iframe) {
    if (typeof iframe === 'string') {
        return document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${iframe}"]`);
    }

    return iframe;
}

export function createLoading(showHeader = false) {
    let loading = document.createElement('div');
    loading.id = 'mip-page-loading';
    loading.setAttribute('class', 'mip-page-loading');
    toggleLoadingHeader(showHeader, loading);
    document.body.appendChild(loading);
}

function getLoading() {
    return document.querySelector('#mip-page-loading');
}

export function toggleLoadingHeader(toggle, loading = getLoading()) {
    // with header
    if (toggle) {
        loading.classList.add('with-header');
    }
    // without header
    else {
        loading.classList.remove('with-header');
    }
}

export function getMIPShellConfig() {
    let rawJSON;
    let $shell = document.body.querySelector('mip-shell');
    if ($shell) {
        rawJSON = $shell.children[0].innerHTML;
    }
    try {
        return util.fn.extend(true, DEFAULT_SHELL_CONFIG, JSON.parse(rawJSON));
    }
    catch (e) {}

    return DEFAULT_SHELL_CONFIG;
}

export function addMIPCustomScript(win = window) {
    let doc = win.document;
    let script = doc.querySelector('script[type="application/mip-script"]');
    if (!script) {
        return;
    }

    let customFunction = getSandboxFunction(script.innerHTML);
    script.remove();

    win.addEventListener('ready-to-watch', () => customFunction(sandWin, sandDoc));
}

function getSandboxFunction(script) {
    return new Function('window', 'document', `
        let {alert, close, confirm, prompt, setTimeout, setInterval, self, top} = window;

        ${script}
    `);
}

let transitionProp = 'transition';
let transitionEndEvent = 'transitionend';
let animationProp = 'animation';
let animationEndEvent = 'animationend';

if (window.ontransitionend === undefined
    && window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
}

if (window.onanimationend === undefined
    && window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
}

const raf = inBrowser
    ? window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : setTimeout
    : fn => fn();

export function nextFrame(fn) {
    raf(() => {
        raf(fn);
    });
}

export function whenTransitionEnds(el, type, cb) {
    if (!type) {
        return cb();
    }

    const event = type === 'transition' ? transitionEndEvent : animationEndEvent;
    const onEnd = e => {
        if (e.target === el) {
            end();
        }
    };
    const end = () => {
        el.removeEventListener(event, onEnd);
        cb();
    };
    el.addEventListener(event, onEnd);
}

export function frameMoveIn(pageId, {transition, onComplete} = {}) {
    let iframe = getIFrame(pageId);
    let loading = getLoading();

    if (iframe) {
        css(iframe, {
            'z-index': activeZIndex++,
            display: 'block'
        });

        if (transition) {
            iframe.classList.add('slide-enter', 'slide-enter-active');
            loading.classList.add('slide-enter', 'slide-enter-active');

            // trigger layout
            iframe.offsetWidth;

            whenTransitionEnds(iframe, 'transition', () => {
                iframe.classList.remove('slide-enter-to', 'slide-enter-active');
                loading.classList.remove('slide-enter-to', 'slide-enter-active');
                onComplete && onComplete();
            });

            nextFrame(() => {
                iframe.classList.add('slide-enter-to');
                iframe.classList.remove('slide-enter');
                loading.classList.add('slide-enter-to');
                loading.classList.remove('slide-enter');
            });
        }
        else {
            onComplete && onComplete();
        }
    }
}

export function frameMoveOut(pageId, {transition, onComplete} = {}) {
    let iframe = getIFrame(pageId);

    if (iframe) {
        if (transition) {
            iframe.classList.add('slide-leave', 'slide-leave-active');

            // trigger layout
            iframe.offsetWidth;

            whenTransitionEnds(iframe, 'transition', () => {
                css(iframe, {
                    display: 'none',
                    'z-index': 10000
                });
                iframe.classList.remove('slide-leave-to', 'slide-leave-active');
                onComplete && onComplete();
            });

            nextFrame(() => {
                iframe.classList.add('slide-leave-to');
                iframe.classList.remove('slide-leave');
            });
        }
        else {
            css(iframe, {
                display: 'none',
                'z-index': 10000
            });
            onComplete && onComplete();
        }
    }
}

export const inBrowser = typeof window !== 'undefined';

function clickedInEl (el, x, y) {
    const b = el.getBoundingClientRect();
    return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
}

export function clickedInEls (e, elements) {
    const {clientX: x, clientY: y} = e;
    for (const el of elements) {
        if (clickedInEl(el, x, y)) {
            return true;
        }
    }
    return false;
}
