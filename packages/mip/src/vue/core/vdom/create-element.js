/**
 * @file create-element.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

import config from '../config'
import VNode, {createEmptyVNode} from './vnode'
import {createComponent} from './create-component'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }

  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }

  return $createElement(context, tag, data, children, normalizationType)
}

export function $createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  let childNodes
  if (Array.isArray(children) && children[0] instanceof Node) {
    childNodes = children
  }

  if (isDef(data) && isDef((data).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
            'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }

  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }

  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }

  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
        isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    warn(
      'Avoid using non-primitive value as key, ' +
            'use string/number value instead.',
      context
    )
  }

  // support single function children as default scoped slot
  if (Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {}
    data.scopedSlots = {
      'default': children[0]
    }
    children.length = 0
  }

  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }

  let vnode
  let ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag, childNodes)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children, undefined, childNodes)
  }
  if (isDef(vnode)) {
    if (ns) {
      applyNS(vnode, ns)
    }

    return vnode
  }
  return createEmptyVNode()
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }

  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force))) {
        applyNS(child, ns, force)
      }
    }
  }
}
