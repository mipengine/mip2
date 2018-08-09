/* global MIP */
MIP.registerVueCustomElement('mip-page-index', {
  prerenderAllowed () {
    return true
  },
  template: `
    <div>
      <h1 class="message-receiver">{{message}}</h1>
      <mip-fixed type="bottom">
        <div @click="log">Go to Top</div>
      </mip-fixed>
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
