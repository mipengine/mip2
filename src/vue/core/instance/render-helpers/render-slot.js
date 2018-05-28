/**
 * @file render-slot.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/* eslint-disable fecs-valid-jsdoc */

import {
    extend,
    warn,
    isObject
} from 'core/util/index';

/**
 * Runtime helper for rendering <slot>
 */
export function renderSlot(
    name,
    fallback,
    props,
    bindObject
) {
    const scopedSlotFn = this.$scopedSlots[name];
    if (scopedSlotFn) { // scoped slot
        props = props || {};
        if (bindObject) {
            if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
                warn(
                    'slot v-bind without argument expects an Object',
                    this
                );
            }

            props = extend(extend({}, bindObject), props);
        }

        return scopedSlotFn(props) || fallback;
    }
    const slotNodes = this.$slots[name];
    // warn duplicate slot usage
    if (slotNodes && process.env.NODE_ENV !== 'production') {
        slotNodes._rendered && warn(
            `Duplicate presence of slot "${name}" found in the same render tree `
            + '- this will likely cause render errors.',
            this
        );
        slotNodes._rendered = true;
    }

    return slotNodes || fallback;
}
