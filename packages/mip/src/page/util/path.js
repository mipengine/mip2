/**
 * @file path utils
 * @author panyuqi@baidu.com (panyuqi)
 * @author wangyisheng@baidu.com (wangyisheng)
 */

export function resolvePath (relative, base, append) {
  const firstChar = relative.charAt(0)
  if (firstChar === '/') {
    return relative
  }

  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }

  const stack = base.split('/')

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop()
  }

  // resolve relative path
  const segments = relative.replace(/^\//, '').split('/')
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (segment === '..') {
      stack.pop()
    } else if (segment !== '.') {
      stack.push(segment)
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('')
  }

  return stack.join('/')
}

export function parsePath (path) {
  let hash = ''
  let query = ''

  const hashIndex = path.indexOf('#')
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex)
    path = path.slice(0, hashIndex)
  }

  const queryIndex = path.indexOf('?')
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
  }

  return {
    path,
    query,
    hash
  }
}

export function getLocation () {
  return window.location.href
}

// http://www.hello-world.com/mip => //www-hello--world-com.mipcdn.com/c/www.hello-world.com/mip
export function getCDNPath (path) {
  if (path.indexOf('mipcdn.com') !== -1 || path.indexOf('http') !== 0) {
    return path
  }

  // http://www.hello-world.com => //www-hello--world-com.mipcdn.com
  let tmpPath = path.replace(/^http(s?):\/\//, '')
  let prefix = '//' + tmpPath.replace(/\/.+$/, '').replace(/-/g, '--').replace(/\./g, '-') + '.mipcdn.com'
  let https = /^https:\/\//.test(path)

  return `${prefix}/c${https ? '/s' : ''}/${tmpPath}`
}
