/**
 * @file mip-tree
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-page-data', {
  prerenderAllowed () {
    return true
  },
  template: `
      <h1>This is Page Data Component</h1>
    `,
  mounted () {
    console.log('page data mounted...')

    window.addEventListener('show-page', () => {
      console.log('page data show...')
    })

    window.addEventListener('hide-page', () => {
      console.log('page data hide...')
    })
  }
})
