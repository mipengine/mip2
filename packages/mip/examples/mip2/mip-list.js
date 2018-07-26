/**
 * @file mip-list demo for compatible mip 1.0
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */
function mockMustacheRender (template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, item => data[item.replace(/[{}]/ig, '')])
}

MIP.registerVueCustomElement('mip-list', {
  template: `
    <div class="mip-list-wrap">
      <div
        class="mip-tr"
        v-for="(item, index) in items"
        :key="index"
        v-html="tdContents[index]"
      ></div>
      <slot></slot>
    </div>
  `,
  props: ['items'],
  data () {
    return {
      tdContents: []
    }
  },

  mounted () {
    let me = this
    let templateStr = ''
    let template = this.$el.querySelector('[type="mip-mustache"]')

    if (template) {
      templateStr = template.innerHTML
      template.remove()
    }

    if (templateStr) {
      this.items.forEach((item, index) => {
        // This place, you can use real mustache lib
        let content = mockMustacheRender(templateStr, item)
        MIP.Vue.set(me.tdContents, index, content)
      })
    }
  }
})
