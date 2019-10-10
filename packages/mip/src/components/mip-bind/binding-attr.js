/**
 * @file binding-attr.js
 * @author clark-t (clarktanglei@163.com)
 */

const prefix = 'm-bind:'
const prefixLen = prefix.length

/**
 * 判断属性是否为绑定属性，即以 m-bind: 为前缀
 *
 * @param {string} key 属性名
 * @return {boolean} 判断结果
 */
export function isBindingAttr (key) {
  return key.length > prefixLen && key.slice(0, prefixLen) === prefix
}

const BOOLEAN_ATTRS = [
  'checked',
  'selected',
  'autofocus',
  'controls',
  'disabled',
  'hidden',
  'multiple',
  'readonly'
]

/**
 * 处理绑定到一般属性的节点
 *
 * @param {HTMLElement} node 节点
 * @param {string} key 属性名
 * @param {string|Object|Array|null} newVal 新值
 * @param {Object|undefined} oldVal 旧值
 */
export function bindingAttr (node, key, value, oldValue) {
  /* istanbul ignore if */
  if (!isBindingAttr(key)) {
    return
  }

  let attr = key.slice(prefixLen)

  // HTMLElement 的属性值都是字符串，因此对于 Object 类型的数据需要序列化成字符串
  let prop = typeof value === 'object' ? JSON.stringify(value) : value
  if (prop === oldValue) {
    return prop
  }

  if (prop === '' || prop === undefined) {
    node.removeAttribute(attr)
  } else {
    node.setAttribute(attr, prop)
  }

  // 对于 value 和一些 boolean attrs，
  // 在通过 node.setAttribute/removeAttribute 设置属性之后，
  // 还需要手动去给 node 设置他们的值
  if (attr === 'value') {
    node[attr] = prop
  } else if (BOOLEAN_ATTRS.indexOf(attr) > -1) {
    node[attr] = !!prop
  }
  return prop
}
