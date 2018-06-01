/**
 * @file 侧边栏组件
 *
 * @author wangpei07@baidu.com, liangjiaying
 * @version 1.0
 * @copyright 2016 Baidu.com, Inc. All Rights Reserved
 */
/* global MIP */
(function () {
  let template = `
      <div></DIV>
  `

  MIP.registerVueCustomElement('mip-sidebar', {
    props: {
      id: String,
      layout: String,
      side: String
    },
    template: template
  })
})()
