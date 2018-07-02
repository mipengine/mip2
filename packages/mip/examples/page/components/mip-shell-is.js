/**
 * @file 极速服务 shell （测试）
 * @author wangyisheng@baidu.com (wangyisheng)
 */

class MipShellIS extends window.MIP.builtinComponents.MipShell {
  constructor (...args) {
    super(...args)

    this.alwaysReadConfigOnLoad = false
    this.transitionContainsHeader = false
  }

  processShellConfig (shellConfig) {
    // Set default data
    shellConfig.routes.forEach(routeConfig => {
      routeConfig.meta.header.title = '极速服务'
      routeConfig.meta.header.logo = 'https://www.baidu.com/favicon.ico'
      routeConfig.meta.header.bouncy = false
    })

    let isId = shellConfig.isId
    console.log('Simulate async request with isId:', isId)
    setTimeout(() => {
      shellConfig.routes[0].meta.header.title = '蓝犀牛搬家'
      shellConfig.routes[0].meta.header.logo = 'http://boscdn.bpc.baidu.com/assets/mip2/lanxiniu/logo.png'
      shellConfig.routes[0].meta.header.buttonGroup = [
        {
          name: 'share',
          text: '分享'
        },
        {
          name: 'indexPage',
          text: '首页'
        },
        {
          name: 'about',
          text: '关于蓝犀牛'
        },
        {
          name: 'cancel',
          text: '取消'
        }
      ]
      shellConfig.routes[1].meta.header.title = '红犀牛搬家'

      this.updateShellConfig(shellConfig)

      this.refreshShell({pageId: window.MIP.viewer.page.pageId, asyncRefresh: true})
    }, 1000)
  }

  handleShellCustomButton (buttonName) {
    if (buttonName === 'share') {
      console.log('click on share')
      this.toggleDropdown(false)
    } else if (buttonName === 'indexPage') {
      console.log('click on indexPage')
      this.toggleDropdown(false)
    } else if (buttonName === 'about') {
      console.log('click on about')
      this.toggleDropdown(false)
    }
  }
}

window.MIP.registerCustomElement('mip-shell-is', MipShellIS)
