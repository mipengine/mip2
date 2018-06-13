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

    this.$emit = function emit (...args) {
      customEmit(element, ...args)
      viewer.eventAction.execute(args[0], element, args[1])
      this.__proto__ && this.__proto__.$emit.call(this, ...args) // eslint-disable-line no-proto
    }
  }
  ComponentDefinition.beforeCreate = [].concat(ComponentDefinition.beforeCreate || [], beforeCreate)

  // let elementOriginalChildren = [].slice.call(element.childNodes).map(node => node.cloneNode(true)); // clone hack due to IE compatibility

  if (element && element.tagName.toLowerCase() === 'mip-script') {
    element.__innerHTML = `<div>${element.innerHTML}</div>`
  }
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
