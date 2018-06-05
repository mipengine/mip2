/**
 * @file mip-test.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */

MIP.registerVueCustomElement('mip-b', {
  template: `
    <div @click="onClick"> haha b </div>
  `,
  created () {
    console.log('b: created')
  },
  methods: {
    onClick () {
      console.log('onClick')
      MIP.viewer.eventAction.execute('custom_event', null, {
        form: 'b'
      })
    }
  },
  connectedCallback(el) {
    MIP.viewer.eventAction.execute('custom_event', el, {
      form: 'b'
    })

  }
})
