/**
 * @file props.js
 * @author sfe-sy (sfe-sy@baidu.com)
 */

// If we get DOM node of element we could use it like this:
// document.querySelector('widget-vue1').prop1 < --get prop
// document.querySelector('widget-vue1').prop1 = 'new Value' < --set prop
export function reactiveProps (element, props) {
  // Handle param attributes
  props.forEach((name, index) => {
    Object.defineProperty(element, name, {
      get () {
        if (element.customElement && element.customElement.vm) {
          return element.customElement.vm[name]
        }
      },
      set (value) {
        let vm = element.customElement && element.customElement.vm
        if (vm) {
          vm[name] = value
        }
      }
    })
  })
}
