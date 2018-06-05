/**
 * @file mip-test.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

/* global MIP */

MIP.registerVueCustomElement('mip-a', {
  template: `
    <div >
      haha a

      <hr>

      <span @click="onClick">click me</span>
    </div>
  `,
  created () {
    this.$element.customElement.addEventAction('custom_event2', function (event /* 对应的事件对象 */ , str /* 事件参数 */ ) {
      console.log('custom_event2: ', str); // undefined or 'test_button' or 'test_button1'
    });
  },
  connectedCallback(element) {
    element.customElement.addEventAction('custom_event1', function (event /* 对应的事件对象 */ , str /* 事件参数 */ ) {
      console.log('custom_event1: ', str); // undefined or 'test_button' or 'test_button1'
    });
  },
  methods: {
    onClick (evt) {
      console.log('tap')
    }
  }
})
