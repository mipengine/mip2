/**
 * @file mip-complevel2
 * @author sfe
 */
/* global MIP */

MIP.registerVueCustomElement('mip-mask', {
  template: `<div class="mip-mask" :class="{hide: !loading}">
    </div>
  `,
  props: {
    loading: Boolean
  },
  mounted () {
    // console.log('mounted   ', this.loading)
  },
  updated () {
    console.log(this.loading)
  }
})
