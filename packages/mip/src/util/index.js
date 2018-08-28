/**
 * @file util entry
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict'

/* globals location */

import fn from './fn'
import hash from './hash'
import dom from './dom/dom'
import event from './dom/event'
import rect from './dom/rect'
import css from './dom/css'
import platform from './platform'
import naboo from './naboo'
import EventEmitter from './event-emitter'
import Gesture from './gesture/index'
import customStorage from './custom-storage'
import jsonParse from './json-parse'

/**
 * Exchange a url to cache url.
 *
 * @param {string} url Source url.
 * @param {string} type The url type.
 * @param {boolean} containsHost The url type.
 * @return {string} Cache url.
 */
export function makeCacheUrl (url, type, containsHost) {
  if (fn.isCacheUrl(url) ||
    !fn.isCacheUrl(location.href) ||
    (url && url.length < 8) ||
    !(url.indexOf('http') === 0 || url.indexOf('//') === 0)
  ) {
    return url
  }
  let prefix = (type === 'img') ? '/i/' : '/c/'
  if (url.indexOf('//') === 0 || url.indexOf('https') === 0) {
    prefix += 's/'
  }
  let urlParas = url.split('//')
  urlParas.shift()
  let host = urlParas[0].substring(0, urlParas[0].indexOf('/'))
  url = urlParas.join('//')

  let result = prefix + url
  if (containsHost) {
    result = location.protocol + '//' + host.replace(/-/g, '--').replace(/\./g, '-') + '.mipcdn.com' + result
  }

  return result
}

/**
 * Exchange cache url to origin url.
 * Reg result has many aspects, it's following
 *  reg[0] whole url
 *  reg[1] url protocol
 *  reg[2] url mip cache domain
 *  reg[3] url domain extname
 *  reg[4] /s flag
 *  reg[5] origin url
 *
 * @param {string} url Source url.
 * @return {string} origin url.
 */
export function parseCacheUrl (url) {
  if (!url) {
    return url
  }
  if (!(url.indexOf('http') === 0 ||
    url.indexOf('/') === 0)
  ) {
    return url
  }
  let reg = new RegExp('^(http(?:s?):)?(//([^/]+))?/[ic](/s)?/(.*)$', 'g')
  let result = reg.exec(url)
  if (!result) {
    return url
  }
  let uri = result[4] ? 'https:' : 'http:'
  uri += result[5] ? ('//' + result[5]) : ''
  let urlRegExp = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/
  if (!urlRegExp.test(uri)) {
    return url
  }
  return uri
}

/**
 * 获取页面原 mip url，可以将页面 mip-cache url 处理为原页面
 * 由于 cache-url 可能会被改写，需要还原
 *
 * @param {string=} url 传入的 URL
 * @return {string} 原 mip 页 URL
 */
export function getOriginalUrl (url) {
  /* istanbul ignore if */
  if (!url) {
    url = window.location.href
  }
  let parsedUrl = parseCacheUrl(url)
  if (parsedUrl === url) {
    // 直接打开 MIP 页
    return parsedUrl
  }
  // mip-cache 页面
  let urlWithoutHash = parsedUrl.split('#')[0]
  let originHash = hash.get('mipanchor')
  return urlWithoutHash + (originHash.length ? '#' : '') + originHash
}

/**
 * Whether pageUrl is mip cache url.
 *
 * @param {string} pageUrl - current page url.
 * @return {boolean} isCacheUrl.
 */
export function isCacheUrl (pageUrl) {
  return fn.isCacheUrl(pageUrl)
}

export default {
  fn,
  dom,
  event,
  rect,
  css,
  hash,
  platform,
  parseCacheUrl,
  makeCacheUrl,
  getOriginalUrl,
  isCacheUrl,
  EventEmitter,
  Gesture,
  customStorage,
  naboo,
  jsonParse
}
