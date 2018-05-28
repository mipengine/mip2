/**
 * @file events.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

import {isDef, isUndef} from 'shared/util';
import {updateListeners} from 'core/vdom/helpers/index';
import {isIE, supportsPassive} from 'core/util/env';
import {RANGE_TOKEN} from 'web/compiler/directives/model';

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents(on) {

    /* istanbul ignore if */
    if (isDef(on[RANGE_TOKEN])) {
        // IE input[type=range] only supports `change` event
        const event = isIE ? 'change' : 'input';
        on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
        delete on[RANGE_TOKEN];
    }
}

let target;

function add(
    event,
    handler,
    once,
    capture,
    passive
) {
    if (once) {
        const oldHandler = handler;
        /* eslint-disable fecs-camelcase */
        const _target = target; // save current target element in closure
        /* eslint-enable fecs-camelcase */
        handler = function (ev) {
            const res = arguments.length === 1
                ? oldHandler(ev)
                : oldHandler.apply(null, arguments);
            if (res !== null) {
                remove(event, handler, capture, _target);
            }

        };
    }

    target.addEventListener(
        event,
        handler,
        supportsPassive
            ? {capture, passive}
            : capture
    );
}

function remove(
    event,
    handler,
    capture,
    /* eslint-disable fecs-camelcase */
    _target
    /* eslint-enable fecs-camelcase */
) {
    (_target || target).removeEventListener(event, handler, capture);
}

function updateDOMListeners(oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
        return;
    }

    const on = vnode.data.on || {};
    const oldOn = oldVnode.data.on || {};
    target = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add, remove, vnode.context);
}

export default {
    create: updateDOMListeners,
    update: updateDOMListeners
};
