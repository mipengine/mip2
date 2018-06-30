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
    <h1>This is Page Index Component</h1>
  `,
  mounted () {
    console.log('page index mounted...')

    window.addEventListener('show-page', () => {
      console.log('page index show...')
    })

    window.addEventListener('hide-page', () => {
      console.log('page index hide...')
    })
  }
})
