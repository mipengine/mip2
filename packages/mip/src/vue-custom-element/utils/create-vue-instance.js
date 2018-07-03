/**
 * @file create vue instance
 * @author sfe
 */

import {getPropsData, reactiveProps} from './props'
import {toArray} from './helpers'
import {customEmit} from './custom-event'
import viewer from '../../viewer'

/**
 * 获取 element 的 slot content，并将 slot content element 从父元素中移除
 * @param {HTMLElement} element slot content 的父元素
 * @param {[Node]>}  Node 数组
 */
function getNodeSlots (element) {
  let nodeSlots = toArray(element.childNodes)
    .map(node => {
      element.removeChild(node)
      return node
    })

  return nodeSlots
}

export default function createVueInstance (
  element,
  {Vue},
  componentDefinition,
  props
) {
  let ComponentDefinition = Vue.util.extend({}, componentDefinition)
  let propsData = getPropsData(element, ComponentDefinition, props)

  // Auto event handling based on $emit
  function beforeCreate () { // eslint-disable-line no-inner-declarations
    // 将 element 挂到 vue 下方便使用
    this.$element = element

    this.$emit = function emit (...args) {
      customEmit(element, ...args)
      viewer.eventAction.execute(args[0], element, args[1])
      this.__proto__ && this.__proto__.$emit.call(this, ...args) // eslint-disable-line no-proto
    }
  }
  ComponentDefinition.beforeCreate = [].concat(ComponentDefinition.beforeCreate || [], beforeCreate)

  let nodeSlots = getNodeSlots(element)

  element.innerHTML = '<div></div>'

  let rootElement = {
    propsData,
    props: props.camelCase,
    computed: {
      reactiveProps () {
        let reactivePropsList = {}
        props.camelCase.forEach(prop => {
          reactivePropsList[prop] = this[prop]
        })

        return reactivePropsList
      }
    },
    el: element.children[0],
    render (createElement) {
      return createElement(
        ComponentDefinition,
        {
          props: this.reactiveProps
        },
        nodeSlots
      )
    }
  }

  reactiveProps(element, props)

  return new Vue(rootElement)
}
