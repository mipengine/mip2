/**
 * @file create vue instance
 * @author sfe
 */

import {reactiveProps} from './props'
import {customEmit} from '../../util/custom-event'
import viewer from '../../viewer'

/**
 * 获取 element 的 slot content，并将 slot content element 从父元素中移除
 * @param {HTMLElement} element slot content 的父元素
 * @param {[Node]>}  Node 数组
 */
function getNodeSlots (element) {
  let nodeSlots = [...element.childNodes]
    .map(node => {
      element.removeChild(node)
      return node
    })

  return nodeSlots
}

/**
 * Create new Vue instance
 *
 * @param {!HTMLElement} element
 * @param {Vue} Vue
 * @param {!Object} componentDefinition
 * @param {string[]} camelizedProps
 * @param {!Object} propsData
 */
export default function createVueInstance (
  element,
  Vue,
  componentDefinition,
  camelizedProps,
  propsData
) {
  const definition = Vue.util.extend({}, componentDefinition)

  // Auto event handling based on $emit
  function beforeCreate () { // eslint-disable-line no-inner-declarations
    // 将 element 挂到 vue 下方便使用
    this.$element = element

    this.$emit = function emit (eventName, ...args) {
      customEmit(element, eventName, ...args)
      viewer.eventAction.execute(eventName, element, ...args)
      this.__proto__ && this.__proto__.$emit.call(this, eventName, ...args) // eslint-disable-line no-proto
    }

    this.$on = function on (eventName, callback) {
      this.__proto__ && this.__proto__.$on.call(this, eventName, callback) // eslint-disable-line no-proto
      element.customElement.addEventAction(eventName, callback)
    }
  }
  definition.beforeCreate = [].concat(definition.beforeCreate || [], beforeCreate)

  let nodeSlots = getNodeSlots(element)

  element.innerHTML = '<div></div>'

  let rootElement = {
    propsData,
    props: camelizedProps,
    computed: {
      reactiveProps () {
        let reactivePropsList = {}
        camelizedProps.forEach(prop => {
          reactivePropsList[prop] = this[prop]
        })
        return reactivePropsList
      }
    },
    el: element.children[0],
    render (createElement) {
      return createElement(
        definition,
        {
          props: this.reactiveProps
        },
        nodeSlots
      )
    }
  }

  reactiveProps(element, camelizedProps)

  return new Vue(rootElement)
}
