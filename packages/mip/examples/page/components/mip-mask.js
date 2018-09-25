/**
 * @file mip-mask
 * @author sfe
 */
/* global MIP */
(window.MIP = window.MIP || []).push({
  func: function () {
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
        console.log('mip-mask updated:loading', this.loading)
      }
    })
  }
})
