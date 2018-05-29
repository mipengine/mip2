/**
 * @file url util
 * @author wangyisheng@baidu.com (wangyisheng)
 */

export function getPath(href) {
    if (!href) {
        return location.pathname + location.search;
    }

    return href.replace(/^http(s?):\/\/[^\/]+/, '');
}
