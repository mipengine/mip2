/**
 * @file binding-value.js
 * @author clark-t (clarktanglei@163.com)
 */

import { throttle } from '../../util/fn'
import { createSetDataObject } from './util'

export function addInputListener (add, store) {
  const key = 'm-bind:value'

  const FORM_ELEMENTS = [
    'INPUT',
    'TEXTAREA',
    'SELECT'
  ]

  for (let info of add) {
    let {node, attrs} = info
    if (FORM_ELEMENTS.indexOf(node.tagName) === -1) {
    // if (!FORM_ELEMENTS.includes(node.tagName)) {
      continue
    }

    let expression = attrs[key] && attrs[key].expr

    if (!expression) {
      continue
    }

    const properties = expression.split('.')
    const inputThrottle = throttle(function (e) {
      let obj = createSetDataObject(properties, e.target.value)
      store.set(obj)
    }, 100)
    node.addEventListener('input', inputThrottle)
  }
}

