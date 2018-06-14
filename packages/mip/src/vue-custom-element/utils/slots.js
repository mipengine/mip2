/**
 * @file slots.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

import {toArray} from './helpers'

// Get attributes of given node
export function getAttributes (children) {
  const attributes = {}

  toArray(children.attributes).forEach(attribute => {
    attributes[attribute.nodeName === 'vue-slot' ? 'slot' : attribute.nodeName] = attribute.nodeValue
  })

  return attributes
}

/**
 * Get childNodes of an element
 * @param {HTMLElement} element
 * @returns {NodeList}
 */
export function getChildNodes (element) {
  if (element.childNodes.length) return element.childNodes
  if (element.content && element.content.childNodes && element.content.childNodes.length) {
    return element.content.childNodes
  }

  const placeholder = document.createElement('div')

  placeholder.innerHTML = element.innerHTML

  return placeholder.childNodes
}

/**
 * Get Vue element representing a template for use with slots
 * @param {Function} createElement - createElement function from vm
 * @param {HTMLElement} element - template element
 * @param {Object} elementOptions
 * @returns {VNode}
 */
export function templateElement (createElement, element, elementOptions) {
  const templateChildren = getChildNodes(element)

  const vueTemplateChildren = toArray(templateChildren).map(child => {
    // children passed to create element can be a string
    // https://vuejs.org/v2/guide/render-function#createElement-Arguments
    if (child.nodeName === '#text') return child.nodeValue

    return createElement(child.tagName, {
      attrs: getAttributes(child),
      domProps: {
        innerHTML: child.innerHTML
      }
    })
  })

  elementOptions.slot = element.id

  return createElement('template', elementOptions, vueTemplateChildren)
}

// Helper utility returning slots for render function
export function getSlots (innerHTML, createElement, createText) {
  let emptyNode = document.createElement('div')
  emptyNode.innerHTML = innerHTML
  let children = emptyNode.childNodes
  const slots = []
  toArray(children).forEach(child => {
    if (child.nodeName === '#text') {
      if (child.nodeValue.trim()) {
        slots.push(createText(child.nodeValue))
      }
    } else if (child.nodeName !== '#comment') {
      const attributes = getAttributes(child)
      const elementOptions = {
        attrs: attributes,
        domProps: {
          innerHTML: child.innerHTML
        }
      }

      if (attributes.slot) {
        elementOptions.slot = attributes.slot
        attributes.slot = undefined
      }

      if (child.tagName !== 'SCRIPT') {
        const slotVueElement = (child.tagName === 'TEMPLATE')
          ? templateElement(createElement, child, elementOptions)
          : createElement(child.tagName, elementOptions)
        slots.push(slotVueElement)
      }
    }
  })

  return slots
}
