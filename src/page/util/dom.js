/**
 * @file define dom functions
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {getPath} from './url';
import css from '../../util/dom/css';
import sandbox from '../../sandbox';
import util from '../../util';

import {
    MIP_CONTAINER_ID,
    MIP_VIEW_ID,
    MIP_CONTENT_IGNORE_TAG_LIST,
    DEFAULT_SHELL_CONFIG,
    MIP_IFRAME_CONTAINER
} from '../const';

let {window: sandWin, document: sandDoc} = sandbox;
let activeZIndex = 10000;

export function createIFrame(path, {base, onLoad, onError} = {}) {
    let container = document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${path}"]`);

    if (!container) {
        container = document.createElement('iframe');
        if (typeof onLoad === 'function') {
            container.onload = onLoad;
        }
        if (typeof onError === 'function') {
            container.onerror = onError;
        }
        container.setAttribute('src', base + path);
        container.setAttribute('class', MIP_IFRAME_CONTAINER);
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

export function frameMoveIn(pageId, {onComplete} = {}) {
    let iframe = getIFrame(pageId);
    let $loading = getLoading();

    if (iframe) {
        let width = window.innerWidth;

        css(iframe, {
            'z-index': activeZIndex++,
            display: 'block'
        });
        iframe.classList.add('slide-enter');
        iframe.classList.add('slide-enter-active');

        // trigger layout
        iframe.offsetWidth;

        whenTransitionEnds(iframe, 'transition', () => {
            iframe.classList.remove('slide-enter-to');
            iframe.classList.remove('slide-enter-active');
            onComplete && onComplete();
        });

        nextFrame(() => {
            iframe.classList.add('slide-enter-to');
            iframe.classList.remove('slide-enter');
        });
    }
}

export function frameMoveOut(pageId, {onComplete} = {}) {
    let iframe = getIFrame(pageId);
    if (iframe) {
        let width = window.innerWidth;

        iframe.classList.add('slide-leave');
        iframe.classList.add('slide-leave-active');

        // trigger layout
        iframe.offsetWidth;

        whenTransitionEnds(iframe, 'transition', () => {
            css(iframe, {
                display: 'none',
                'z-index': 10000
            })
            iframe.classList.remove('slide-leave-to');
            iframe.classList.remove('slide-leave-active');
            onComplete && onComplete();
        });

        nextFrame(() => {
            iframe.classList.add('slide-leave-to');
            iframe.classList.remove('slide-leave');
        });
    }
}

export function getIFrame(iframe) {
    if (typeof iframe === 'string') {
        return document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${iframe}"]`);
    }

    return iframe;
}

function getLoading() {
    return document.querySelector('#mip-shell-loading');
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
