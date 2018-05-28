/**
 * @file bind-object-listeners.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/* eslint-disable guard-for-in */

import {
    warn,
    extend,
    isPlainObject
} from 'core/util/index';

export function bindObjectListeners(data, value) {
    if (value) {
        if (!isPlainObject(value)) {
            process.env.NODE_ENV !== 'production' && warn(
                'v-on without argument expects an Object value',
                this
            );
        }
        else {
            const on = data.on = data.on ? extend({}, data.on) : {};
            for (const key in value) {
                const existing = on[key];
                const ours = value[key];
                on[key] = existing ? [].concat(ours, existing) : ours;
            }
        }
    }

    return data;
}
