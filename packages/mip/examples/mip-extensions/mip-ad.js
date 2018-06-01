/**
 * @file mip-image
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-ad', {
  template: `
    <div>
      <slot></slot>
    </div>
  `,
  props: {
    name: String
  }
})
