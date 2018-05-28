/**
 * @file vnode.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

export default class VNode {

    // rendered in this component's scope

    // component instance
    // component placeholder node

    // strictly internal
    // contains raw HTML? (server only)
    // hoisted static node
    // necessary for enter transition check
    // empty comment placeholder?
    // is a cloned node?
    // is a v-once node?
    // async component factory function

    // real context vm for functional nodes
    // for SSR caching
    // functioanl scope id support

    /* eslint-disable */
    constructor(
        tag,
        data,
        children,
        text,
        elm,
        context,
        componentOptions,
        asyncFactory
    ) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context;
        this.functionalContext = undefined;
        this.functionalOptions = undefined;
        this.functionalScopeId = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.componentInstance = undefined;
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = true;
        this.isComment = false;
        this.isCloned = false;
        this.isOnce = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncPlaceholder = false;
    }

    // DEPRECATED: alias for componentInstance for backwards compat.

    /* istanbul ignore next */
    get child() {
        return this.componentInstance;
    }
}

export const createEmptyVNode = (text = '') => {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
};

export function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode(vnode, deep) {
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        vnode.children,
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
        vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.isCloned = true;
    if (deep && vnode.children) {
        cloned.children = cloneVNodes(vnode.children);
    }

    return cloned;
}

export function cloneVNodes(vnodes, deep) {
    const len = vnodes.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) {
        res[i] = cloneVNode(vnodes[i], deep);
    }
    return res;
}
