/**
 * @file mip-global
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-global', {
  template: `
    <span>mip-global</span>
  `,
  firstInviewCallback () {
    console.log('hello this is mip-global')
  }
})
