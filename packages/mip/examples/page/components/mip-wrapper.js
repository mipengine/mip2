MIP.registerVueCustomElement('mip-wrapper', {
    template: `
    <div class="insur-app">
        <slot></slot>
    </div>
    `,
    prerenderAllowed () {
      return true
    }
})
