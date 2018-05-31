/**
 * @file is-async-placeholder.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

export function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}
