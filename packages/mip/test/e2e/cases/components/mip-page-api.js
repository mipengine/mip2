/* global MIP */
MIP.registerVueCustomElement('mip-page-api', {
  prerenderAllowed () {
    return true
  },
  template: `
    <div>
      <h1 class="message-receiver">{{message}}</h1>
    </div>
  `,
  data () {
    return {
      message: 'Hello everyone!'
    }
  },
  methods: {
    log () {
      console.log('log...')
    }
  },
  mounted () {
    window.addEventListener('testEvent', e => {
      let data = e.detail ? e.detail[0] : {}
      this.message = data.message
    })
  }
})
