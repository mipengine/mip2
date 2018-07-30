/**
 * @file mip-tree
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-page-index', {
  prerenderAllowed () {
    return true
  },
  template: `
    <div>
      <h1>This is Page Index Component</h1>
      <mip-fixed type="bottom">
        <div @click="log">Go to Top</div>
      </mip-fixed>
    </div>
  `,
  methods: {
    log () {
      console.log('log...')
    }
  },
  mounted () {
    MIP.viewer.fixedElement.init()
  }
})
