/**
 * @file 首屏标记识别
 * @author liwenqian@baidu.com
 */

import viewer from '../viewer'
import { OUTER_MESSAGE_PERFORMANCE_ANALYSIS_LOG } from '../page/const/index'
let missList = []
let incorrectList = []

function getPathTo (element) {
  if (element.tagName === 'HTML') {
    return 'html.1'
  }
  if (element === document.body) {
    return 'html.1/body.1'
  }

  var ix = 0
  var siblings = element.parentNode.childNodes
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i]
    if (sibling === element) {
      return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '.' + (ix + 1) + ''
    }
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++
    }
  }
}

function sendLog () {
  let allLabelImgs = [...document.querySelectorAll('mip-img[firstscreen]')]
  let allFirstScreenImgs = [...document.querySelectorAll('mip-img[mip-firstscreen-element]')]
  allLabelImgs.forEach(element => {
    if (!element.hasAttribute('mip-firstscreen-element')) {
      incorrectList.push(getPathTo(element))
    }
  })
  allFirstScreenImgs.forEach(element => {
    if (!element.hasAttribute('firstscreen')) {
      missList.push(getPathTo(element))
    }
  })
  let info = missList.join(',') + '!!' + incorrectList.join(',')
  viewer.sendMessage(OUTER_MESSAGE_PERFORMANCE_ANALYSIS_LOG, {
    type: 'fslabel',
    info: info
  })
}

export default {
  sendLog
}
