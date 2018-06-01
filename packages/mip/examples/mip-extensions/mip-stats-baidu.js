/**
 * @file mip-image
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-stats-baidu', {
  template: `
    <div>
      <slot></slot>
    </div>
  `,
  props: {
    src: String,
    alt: String
  }
})
