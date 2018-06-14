/**
 * @file const
 * @author wangyisheng@baidu.com (wangyisheng)
 */

export const MIP_IFRAME_CONTAINER = 'mip-page__iframe'
// delete me
export const DEFAULT_SHELL_CONFIG = {
  header: {
    title: '',
    logo: '',
    xiongzhang: false,
    buttonGroup: [],
    show: false,
    bouncy: true
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
export const MESSAGE_APPSHELL_HEADER_SLIDE_UP = 'appshell-header-slide-up'
export const MESSAGE_APPSHELL_HEADER_SLIDE_DOWN = 'appshell-header-slide-down'
export const MESSAGE_REGISTER_GLOBAL_COMPONENT = 'register-global-component'
export const MESSAGE_MIP_SHELL_CONFIG = 'mip-shell-config'

export const NON_EXISTS_PAGE_ID = 'non-exists-page-id'
export const SCROLL_TO_ANCHOR_CUSTOM_EVENT = 'scroll-to-anchor'
// export const XIONGZHANG_MORE_BUTTON_GROUP = [
//   {
//     name: 'xiongzhang-forward',
//     text: '转发'
//   },
//   {
//     name: 'xiongzhang-main',
//     text: '服务首页'
//   },
//   {
//     name: 'xiongzhang-about',
//     text: '关于蓝犀牛'
//   },
//   {
//     name: 'xiongzhang-cancel',
//     text: '取消'
//   }
// ]

export const BUILT_IN_COMPONENTS = [
  'mip-data',
  'mip-carousel',
  'mip-iframe',
  'mip-img',
  'mip-pix',
  'mip-video'
]
