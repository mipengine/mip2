/**
 * @file mip-tree
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-page-tree', {
  prerenderAllowed () {
    return true
  },
  template: `
      <h1>This is Page Tree Component</h1>
    `,
  mounted () {
    console.log('page tree mounted...')

    window.addEventListener('show-page', () => {
      console.log('page tree show...')
    })

    window.addEventListener('hide-page', () => {
      console.log('page tree hide...')
    })
  }
})
