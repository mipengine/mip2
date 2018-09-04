/**
 * @file create vue instance
 * @author sfe
 */

/* globals MIP */

import {getPropsData} from './props'
import {toArray, camelize} from './helpers'
import {customEmit} from '../../util/custom-event'
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

function structurizeToArr (key, val, level = key) {
  let match = key.match(/([^[\]]+)\[([^\]]+)\]/)
  if (match && match.length) {
    level = level.replace(/\[[^\]]+\]$/, '')
    let func = new Function(`with(this){try {return ${level}} catch (e) {}}`) // eslint-disable-line
    let pos = +match[2]
    let arr
    try {
      arr = JSON.parse(JSON.stringify(func.call(window.m)))
      arr[pos] && (arr[pos] = val)
    } catch (e) {
    }
    return {[match[1]]: arr}
  }
  return {[key]: val}
}

function structurizeToObj (key, val) {
  if (key.indexOf('.') === -1) {
    return structurizeToArr(key, val)
  }
  let ks = key.split('.').reverse()
  let name = ks.shift()
  return ks.reduce((obj, key, index, arr) => {
    if (key.indexOf('[') !== -1) {
      return structurizeToArr(key, obj, arr.filter((item, i) => i >= index).reverse().join('.'))
    }
    return {[key]: obj}
  }, {[name]: val})
}

function getModifierSyncEvents (node) {
  let attrValues = node.attrValues
  if (!attrValues) return {}
  return Object.keys(attrValues)
    .filter(key => attrValues[key].sync)
    .reduce((obj, key) => {
      let name = attrValues[key].sync
      obj['update:' + camelize(key)] = function (val) {
        MIP.setData(structurizeToObj(name, val))
      }
      return obj
    }, {})
}

/**
 * Create new Vue instance
 *
 * @param {HTMLElement} element
 * @param {Vue} Vue
 * @param {Object} componentDefinition
 * @param {Object} props
 */
export default function createVueInstance (
  element,
  Vue,
  componentDefinition,
  props
) {
  let ComponentDefinition = Vue.util.extend({}, componentDefinition)
  let modifierSyncEvents = getModifierSyncEvents(element)
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
          props: this.reactiveProps,
          on: modifierSyncEvents
        },
        nodeSlots
      )
    }
  }

  return new Vue(rootElement)
}
