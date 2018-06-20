/**
 * @file mip-complevel2
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-complevel2', {
  template: `<div>
      <p>{{userinfo.name}}</p>
      <p v-if="loading">{{msg}}</p>
      <p>{{list && list[0]}}</p>
      <p>{{num}}</p>
    </div>
  `,
  props: {
    userinfo: {
      default () {
        return {}
      },
      type: Object
    },
    msg: String,
    loading: Boolean,
    list: {
      type: Array
    },
    num: Number
  },
  mounted () {
    console.log(this.userinfo)
    console.log(this.msg)
    console.log(typeof this.loading)
    console.log(this.list)
    console.log(this.num)
  },
  updated () {
    // console.log(this.loading)
    // console.log(typeof this.loading)
  },
  methods: {
  }
})
