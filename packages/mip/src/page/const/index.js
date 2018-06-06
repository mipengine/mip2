/**
 * @file const
 * @author wangyisheng@baidu.com (wangyisheng)
 */

export const MIP_IFRAME_CONTAINER = 'mip-page__iframe'
export const DEFAULT_SHELL_CONFIG = {
  header: {
    title: '',
    logo: '',
    xiongzhang: false,
    buttonGroup: [],
    show: false
  },
  view: {
    isIndex: false,
    transition: {
      mode: 'slide',
      effect: 'slide-left',
      alwaysBackPages: []
    }
  },
  footer: {}
}

export const MESSAGE_APPSHELL_EVENT = 'appshell-event'
export const MESSAGE_ROUTER_PUSH = 'router-push'
export const MESSAGE_ROUTER_REPLACE = 'router-replace'

export const XIONGZHANG_MORE_BUTTON_GROUP = [
  {
    name: 'xiongzhang-forward',
    text: '转发'
  },
  {
    name: 'xiongzhang-main',
    text: '服务首页'
  },
  {
    name: 'xiongzhang-about',
    text: '关于蓝犀牛'
  },
  {
    name: 'xiongzhang-cancel',
    text: '取消'
  }
]
