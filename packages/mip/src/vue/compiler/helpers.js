/**
 * @file helpers.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/* eslint-disable no-console */

import {parseFilters} from './parser/filter-parser';

export function baseWarn(msg) {
    console.error(`[Vue compiler]: ${msg}`);
}

export function pluckModuleFunction(
    modules,
    key
) {
    return modules
        ? modules.map(m => m[key]).filter(_ => _)
        : [];
}

export function addProp(el, name, value) {
    (el.props || (el.props = [])).push({name, value});
}

export function addAttr(el, name, value) {
    (el.attrs || (el.attrs = [])).push({name, value});
}

export function addDirective(
    el,
    name,
    rawName,
    value,
    arg,
    modifiers
) {
    (el.directives || (el.directives = [])).push({name, rawName, value, arg, modifiers});
}

export function addHandler(
    el,
    name,
    value,
    modifiers,
    important,
    warn
) {
    // warn prevent and passive modifier

    /* istanbul ignore if */
    if (
        process.env.NODE_ENV !== 'production'
        && warn
        && modifiers
        && modifiers.prevent
        && modifiers.passive
    ) {
        warn(
            'passive and prevent can\'t be used together. '
            + 'Passive handler can\'t prevent default event.'
        );
    }

    // check capture modifier
    if (modifiers && modifiers.capture) {
        delete modifiers.capture;
        name = '!' + name; // mark the event as captured
    }

    if (modifiers && modifiers.once) {
        delete modifiers.once;
        name = '~' + name; // mark the event as once
    }

    /* istanbul ignore if */
    if (modifiers && modifiers.passive) {
        delete modifiers.passive;
        name = '&' + name; // mark the event as passive
    }

    let events;
    if (modifiers && modifiers.native) {
        delete modifiers.native;
        events = el.nativeEvents || (el.nativeEvents = {});
    }
    else {
        events = el.events || (el.events = {});
    }
    const newHandler = {value, modifiers};
    const handlers = events[name];

    /* istanbul ignore if */
    if (Array.isArray(handlers)) {
        important ? handlers.unshift(newHandler) : handlers.push(newHandler);
    }
    else if (handlers) {
        events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
    }
    else {
        events[name] = newHandler;
    }
}

export function getBindingAttr(
    el,
    name,
    getStatic
) {
    const dynamicValue = getAndRemoveAttr(el, ':' + name)
    || getAndRemoveAttr(el, 'v-bind:' + name);
    if (dynamicValue != null) {
        return parseFilters(dynamicValue);
    }
    else if (getStatic !== false) {
        const staticValue = getAndRemoveAttr(el, name);
        if (staticValue != null) {
            return JSON.stringify(staticValue);
        }
    }
}

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
export function getAndRemoveAttr(
    el,
    name,
    removeFromMap
) {
    let val;
    if ((val = el.attrsMap[name]) != null) {
        const list = el.attrsList;
        for (let i = 0, l = list.length; i < l; i++) {
            if (list[i].name === name) {
                list.splice(i, 1);
                break;
            }

        }
    }

    if (removeFromMap) {
        delete el.attrsMap[name];
    }

    return val;
}
