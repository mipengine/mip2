/**
 * @file vuetify entry
 * @author sekiyika(pengxing@baidu.com)
 */

/* global MIP */

import Vuetify from 'vuetify'

import 'vuetify/src/stylus/main.styl'

MIP.Vue.use(Vuetify)

class Vue {
  static use (Vuetify, options) {
    let {components, directives} = options
    Object.keys(components).forEach(key => {
      let component = components[key]
      if (component.name && component.name.indexOf('v-') === 0) {
        MIP.registerVueCustomElement(component.name.replace('v-', 'mip-v-'), component)
      }
    })

    console.log(directives)
  }
}

Vuetify(Vue)
