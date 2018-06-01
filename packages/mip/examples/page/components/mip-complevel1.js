/**
 * @file mip-complevel1
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-complevel1', {
  template: `
    <div class="mip-complevel1">
      <mip-complevel2 :userinfo="userinfo"></mip-complevel2>
      <p @click="changeData">click me to change name:{{userinfo.name}}</p>
      <p @click="changeData2">click me to change name:{{userinfo.name}}</p>
    </div>
  `,
  props: {
    userinfo: {
      default () {
        return {}
      },
      type: Object
    }
  },
  updated () {
  },
  methods: {
    changeData () {
      MIP.setData({
        userInfo: {
          name: 'ckkk'
        }
      })
    },
    changeData2 () {
      MIP.setData({
        userInfo: {
          name: 'ckkk2'
        }
      })
    }
  }
})
