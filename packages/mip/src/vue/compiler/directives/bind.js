/**
 * @file bind.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

export default function bind (el, dir) {
  el.wrapData = code => `_b(${code},'${el.tag}',${dir.value},${
  dir.modifiers && dir.modifiers.prop ? 'true' : 'false'
}${
  dir.modifiers && dir.modifiers.sync ? ',true' : ''
})`
}
