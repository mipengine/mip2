/**
 * @file html.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

import {addProp} from 'compiler/helpers';

export default function html(el, dir) {
    if (dir.value) {
        addProp(el, 'innerHTML', `_s(${dir.value})`);
    }
}
