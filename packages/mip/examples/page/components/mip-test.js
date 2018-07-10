/**
 * @file mip-test
 * @author sfe
 */

/* global MIP */
/* global MIP_ROUTER */

MIP.registerVueCustomElement('mip-test', {
  template: `
    <div>
    <p>{{demo.name}}</p>
    <p @click="back">go back</p>
  </div>
  `,
  props: {
    demo: {
      default () {
        return {}
      },
      type: Object
    }
  },
  mounted () {
    setTimeout(() => {
      try {
        MIP.setData({
          'demo': {
            name: 'ck2'
          }
        })
      } catch (e) {
        window.alert(e)
      }
    }, 1000)
  },
  methods: {
    back () {
      try {
        MIP.setData({
          '#demo': {
            name: Date.now() + ''
          }
        })
        window.MIP.viewer.page.router.back()
      } catch (e) {
        window.alert(e)
      }
    }
  },

  prerenderAllowed () {
    return true
  }
})
