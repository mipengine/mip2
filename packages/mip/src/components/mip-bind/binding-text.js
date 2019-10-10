/**
 * @file binding-text.js
 * @author clark-t (clarktanglei@163.com)
 */

export const attr = 'm-text'

/**
 * 处理绑定了文本内容的节点
 * 如：<span m-text="'hello' + 'world'"></span>
 *
 * @param {HTMLElement} node 节点
 * @param {string} key 'm-text'，参数占位用
 * @param {string|null} value 新值
 * @param {string|null} oldValue 旧值
 * @return {string|null} 格式化新值
 */
export function bindingText (node, key, value, oldValue) {
  if (value == null) {
    value = ''
  }
  if (value !== oldValue) {
    node.textContent = value
  }
  return value
}

