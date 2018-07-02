/**
 * @file resolve-slots.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
export function resolveSlots (
  children,
  context
) {
  const slots = {}
  if (!children) {
    return slots
  }

  return children[0] instanceof Node
    ? resolveNodeSlots(children, context)
    : resolveVNodeSlots(children, context)
}

function resolveVNodeSlots (
  children,
  context
) {
  const slots = {}

  const defaultSlot = []
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }

    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
            data && data.slot != null
    ) {
      const name = child.data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children)
      } else {
        slot.push(child)
      }
    } else {
      defaultSlot.push(child)
    }
  }
  // ignore whitespace
  if (!defaultSlot.every(isWhitespace)) {
    slots.default = defaultSlot
  }

  return slots
}

// mip patch: 支持传入 Node 节点
function resolveNodeSlots (
  children,
  context
) {
  const slots = {}

  const defaultSlot = []
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const name = child.getAttribute && child.getAttribute('slot')

    if (name) {
      const slot = (slots[name] || (slots[name] = []))
      if (child.tagName === 'TEMPLATE') {
        slot.push.apply(slot, child.content.childNodes)
      } else {
        slot.push(child)
      }
      child.removeAttribute('slot')
    } else {
      defaultSlot.push(child)
    }
  }

  slots.default = defaultSlot

  return slots
}

function isWhitespace (node) {
  return node.isComment || node.text === ' '
}

export function resolveScopedSlots (
  fns, // see flow/vnode
  res
) {
  res = res || {}
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }
  return res
}
