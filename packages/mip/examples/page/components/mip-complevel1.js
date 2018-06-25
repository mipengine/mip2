/**
 * @file mip-complevel1
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-complevel1', {
  template: `
    <div class="mip-complevel1">
      <mip-complevel2 :userinfo="userinfo" :style="styleObj" style="display:flex"></mip-complevel2>
      <p @click="changeData">click to change userinfo</p>
      <p class="test" v-bind:class="{active: active}">1</p>
    </div>
  `,
  data: () => {
    return {
      active: true,
      styleObj: {
        display: 'block'
      }
    }
  },
  props: {
    userinfo: {
      default () {
        return {}
      },
      type: Object
    }
  },
  created () {
    MIP.setData({
      name: 'nbbaly',
      // loading: true,
      list: ['a', 'b', 'c'],
      num: 77
    })
  },
  updated () {
  },
  methods: {
    changeData () {
      MIP.setData({
        userinfo: {
          name: 'ckkk'
        }
      })
    },
    changeData2 () {
      MIP.setData({
        userinfo: {
          name: 'ckkk2'
        }
      })
    }
  }
})
