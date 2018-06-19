/**
 * @file 极速服务 shell （测试）
 * @author wangyisheng@baidu.com (wangyisheng)
 */

class MipShellIS extends window.MIP.builtinComponents.MipShell {
  processShellConfig (shellConfig) {
    if (shellConfig.length === 0) {
      return
    }

    // Set default data
    shellConfig.forEach(routeConfig => {
      routeConfig.meta.header.title = '极速服务'
      routeConfig.meta.header.logo = 'https://www.baidu.com/favicon.ico'
    })

    let isId = shellConfig[0].meta.isId
    console.log('Simulate async request with isId:', isId)
    setTimeout(() => {
      shellConfig.forEach(routeConfig => {
        routeConfig.meta.header.title = '蓝犀牛'
        routeConfig.meta.header.logo = 'http://boscdn.bpc.baidu.com/assets/mip2/lanxiniu/logo.png'
        routeConfig.meta.header.buttonGroup = [
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
      })
      this.updateShellConfig(shellConfig)

      this.refreshShell({pageId: window.MIP.viewer.page.pageId})
    }, 1000)
  }

  alwaysRefreshOnLoad () {
    return false
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
