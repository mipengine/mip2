/**
 * @file mip-img 图片组件
 * @author wangpei07,JennyL
 */

/* global Image */
/* eslint-disable no-new */

import util from '../util/index'
import CustomElement from '../custom-element'
import viewport from '../viewport'
import viewer from '../viewer'

const naboo = util.naboo

let errHandle
let Gesture = util.Gesture
let css = util.css
let rect = util.rect

// 取值根据 https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement
let imgAttributes = [
  'alt',
  'ismap',
  'src',
  'sizes',
  'srcset',
  'usemap',
  'title'
]

// XXX: jpg 是 jpeg 的简写，在URL中都有出现，所以有相同的宽高比
let imgRatio = {
  jpg: 1.33,
  jpeg: 1.33,
  png: 1,
  gif: 1,
  webp: 1,
  other: 1
}

function getPopupImgPos (imgWidth, imgHeight) {
  let width = viewport.getWidth()
  let height = Math.round(width * imgHeight / imgWidth)
  let viewportH = viewport.getHeight()
  let top = viewportH > height
    ? (viewportH - height) / 2
    : 0
  return {
    width: width,
    height: height,
    left: 0,
    top: top
  }
}

/**
 * 从mip-img属性列表里获取属性
 *
 * @param {Object} attributes 参考: https://dom.spec.whatwg.org/#interface-namednodemap
 * @return {Object} 属性列表JSON
 * @example
 * {
 *     "src": "http://xx.jpeg"
 *     "width": "720"
 * }
 */
function getAttributeSet (attributes) {
  let attrs = {}
  Array.prototype.slice.apply(attributes).forEach(function (attr) {
    attrs[attr.name] = attr.value
  })
  return attrs
}

function getImgOffset (img) {
  let imgOffset = rect.getElementOffset(img)
  return imgOffset
}
/**
 * 获取所有图片的 src
 * @return {Array.<HTMLElement>} 返回修改的元素集
 */
function getImgsSrc () {
  return [...document.querySelectorAll('mip-img')].filter(value => value.hasAttribute('popup')).map(value => value.getAttribute('src'))
}
// 创建弹层 dom
function createPopup (element, img) {
  // 获取图片数组
  let imgsSrcArray = getImgsSrc()
  let index = parseInt(element.getAttribute('index'), 10) || 0

  let popup = document.createElement('div')
  css(popup, 'display', 'block')
  // 阻止纵向滑动
  new Gesture(popup, {
    preventY: true
  })
  popup.className = 'mip-img-popUp-wrapper'
  popup.setAttribute('data-name', 'mip-img-popUp-name')

  // 创建图片预览图层
  let popUpBg = document.createElement('div')
  // 创建多图预览 wrapper
  let carouselWrapper = document.createElement('div')
  // 计算 wrapper 窗口大小
  let imgOffset = getImgOffset(img)
  let PopupImgPos = getPopupImgPos(imgOffset.width, imgOffset.height)
  css(carouselWrapper, {
    'position': 'absolute'
  })
  css(carouselWrapper, PopupImgPos)
  // 创建 mip-carousel
  let carousel = document.createElement('mip-carousel')

  carousel.setAttribute('layout', 'height-fixed')
  carousel.setAttribute('index', index + 1)
  carousel.setAttribute('width', PopupImgPos.width)
  carousel.setAttribute('height', PopupImgPos.height)

  for (let i = 0; i < imgsSrcArray.length; i++) {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('src', imgsSrcArray[i])
    carousel.appendChild(mipImg)
  }
  popUpBg.className = 'mip-img-popUp-bg'

  carouselWrapper.appendChild(carousel)
  popup.appendChild(popUpBg)
  popup.appendChild(carouselWrapper)
  document.body.appendChild(popup)

  return popup
}

function bindPopup (element, img) {
  // 图片点击时展现图片
  img.addEventListener('click', function (event) {
    event.stopPropagation()
    // 图片未加载则不弹层
    /* istanbul ignore if */
    if (img.width + img.naturalWidth === 0) {
      return
    }

    // Show page mask
    window.MIP.viewer.page.togglePageMask(true, {
      skipTransition: true,
      extraClass: 'black'
    })
    let popup = createPopup(element, img)
    let popupBg = popup.querySelector('.mip-img-popUp-bg')
    let popupImg = popup.querySelector('mip-carousel')

    let imgOffset = getImgOffset(img)

    popup.addEventListener('click', imagePop, false)

    function imagePop () {
      // Hide page mask
      window.MIP.viewer.page.togglePageMask(false, {
        skipTransition: true,
        extraClass: 'black'
      })
      naboo.animate(popupBg, {
        opacity: 0
      }).start()
      naboo.animate(popupImg, getImgOffset(img)).start(function () {
        css(img, 'visibility', 'visible')
        css(popup, 'display', 'none')
        popup.removeEventListener('click', imagePop, false)
        popup.remove()
      })
    }

    let onResize = function () {
      imgOffset = getImgOffset(img)
      css(popupImg, imgOffset)
      naboo.animate(popupImg, getPopupImgPos(imgOffset.width, imgOffset.height)).start()
    }
    window.addEventListener('resize', onResize)

    css(popupImg, imgOffset)
    css(popupImg, 'position', 'fixed')
    css(popupBg, 'opacity', 1)

    naboo.animate(popupImg, getPopupImgPos(imgOffset.width, imgOffset.height)).start()
    css(img, 'visibility', 'hidden')
    css(img.parentNode, 'zIndex', 'inherit')
  }, false)
}

function bindLoad (element, img, mipEle) {
  img.addEventListener('load', function () {
    img.classList.remove('mip-img-loading')
    element.classList.add('mip-img-loaded')
    element.customElement.resourcesComplete()
    mipEle.placeholder && mipEle.placeholder.remove()
  }, false)

  // Http header accept has 'image/webp', But browser don't support
  // Set image visibility hidden in order to hidden extra style
  errHandle = errorHandle.bind(null, img)
  img.addEventListener('error', errHandle, false)
}

/**
 * Trigger when image load error
 *
 * @param {HTMLElement} img image element
 */
function errorHandle (img) {
  /* istanbul ignore if */
  if (!viewer.isIframed) {
    return
  }
  let ele = document.createElement('a')
  ele.href = img.src
  if (!/(\?|&)mip_img_ori=1(&|$)/.test(ele.search)) {
    let search = ele.search || '?'
    ele.search += (/[?&]$/.test(search) ? '' : '&') + 'mip_img_ori=1'
    img.src = ele.href
  }
  img.removeEventListener('error', errHandle)
}

/**
 * Placeholder 占位
 *
 * @class
 *
 * @param {Object} element 要添加占位的元素
 */
class Placeholder {
  constructor (element) {
    this.targetEle = element
  }

  init () {
    this.imgType = this._getImgType(this.targetEle)
    this._add(this.imgType)
  }

  _add (type) {
    let placeholder = this.placeholder = document.createElement('div')
    placeholder.classList.add('mip-placeholder')
    placeholder.classList.add('mip-placeholder-' + type)

    this.targetEle.appendChild(placeholder)
  }

  remove () {
    let parent = this.placeholder.parentElement
    parent && parent.removeChild(this.placeholder)
  }

  /**
     * read img src/srcset and get img type
     *
     * @param  {Object} ele target mip-img element
     * @return {string}     type of img
     */
  _getImgType (ele) {
    let srcString = ele.getAttribute('src') || ele.getAttribute('srcset') || 'other'
    let imgType = ''
    for (let type in imgRatio) {
      if (srcString.match(type)) {
        imgType = type
      }
    }
    return imgType || 'other'
  }
}

class MipImg extends CustomElement {
  static get observedAttributes () {
    return imgAttributes
  }

  connectedCallback () {
    let element = this.element

    if (element.isBuilt()) {
      return
    }

    let layoutAttr = element.getAttribute('layout')
    let heightAttr = element.getAttribute('height')
    if (!layoutAttr && !heightAttr) {
      // 如果没有layout，则增加默认占位
      this.placeholder = new Placeholder(element)
      this.placeholder.init()
    }
  }

  firstInviewCallback () {
    let ele = this.element
    let img = new Image()
    if (ele.hasAttribute('popup')) {
      let allMipImg = [...document.querySelectorAll('mip-img')].filter(value => value.hasAttribute('popup'))
      ele.setAttribute('index', allMipImg.indexOf(ele))
    }
    if (this.placeholder) {
      img.classList.add('mip-img-loading')
    }

    this.applyFillContent(img, true)

    // transfer attributes from mip-img to img tag
    this.attributes = getAttributeSet(this.element.attributes)
    for (let k in this.attributes) {
      if (this.attributes.hasOwnProperty(k) && imgAttributes.indexOf(k) > -1) {
        if (k === 'src') {
          // src attribute needs to be mip-cached
          let imgsrc = util.makeCacheUrl(this.attributes.src, 'img')
          img.setAttribute(k, imgsrc)
        } else if (k === 'srcset') {
          let imgSrcset = this.attributes.srcset
          let reg = /[\w-/]+\.(jpg|jpeg|png|gif|webp|bmp|tiff) /g
          let srcArr = imgSrcset.replace(reg, function (url) {
            return util.makeCacheUrl(url, 'img')
          })
          img.setAttribute('srcset', srcArr)
        } else {
          img.setAttribute(k, this.attributes[k])
        }
      }
    }

    ele.appendChild(img)
    if (ele.hasAttribute('popup')) {
      bindPopup(ele, img)
    }

    bindLoad(ele, img, this)
  }

  attributeChangedCallback (attributeName, oldValue, newValue, namespace) {
    if (attributeName === 'src' && oldValue !== newValue) {
      let img = this.element.querySelector('img')
      img && (img.src = newValue)
    }
  }

  hasResources () {
    return true
  }
}

export default MipImg
