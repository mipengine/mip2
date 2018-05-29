/**
 * @file check-keycodes.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/* eslint-disable fecs-valid-jsdoc */

import config from 'core/config';
import {hyphenate} from 'shared/util';

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
export function checkKeyCodes(
    eventKeyCode,
    key,
    builtInAlias,
    eventKeyName
) {
    const keyCodes = config.keyCodes[key] || builtInAlias;
    if (keyCodes) {
        if (Array.isArray(keyCodes)) {
            return keyCodes.indexOf(eventKeyCode) === -1;
        }
        return keyCodes !== eventKeyCode;
    }
    else if (eventKeyName) {
        return hyphenate(eventKeyName) !== key;
    }
}
