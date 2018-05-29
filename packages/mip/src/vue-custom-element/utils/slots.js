/**
 * @file slots.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

import {toArray} from './helpers';

// Get attributes of given node
export function getAttributes(children) {
    const attributes = {};

    toArray(children.attributes).forEach(attribute => {
        attributes[attribute.nodeName === 'vue-slot'
            ? 'slot'
            : attribute.nodeName] = attribute.nodeValue;
    });

    return attributes;
}

// Helper utility returning slots for render function
export function getSlots(innerHTML, createElement) {
    let emptyNode = document.createElement('div');
    emptyNode.innerHTML = innerHTML;
    let children = emptyNode.children;

    const slots = [];
    toArray(children).forEach(child => {
        if (child.nodeName === '#text') {
            if (child.nodeValue.trim()) {
                slots.push(createElement('span', child.nodeValue));
            }
        }
        else if (child.nodeName !== '#comment') {
            const attributes = getAttributes(child);
            const elementOptions = {
                attrs: attributes,
                domProps: {
                    innerHTML: child.innerHTML
                }
            };

            if (attributes.slot) {
                elementOptions.slot = attributes.slot;
                attributes.slot = undefined;
            }

            slots.push(createElement(child.tagName, elementOptions));
        }
    });

    return slots;
}
