/**
 * @file MIP Shell utils
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/**
 * convert pattern to regexp
 * @param {string} pattern pattern string
 * @return {Regexp} regexp
 */
export function convertPatternToRegexp (pattern) {
  if (pattern === '*') {
    return /.*/
  }
  return new RegExp(pattern)
}

/**
 * 检查 MIP Shell Config 中的 routes 数组的每个元素是否把所有配置项都配齐了。
 * @param {*} route
 */
export /* istanbul ignore next */ function checkRouteConfig (route) {
  if (!route) {
    console.warn('检测到空的路由配置，MIP 将跳过这条配置')
  } else if (!route.pattern) {
    console.warn('检测到一条路由配置中没有设置 `pattern` 选项，MIP 将使用 * 代替。')
    console.warn(route)
  } else if (!route.meta) {
    console.warn('检测到一条路由配置中没有设置 `meta` 选项，MIP 将使用默认的 `meta` 配置代替。')
    console.warn(route)
  } else if (!route.meta.header) {
    console.warn('检测到一条路由配置中没有设置 `meta.header` 选项，MIP 将使用默认的 `meta.header` 配置代替。')
    console.warn(route)
  } else if (!route.meta.view) {
    console.warn('检测到一条路由配置中没有设置 `meta.view` 选项，MIP 将使用默认的 `meta.view` 配置代替。')
    console.warn(route)
  }
}
