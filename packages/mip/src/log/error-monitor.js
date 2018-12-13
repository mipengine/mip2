/**
 * @file error-monitor.js
 * @description javascript error monitor
 * 
 * 1. 仅收集百度&神马 CDN 地址下官方组件和 MIP 核心错误
 * 2. 抽样比例 0.1
 * 
 * @author schoeu, liwenqian
 */

import viewer from '../viewer'
import coreTags from './core-tags'
import { OUTER_MESSAGE_STABILITY_LOG } from '../page/const/index'

const RATE = 0.1
const tags = Array.isArray(coreTags) ? coreTags.filter((it = '') => !!it.trim()) : []

/**
 * MIP错误捕获处理
 *
 * @param {Object} e 错误事件对象
 * @param {?Object} opts 可选项
 * @param {?number} opts.rate 抽样率
 */
export function errorHandler (e = {}, opts = {}) {
  let rate = opts.rate || RATE

  // 报错文件请求路径, 跨域js文件中错误无信息暂不上报
  let filename = e.filename
  let legalPathRegex = /(c\.mipcdn\.com|mipcache\.bdstatic\.com|\S+\.sm-tc\.cn|\S+\.transcode\.cn)\/static/
  if (!filename || !legalPathRegex.test(filename)) {
    return
  }

  // 错误信息
  let message = e.message || ''

  // 错误行号
  let lineno = e.lineno || ''

  // 错误列号
  let colno = e.colno || (window.event && window.event.errorCharacter) || 0

  let tagInfo = /\/(mip-.+)\//g.exec(filename) || []
  let tagName = tagInfo[1] || ''
  let sampling = Math.random() <= rate
  let shouldReportError = (filename.match(/(mip\.js)/g) || tags.indexOf(tagName) > -1) && sampling
  
  if (shouldReportError) {
    // 数据处理
    let logData = {
      file: filename,
      msg: message,
      ln: lineno,
      col: colno,
      href: window.location.href
    }
    viewer.sendMessage(OUTER_MESSAGE_STABILITY_LOG, logData)
  }
}

export default function install () {
  window.removeEventListener('error', errorHandler)
  window.addEventListener('error', errorHandler)
}
