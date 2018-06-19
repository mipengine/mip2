/**
 * @file mip-complevel1
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-complevel1', {
  template: `
    <div class="mip-complevel1">
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
  created () {
    MIP.setData({
      name: 'nbbaly',
      loading: true,
      list: ['a', 'b', 'c'],
      num: 77
    })
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
