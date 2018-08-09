/**
 * @file mip-complevel2
 * @author sfe
 */

/* global MIP */
MIP.registerVueCustomElement('mip-complevel2', {
  template: `<div class="mip-complevel2">
      <h3>This is component mip-complevel2</h3>
      <p v-if="userInfo.name">userInfo.name : {{userInfo.name}}</p>
      <p v-if="msg">string 'msg' show if loading=true: <span v-if="loading">{{msg}}</span></p>
      <p v-if="list && list.length">list:</p>
      <ul v-if="list && list.length">
        <li>{{list[0]}}</li>
        <li>{{list[1]}}</li>
        <li>{{list[2]}}</li>
      </ul>
      <p v-if="num">num: {{num}}</p>
    </div>
  `,
  props: {
    userInfo: {
      default () {
        return {}
      },
      type: Object
    },
    msg: String,
    loading: Boolean,
    list: {
      default () {
        return []
      },
      type: Array
    },
    num: Number
  },
  mounted () {
    MIP.watch('a', function (newVal) {
      console.log(newVal)
      MIP.setData({
        loading: false
      })
      console.log(MIP.getData('loading'))
    })
    MIP.watch('loading', function (newVal) {
      console.log(MIP.getData('loading'))
    })
  }
})
