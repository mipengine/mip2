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

const {css, rect, event, naboo, makeCacheUrl} = util

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

/**
 * 获取弹出图片的位置
 * 2018-10-11 增加：由于浏览效果改为了 contain 效果，所以 carousel 内部采用 div 的 background-image 来显示图片。
 * 所以 carousel 必须设置的高宽都固定成了视口的高宽。保留这个函数只是为了动画效果。
 *
 * @param  {number} imgWidth  原始图片的宽度
 * @param  {number} imgHeight 原始图片的高度
 * @return {Object}           包含定位信息的对象
 */
function getPopupImgPos (imgWidth, imgHeight) {
  let viewportW = viewport.getWidth()
  let viewportH = viewport.getHeight()
  let top = 0
  let left = 0
  if (viewportH / viewportW < imgHeight / imgWidth) {
    let width = Math.round(viewportH * imgWidth / imgHeight)
    left = (viewportW - width) / 2
    return {
      height: viewportH,
      width,
      left,
      top: 0
    }
  }
  let height = Math.round(viewportW * imgHeight / imgWidth)
  top = (viewportH - height) / 2
  return {
    height,
    width: viewportW,
    left: 0,
    top
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
/**
 * 获取图片的offset
 *
 * @param  {HTNMLElement} img img
 * @return {Object}     一个包含offset信息的对象
 */
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
/**
 * 找出当前视口下的图片
 * @param  {HTMLElement} carouselWrapper carouselWrapper
 * @param  {HTMLElement} mipCarousel mipCarousel
 * @return {HTMLElement} img
 */
function getCurrentImg (carouselWrapper, mipCarousel) {
  // 例如：'translate3d(-90px,0,0)'
  let str = carouselWrapper.style.webkitTransform || carouselWrapper.style.transform
  let result = /translate3d\(-?([0-9]+)/i.exec(str)
  // 原先宽度是视口宽度，现在需要的是图片本身宽度。最后还是一样的。。。
  let width = mipCarousel.getAttribute('width')
  let number = parseInt(result[1], 10) / width
  return carouselWrapper.querySelectorAll('.div-mip-img')[number]
}
/**
 * 创建图片弹层
 *
 * @param  {HTMLElement} element mip-img组件元素
 * @param  {HTMLElment} img     mip-img元素包裹的img
 * @return {HTMLElment}         图片弹层的div
 */
function createPopup (element, img) {
  // 获取图片数组
  let imgsSrcArray = getImgsSrc()
  let index = parseInt(element.getAttribute('index'), 10) || 0

  let popup = document.createElement('div')
  css(popup, 'display', 'block')

  popup.className = 'mip-img-popUp-wrapper'
  popup.setAttribute('data-name', 'mip-img-popUp-name')

  // 创建图片预览图层
  let popUpBg = document.createElement('div')
  // 创建多图预览 wrapper
  let carouselWrapper = document.createElement('div')
  // 计算 wrapper 窗口大小，变为视口大小
  css(carouselWrapper, {
    'position': 'absolute',
    'width': viewport.getWidth(),
    'height': viewport.getHeight(),
    'left': 0,
    'top': 0
  })
  // 创建 mip-carousel
  let carousel = document.createElement('mip-carousel')

  carousel.setAttribute('layout', 'responsive')
  carousel.setAttribute('index', index + 1)
  carousel.setAttribute('width', viewport.getWidth())
  carousel.setAttribute('height', viewport.getHeight())

  for (let i = 0; i < imgsSrcArray.length; i++) {
    let mipImg = document.createElement('div')
    mipImg.className = 'div-mip-img'
    mipImg.setAttribute('data-src', imgsSrcArray[i])
    css(mipImg, {
      'background-image': `url(${imgsSrcArray[i]})`,
      'background-repeat': 'no-repeat',
      'background-size': 'contain',
      'background-position': 'center'
    })
    carousel.appendChild(mipImg)
  }
  popUpBg.className = 'mip-img-popUp-bg'

  carouselWrapper.appendChild(carousel)
  popup.appendChild(popUpBg)
  popup.appendChild(carouselWrapper)
  document.body.appendChild(popup)

  return popup
}
/**
 * 将图片与弹层绑定
 *
 * @param  {HTMLElement} element mip-img
 * @param  {HTMLElement} img     mip-img下的img
 * @return {void}         无
 */
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
    let mipCarousel = popup.querySelector('mip-carousel')
    let popupImg = new Image()
    popupImg.setAttribute('src', img.src)
    popup.appendChild(popupImg)

    let imgOffset = getImgOffset(img)

    popup.addEventListener('click', imagePop, false)

    function imagePop () {
      // Hide page mask
      window.MIP.viewer.page.togglePageMask(false, {
        skipTransition: true,
        extraClass: 'black'
      })

      let mipCarouselWrapper = popup.querySelector('.mip-carousel-wrapper')
      /* istanbul ignore if */
      if (mipCarouselWrapper == null) return

      // 找出当前视口下的图片
      let currentImg = getCurrentImg(mipCarouselWrapper, mipCarousel)
      popupImg.setAttribute('src', currentImg.getAttribute('data-src'))
      let previousPos = getImgOffset(img)
      // 获取弹出图片滑动的距离，根据前面的设定，top大于0就不是长图，小于0才是滑动的距离。
      let currentImgPos = getImgOffset(currentImg)
      currentImgPos.top < 0 && (previousPos.top -= currentImgPos.top)
      currentImgPos.left < 0 && (previousPos.left -= currentImgPos.left)
      css(popupImg, getPopupImgPos(popupImg.naturalWidth, popupImg.naturalHeight))
      css(popupImg, 'display', 'block')
      css(mipCarousel, 'display', 'none')
      naboo.animate(popupBg, {
        opacity: 0
      }).start()

      naboo.animate(popup, {'display': 'none'})
      naboo.animate(popupImg, previousPos).start(() => {
        css(img, 'visibility', 'visible')
        css(popup, 'display', 'none')
        popup.removeEventListener('click', imagePop, false)
        popup.remove()
      })
    }

    let onResize = function () {
      imgOffset = getImgOffset(img)
      css(popupImg, imgOffset)
      naboo.animate(popupImg, getPopupImgPos(img.naturalWidth, img.naturalHeight)).start()
    }
    window.addEventListener('resize', onResize)

    css(popupImg, imgOffset)
    css(mipCarousel, 'visibility', 'hidden')
    css(popupBg, 'opacity', 1)

    naboo.animate(popupImg, getPopupImgPos(img.naturalWidth, img.naturalHeight)).start(() => {
      css(popupImg, 'display', 'none')
      css(mipCarousel, 'visibility', 'visible')
    })
    css(img, 'visibility', 'hidden')
    css(img.parentNode, 'zIndex', 'inherit')
  }, false)
}

class MipImg extends CustomElement {
  static get observedAttributes () {
    return imgAttributes
  }

  isLoadingEnabled () {
    return true
  }

  /**
   * Check whether the element need to be rendered in advance
   *
   * @param {Object} elementRect element rect
   * @param {Object} viewportRect viewport rect
   *
   * @return {boolean}
   */
  prerenderAllowed (elementRect, viewportRect) {
    let threshold = viewportRect.height
    return viewportRect.top + viewportRect.height + threshold >= elementRect.top &&
      elementRect.top + elementRect.height + threshold >= viewportRect.top
  }

  layoutCallback () {
    let ele = this.element
    let img = new Image()
    if (ele.hasAttribute('popup')) {
      let allMipImg = [...document.querySelectorAll('mip-img')].filter(value => value.hasAttribute('popup'))
      ele.setAttribute('index', allMipImg.indexOf(ele))
    }

    this.applyFillContent(img, true)

    // transfer attributes from mip-img to img tag
    this.attributes = getAttributeSet(this.element.attributes)
    for (let k in this.attributes) {
      if (this.attributes.hasOwnProperty(k) && imgAttributes.indexOf(k) > -1) {
        if (k === 'src') {
          // src attribute needs to be mip-cached
          let imgsrc = makeCacheUrl(this.attributes.src, 'img')
          img.setAttribute(k, imgsrc)
        } else if (k === 'srcset') {
          let imgSrcset = this.attributes.srcset
          let reg = /[\w-/]+\.(jpg|jpeg|png|gif|webp|bmp|tiff) /g
          let srcArr = imgSrcset.replace(reg, function (url) {
            return makeCacheUrl(url, 'img')
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
    return event.loadPromise(img).then(() => {
      // 标识资源已加载完成
      this.resourcesComplete()
      this.element.classList.add('mip-img-loaded')
    }).catch(reason => {
      /* istanbul ignore if */
      if (!viewer.isIframed) {
        return Promise.reject(reason)
      }
      let ele = document.createElement('a')
      ele.href = img.src
      if (!/(\?|&)mip_img_ori=1(&|$)/.test(ele.search)) {
        let search = ele.search || '?'
        ele.search += (/[?&]$/.test(search) ? '' : '&') + 'mip_img_ori=1'
        img.src = ele.href
      }

      return Promise.reject(reason)
    })
  }

  attributeChangedCallback (attributeName, oldValue, newValue, namespace) {
    if (attributeName === 'src' && oldValue !== newValue) {
      let img = this.element.querySelector('img')

      if (!img) {
        return
      }

      event.loadPromise(img).then(() => {
        this.element.toggleFallback(false)
      })

      img.src = newValue
    }
  }

  hasResources () {
    return true
  }
}

export default MipImg
