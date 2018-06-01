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
import Naboo from './naboo'
import EventEmitter from './event-emitter'
import Gesture from './gesture'
import customStorage from './customStorage'
import json5 from 'json5'

/**
 * Exchange a url to cache url.
 *
 * @param {string} url Source url.
 * @param {string} type The url type.
 * @return {string} Cache url.
 */
function makeCacheUrl (url, type) {
  if (!fn.isCacheUrl(location.href) ||
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
  url = urlParas.join('//')
  return prefix + url
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
function parseCacheUrl (url) {
  if (!url) {
    return url
  }
  if (!(url.indexOf('http') === 0 ||
    url.indexOf('/') === 0)
  ) {
    return url
  }
  let reg = new RegExp('^(http[s]:)?(//([^/]+))?/[ic](/s)?/(.*)$', 'g')
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
 * @return {string} 原 mip 页 URL
 */
function getOriginalUrl () {
  let parsedUrl = parseCacheUrl(window.location.href)
  if (parsedUrl === window.location.href) {
    // 直接打开 MIP 页
    return parsedUrl
  }
  // mip-cache 页面
  let urlWithoutHash = parsedUrl.split('#')[0]
  let originHash = hash.get('mipanchor')
  return urlWithoutHash + (originHash.length ? '#' : '') + originHash
}

export default {
  json5,
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
  EventEmitter,
  Gesture,
  customStorage,
  Naboo
}
