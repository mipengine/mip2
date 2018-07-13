/**
 * @file mip-complevel1
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-complevel1', {
  template: `
    <div class="mip-complevel1">
      <h3>This is component mip-complevel1</h3>
      <mip-complevel2 :user-info="userInfo"></mip-complevel2>
      <p @click="changeData" class="click-btn">click to change userInfo.name</p>
      <p @click="changeData2" class="click-btn">click to change loading to true</p>
    </div>
  `,
  data: () => {
    return {
    }
  },
  props: {
    userInfo: {
      default () {
        return {}
      },
      type: Object
    }
  },
  created () {
    MIP.setData({
      name: 'nbbaly',
      num: 77,
      list: ['a', 'b', 'c']
      // list: [
      //   {
      //     name: 'Jack'
      //   },
      //   {
      //     name: 'Mike'
      //   },
      //   {
      //     name: 'Jenny'
      //   }
      // ]
    })
  },
  updated () {
  },
  methods: {
    changeData () {
      MIP.setData({
        '#userInfo': {
          name: 'a'
        }
      })
    },
    changeData2 () {
      MIP.setData({
        loading: true
      })
    }
  }
})
