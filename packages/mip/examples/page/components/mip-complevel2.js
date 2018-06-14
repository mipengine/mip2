/**
 * @file mip-complevel2
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-complevel2', {
  template: `<div>
      <p>{{userinfo.name}}</p>
      <p>{{msg}}</p>
    </div>
  `,
  props: {
    userinfo: {
      default () {
        return {}
      },
      type: Object
    },
    msg: String
  },
  mounted () {
    console.log(this.msg)
  },
  updated () {
    // console.log(this.userinfo)
  },
  methods: {
  }
})
