/**
 * @file create vue instance
 * @author sfe
 */

import {getPropsData, reactiveProps} from './props'
import {getSlots} from './slots'
import {customEmit} from './custom-event'
import viewer from '../../viewer'

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
  ComponentDefinition.beforeCreate = [].concat(ComponentDefinition.beforeCreate || [], beforeCreate)

  // let elementOriginalChildren = [].slice.call(element.childNodes).map(node => node.cloneNode(true)); // clone hack due to IE compatibility

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
        getSlots(element.__innerHTML, createElement, this._v.bind(this))
      )
    }
  }

  reactiveProps(element, props)

  return new Vue(rootElement)
}
