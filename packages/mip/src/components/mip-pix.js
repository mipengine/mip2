/**
 * @file mip-pix 统计组件
 * @author baidu-authors, liangjiaying<jiaojiaomao220@163.com>
 */

/* global Image */

import util from '../util/index'
import CustomElement from '../custom-element'

const DEFAULT_PARAMS = {
  TIME: 't',
  TITLE: 'title',
  HOST: 'host'
}

/**
 * 替换请求链接中的参数
 *
 * @param {string} src      用户填写在mip-pix中的src
 * @param {string} paraName key, 如"title"
 * @param {string} paraVal  value, 如当前时间戳
 * @return {string} url
 */
function addParas (src, paraName, paraVal) {
  let paraNameQ = new RegExp('\\$?{' + paraName + '}', 'g')
  if (src.search(paraNameQ) > -1) {
    return src.replace(paraNameQ, paraVal)
  }
  src += src.indexOf('?') > -1 ? '&' : '?'
  paraName = DEFAULT_PARAMS[paraName] || /* istanbul ignore next */ paraName
  return src + paraName + '=' + paraVal
}

/**
 * 从body获取mip-expeirment实验分组
 *
 * @param  {string} attr 实验名
 * @return {string}      实验分组
 */
function getBodyAttr (attr) {
  let body = document.getElementsByTagName('body')[0]
  return body.getAttribute(attr) || 'default'
}

class MipPix extends CustomElement {
  firstInviewCallback () {
    // 获取统计所需参数
    let ele = this.element
    let src = ele.getAttribute('src')
    let host = window.location.href
    let title = (document.querySelector('title') || /* istanbul ignore next */ {}).innerHTML || ''
    let time = Date.now()

    // 替换通用参数
    src = addParas(src, 'TIME', time)
    src = addParas(src, 'TITLE', encodeURIComponent(title))
    src = addParas(src, 'HOST', encodeURIComponent(host))

    // 增加对<mip-experiment>支持，获取实验分组
    let expReg = /MIP-X-((\w|-|\d|_)+)/g
    let matchExpArr = src.match(expReg)
    for (let i in matchExpArr) {
      let matchExp = matchExpArr[i]
      src = addParas(src, matchExp, getBodyAttr(matchExp))
    }

    // 去除匹配失败的其餘{參數}
    src = src.replace(/\$?{.+?}/g, '')
    // 去除其餘 '${', '{', '}' 確保輸出不包含 MIP 定义的语法
    src = src.replace(/\$?{|}/g, '')

    // 创建请求img
    let image = new Image()
    image.src = src
    image.setAttribute('width', 0)
    image.setAttribute('height', 0)
    ele.setAttribute('width', '')
    ele.setAttribute('height', '')
    ele.appendChild(image)
    util.css(ele, {display: 'none'})
  }
}

export default MipPix
