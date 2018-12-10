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
    routeConfigWarning('pattern', '*', route)
  } else if (!route.meta) {
    routeConfigWarning('meta', 'meta', route)
  } else if (!route.meta.header) {
    routeConfigWarning('meta.header', 'meta.header', route)
  } else if (!route.meta.view) {
    routeConfigWarning('meta.view', 'meta.view', route)
  }
}

/* istanbul ignore next */
function routeConfigWarning (configName, replaceName, route) {
  console.warn(`检测到一条路由配置中没有设置 ${configName} 选项，MIP 将使用 ${replaceName} 代替。\n`, route)
}
