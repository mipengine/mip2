/**
<<<<<<< HEAD
 * @file mip-mask
=======
 * @file mip-complevel2
>>>>>>> 68540b65a36f5fd54930fdc9ae0e99c4a625022f
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
<<<<<<< HEAD
    console.log('mip-mask updated:loading', this.loading)
=======
    console.log(this.loading)
>>>>>>> 68540b65a36f5fd54930fdc9ae0e99c4a625022f
  }
})
