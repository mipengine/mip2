/**
 * @file const
 * @author wangyisheng@baidu.com (wangyisheng)
 */

export const MIP_CONTAINER_ID = 'mip-router__app';// deprecated
export const MIP_VIEW_ID = 'mip-router__view';// deprecated
export const MIP_IFRAME_CONTAINER = 'mip-page__iframe';
export const MIP_CONTENT_IGNORE_TAG_LIST = [
    'mip-shell',
    'iframe'
];
export const MIP_ERROR_ROUTE_PATH = '/mip-error';
export const DEFAULT_SHELL_CONFIG = {
    header: {
        title: '',
        logo: '',
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
};

export const MESSAGE_APPSHELL_REFRESH = 'appshell-refresh';
export const MESSAGE_APPSHELL_EVENT = 'appshell-event';
export const MESSAGE_ROUTER_PUSH = 'router-push';
export const MESSAGE_ROUTER_REPLACE = 'router-replace';