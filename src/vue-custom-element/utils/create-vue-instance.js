/**
 * @file create vue instance
 * @author sfe
 */

import {getPropsData, reactiveProps} from './props';
import {getSlots} from './slots';
import {customEmit} from './custom-event';
import viewer from '../../viewer';

export default function createVueInstance(
    element,
    {Vue},
    componentDefinition,
    props
) {
    let ComponentDefinition = Vue.util.extend({}, componentDefinition);
    let propsData = getPropsData(element, ComponentDefinition, props);

    // for mip-template syntax
    // @TODO: 这里有个 bug， 如果 Vue 不带 compiler，那这个 template 没法用，只能用 render 方法
    if (element && element.tagName.toLowerCase() === 'mip-template') {
        ComponentDefinition.template = `<div class="mip-template-wrap">${element.innerHTML}</div>`;
    }

    // Auto event handling based on $emit
    function beforeCreate() { // eslint-disable-line no-inner-declarations
        this.$emit = function emit(...args) {
            customEmit(element, ...args);
            viewer.eventAction.execute(args[0], element, args[1]);
            this.__proto__ && this.__proto__.$emit.call(this, ...args); // eslint-disable-line no-proto
        };
    }
    ComponentDefinition.beforeCreate = [].concat(ComponentDefinition.beforeCreate || [], beforeCreate);

    // let elementOriginalChildren = [].slice.call(element.childNodes).map(node => node.cloneNode(true)); // clone hack due to IE compatibility

    element.innerHTML = '<div></div>';

    let rootElement = {
        propsData,
        props: props.camelCase,
        computed: {
            reactiveProps() {
                let reactivePropsList = {};
                props.camelCase.forEach(prop => {
                    reactivePropsList[prop] = this[prop];
                });

                return reactivePropsList;
            }
        },
        el: element.children[0],
        render(createElement) {
            return createElement(
                ComponentDefinition,
                {
                    props: this.reactiveProps
                },
                getSlots(element.__innerHTML, createElement)
            );
        }
    };

    reactiveProps(element, props);

    return new Vue(rootElement);
}
