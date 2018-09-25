/**
 * @file mip-complevel1
 * @author sfe
 */

/* global MIP */
(window.MIP = window.MIP || []).push({
  func: function () {
    MIP.registerVueCustomElement('mip-complevel1', {
      template: `
        <div class="mip-complevel1">
          <h3>This is component mip-complevel1</h3>
          <p class="num-button" @click="setData(1)">1</p>
          <p class="num-button" @click="setData(2)">2</p>
          <p>userInfo.name: {{userInfo.name}}</p>
          <p @click="changeData" class="click-btn">click to change userInfo.name</p>
          <p @click="changeData2" class="click-btn">click to change loading to true</p>
        </div>
      `,
      data: () => {
        return {}
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
          empty_str: 'not empty'
        })
        MIP.setData({
          name: 'nbbaly',
          num: 77,
          list: ['a', 'b', 'c']
        })
      },
      methods: {
        changeData () {
          MIP.setData({
            userInfo: {
              name: 'changed_name'
            }
          })
        },
        changeData2 () {
          MIP.setData({
            loading: true
          })
        },
        setData (num) {
          MIP.setData({
            a: num,
            loading: true
          })
          // console.log('set data {loading:true, a:', num, '}')
          // MIP.setData({
          //   a: num
          // })
          console.log('set data {loading:true, a:', num, '}')
        }
      }
    })
  }
})
