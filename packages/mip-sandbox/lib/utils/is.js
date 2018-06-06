/**
 * @file is.js
 * @author clark-t (clarktanglei@163.com)
 */

/**
 * 判断 ast 节点是什么
 *
 * @param {Object} node 节点
 * @param {string|RegExp} name  节点类型
 * @param {Object=} props 节点具备的属性
 * @return {boolean} 判断结果
 */
module.exports = function (node, name, props) {
  if (typeof name === 'string') {
    if (node.type !== name) {
      return false
    }
  } else if (!name.test(node.type)) {
    return false
  }

  if (props) {
    return Object.keys(props).every(function (key) {
      if (Array.isArray(props[key])) {
        return props[key].every(function (val) {
          return node[key] && node[key].length && node[key].indexOf(val) > -1
        })
      }

      return props[key] === node[key]
    })
  }

  return true
}
