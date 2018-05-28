/**
 * @file render-static.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/* eslint-disable fecs-valid-jsdoc */

import {cloneVNode, cloneVNodes} from 'core/vdom/vnode';

/**
 * Runtime helper for rendering static trees.
 */
export function renderStatic(
    index,
    isInFor
) {
    // static trees can be rendered once and cached on the contructor options
    // so every instance shares the same cached trees
    const renderFns = this.$options.staticRenderFns;
    const cached = renderFns.cached || (renderFns.cached = []);
    let tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree by doing a shallow clone.
    if (tree && !isInFor) {
        return Array.isArray(tree)
            ? cloneVNodes(tree)
            : cloneVNode(tree);
    }

    // otherwise, render a fresh tree.
    tree = cached[index] = renderFns[index].call(this._renderProxy, null, this);
    markStatic(tree, `__static__${index}`, false);
    return tree;
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
export function markOnce(
    tree,
    index,
    key
) {
    markStatic(tree, `__once__${index}${key ? `_${key}` : ''}`, true);
    return tree;
}

function markStatic(
    tree,
    key,
    isOnce
) {
    if (Array.isArray(tree)) {
        for (let i = 0; i < tree.length; i++) {
            if (tree[i] && typeof tree[i] !== 'string') {
                markStaticNode(tree[i], `${key}_${i}`, isOnce);
            }

        }
    }
    else {
        markStaticNode(tree, key, isOnce);
    }
}

function markStaticNode(node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
}
