/**
 * @file define dom functions
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import css from '../../util/dom/css';
import sandbox from '../../sandbox';

import {
    MIP_CONTENT_IGNORE_TAG_LIST,
    MIP_IFRAME_CONTAINER
} from '../const';

let {window: sandWin, document: sandDoc} = sandbox;
let activeZIndex = 10000;

export function createIFrame(path, {onLoad, onError} = {}) {
    let container = document.querySelector(`.${MIP_IFRAME_CONTAINER}[data-page-id="${path}"]`);

    if (!container) {
        // let loading = getLoading();
        // css(loading, {display: 'block'});
        container = document.createElement('iframe');
        container.onload = () => {
            // setTimeout(() => css(loading, {display: 'none'}), 320);
            typeof onLoad === 'function' && onLoad();
        };
        container.onerror = () => {
            // setTimeout(() => css(loading, {display: 'none'}), 320);
            typeof onError === 'function' && onError();
        };
        // TODO: use XHR to load iframe so that we can get httpRequest.status 404
        container.setAttribute('src', path);
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

export function createLoading(pageMeta) {
    let loading = document.createElement('div');
    loading.id = 'mip-page-loading';
    loading.setAttribute('class', 'mip-page-loading');
    loading.innerHTML = `
        <div class="mip-page-loading-header">
            <span class="material-icons back-button">keyboard_arrow_left</span>
            <div class="mip-appshell-header-logo-title">
                <img class="mip-appshell-header-logo" src="${pageMeta.header.logo}">
                <span class="mip-appshell-header-title"></span>
            </div>
        </div>
    `;
    document.body.appendChild(loading);
}

export function getLoading(targetMeta) {
    let loading = document.querySelector('#mip-page-loading');
    if (!targetMeta) {
        return loading;
    }

    if (!targetMeta.header.show) {
        document.querySelector('#mip-page-loading .mip-page-loading-header')
            .setAttribute('style', 'display: none');
    }
    else {
        document.querySelector('#mip-page-loading .mip-page-loading-header')
            .setAttribute('style', 'display: flex');
    }

    if (targetMeta.header.logo) {
        document.querySelector('#mip-page-loading .mip-appshell-header-logo')
            .setAttribute('src', targetMeta.header.logo);
    }

    if (targetMeta.header.title) {
        document.querySelector('#mip-page-loading .mip-appshell-header-title')
            .innerHTML = targetMeta.header.title;
    }

    if (targetMeta.view.isIndex) {
        document.querySelector('#mip-page-loading .back-button')
            .setAttribute('style', 'display: none');
    }
    else {
        document.querySelector('#mip-page-loading .back-button')
            .setAttribute('style', 'display: block');
    }

    return loading;
}

export function getMIPShellConfig() {
    let rawJSON;
    let $shell = document.body.querySelector('mip-shell');
    if ($shell) {
        rawJSON = $shell.children[0].innerHTML;
    }
    try {
        return JSON.parse(rawJSON);
    }
    catch (e) {}

    return {};
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

export function frameMoveIn(pageId, {transition, targetMeta, onComplete, newPage} = {}) {
    let iframe = getIFrame(pageId);

    if (!iframe) {
        onComplete && onComplete();
        return;
    }

    if (transition) {
        let loading;
        let movingDom;

        if (newPage) {
            movingDom = loading = getLoading(targetMeta);
            css(loading, {
                display: 'block'
            });
        }
        else {
            movingDom = iframe;
            css(iframe, {
                'z-index': activeZIndex++,
                display: 'block'
            });
        }

        movingDom.classList.add('slide-enter', 'slide-enter-active');

        // trigger layout
        movingDom.offsetWidth;

        whenTransitionEnds(movingDom, 'transition', () => {
            movingDom.classList.remove('slide-enter-to', 'slide-enter-active');

            setTimeout(() => {
                if (newPage) {
                    css(loading, {
                        display: 'none'
                    });
                    css(iframe, {
                        'z-index': activeZIndex++,
                        display: 'block'
                    });
                }

                onComplete && onComplete();
            }, 320);
        });

        nextFrame(() => {
            movingDom.classList.add('slide-enter-to');
            movingDom.classList.remove('slide-enter');
        });
    }
    else {
        css(iframe, {
            'z-index': activeZIndex++,
            display: 'block'
        });
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
