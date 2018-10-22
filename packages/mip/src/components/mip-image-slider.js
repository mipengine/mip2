/**
 * @file       mip-image-slider
 * @author     chenyongle(chenyongle@baidu.com)
 * @description 图片对比组件
 */
import CustomElement from '../custom-element'
import util from '../util'
/**
 * 获取所有正确的子元素，两个 mip-img 的元素是必须的，两个提示 div 可选
 *
 * @param  {HTMLElement} element element
 * @return {Arrary.<HTMLElement>}         返回正确元素的数组集
 */
function getAllChildren (element) {
  let array = []
  let imgs = [...element.querySelectorAll('mip-img')]
  if (imgs.length !== 2) {
    throw new Error('mip-img 元素个数不正确，必须为2')
  }
  array = [...imgs]
  element.removeChild(imgs[0])
  element.removeChild(imgs[1])
  let divs = [...element.querySelectorAll('div')]
  for (let i = 0; i < divs.length; i++) {
    if (divs[i].hasAttribute('first')) {
      array[2] = divs[i]
    }
    if (divs[i].hasAttribute('second')) {
      array[3] = divs[i]
    }
    element.removeChild(divs[i])
  }
  return array
}
/**
 * addEventListener 包了一层，方便 removeEventListener
 *
 * @param  {HTMLElement}   element element
 * @param  {string}   type    event type
 * @param  {Function} fn      handle function
 * @return {Function}           removeEventListener wrapper
 */
function listen (element, type, fn) {
  element.addEventListener(type, fn, false)
  return () => element.removeEventListener(type, fn, false)
}

export default class MIPImageSlider extends CustomElement {
  constructor (element) {
    super(element)
    this.container = null
    // 左边的图片
    this.leftImage = null
    // 右边的图片
    this.rightImage = null
    // 左边的文字提示
    this.leftLabel = null
    // 右边的文字提示
    this.rightLabel = null
    this.leftContainer = null
    this.rightContainer = null

    this.position = null
    this.disableHintReappear = this.element.hasAttribute('disable-hint-reappear')
    this.initialSliderPosition = this.element.hasAttribute('initial-slider-position')
      ? (Number(this.element.getAttribute('initial-slider-position')) || 0.5) : 0.5
    this.stepSize = this.element.hasAttribute('step-size')
      ? (Number(this.element.getAttribute('step-size')) || 0.1) : 0.1

    // 移动条
    this.barWrapper = null
    // 箭头提示
    this.leftArrow = null
    this.rightArrow = null
  }
  /**
   * 初始化 4 个关键 Node，中间的移动条，左右箭头
   *
   * @return {void} 无
   */
  initValue () {
    let arrayNodes = getAllChildren(this.element)
    let [leftImage, rightImage, leftLabel, rightLabel] = [...arrayNodes]
    this.leftImage = leftImage
    this.rightImage = rightImage
    let label
    if (leftLabel) {
      label = document.createElement('div')
      label.classList.add('mip-image-slider-container')
      label.classList.add('mip-image-slider-label-wrapper')
      label.appendChild(leftLabel)
      this.leftLabel = label
    }
    if (rightLabel) {
      label = document.createElement('div')
      label.classList.add('mip-image-slider-right-container')
      label.classList.add('mip-image-slider-label-wrapper')
      label.appendChild(rightLabel)
      this.rightLabel = label
    }

    label = document.createElement('div')
    label.classList.add('mip-image-slider-bar-container')
    let bar = document.createElement('div')
    bar.classList.add('mip-image-slider-bar')
    label.appendChild(bar)
    this.barWrapper = label

    this.buildArrow()
  }
  buildArrow () {
    let arrowContainer = document.createElement('div')
    arrowContainer.classList.add('mip-image-slider-arrow')
    let wrapper = document.createElement('div')
    wrapper.classList.add('mip-image-slider-arrow-left-wrapper')
    let arrow = document.createElement('div')
    arrow.classList.add('mip-image-slider-arrow-left')
    wrapper.appendChild(arrow)
    arrowContainer.appendChild(wrapper)
    this.leftArrow = arrowContainer

    arrowContainer = document.createElement('div')
    arrowContainer.classList.add('mip-image-slider-arrow')
    wrapper = document.createElement('div')
    wrapper.classList.add('mip-image-slider-arrow-right-wrapper')
    arrow = document.createElement('div')
    arrow.classList.add('mip-image-slider-arrow-right')
    wrapper.appendChild(arrow)
    arrowContainer.appendChild(wrapper)
    this.rightArrow = arrowContainer
  }
  build () {
    this.initValue()
    this.leftContainer = document.createElement('div')
    this.leftContainer.classList.add('mip-image-slider-left-container')
    this.rightContainer = document.createElement('div')
    this.rightContainer.classList.add('mip-image-slider-right-container')
    this.container = document.createElement('div')
    this.container.classList.add('mip-image-slider-container')

    this.leftLabel && this.leftContainer.appendChild(this.leftLabel)
    this.leftContainer.appendChild(this.leftImage)
    this.applyFillContent(this.leftImage, true)
    this.rightLabel && this.rightContainer.appendChild(this.rightLabel)
    this.rightContainer.appendChild(this.rightImage)
    this.applyFillContent(this.rightImage, true)

    this.container.appendChild(this.leftContainer)
    this.container.appendChild(this.rightContainer)
    this.container.appendChild(this.barWrapper)
    this.container.appendChild(this.leftArrow)
    this.container.appendChild(this.rightArrow)
    this.element.appendChild(this.container)
    this.applyFillContent(this.element, true)

    let percentage = Number(this.initialSliderPosition) * 100
    this.moveRight(percentage)

    listen(this.element, 'mousedown', this.onMouseDown.bind(this))
    listen(this.element, 'keydown', this.onKeyDown.bind(this))
    listen(this.element, 'touchstart', this.onTouchStart.bind(this))
    this.uninstallMoveListener = null
    this.uninstallUpListener = null
    this.uninstallTouchMove = null
    this.uninstallTouchEnd = null

    this.addEventAction('seekTo', (event, percentage) => {
      let num = Number(percentage)
      if (num < 0 || num > 1) {
        throw new Error('跳转的参数只能是 0-1 内的数字')
      }
      this.moveRight(100 * percentage)
    })
  }
  /* istanbul ignore next */
  viewportCallback (inViewport) {
    if (inViewport && !this.disableHintReappear) {
      // 初始化的时候 leftArrow 为 null
      this.leftArrow && this.leftArrow.classList.remove('mip-image-slider-arrow-hidden')
      this.rightArrow && this.rightArrow.classList.remove('mip-image-slider-arrow-hidden')
    }
  }
  onTouchStart (e) {
    this.moveX(e.targetTouches[0].pageX)
    this.uninstallTouchMove = listen(this.element, 'touchmove', this.onTouchMove.bind(this))
    this.uninstallTouchEnd = listen(this.element, 'touchend', this.onTouchEnd.bind(this))
    this.animationArrowHidden()
  }
  onTouchMove (e) {
    this.moveX(e.targetTouches[0].pageX)
  }
  onTouchEnd (e) {
    this.uninstallTouchMove()
    this.uninstallTouchEnd()
  }
  /**
   * 根据点击的位置移动右边的图片
   * @param  {Object} e event
   * @return {void}   无
   */
  onMouseDown (e) {
    e.preventDefault()
    this.moveX(e.pageX)
    this.uninstallMoveListener && this.uninstallMoveListener()
    this.uninstallUpListener && this.uninstallUpListener()
    this.uninstallMoveListener = listen(this.element, 'mousemove', this.onMouseMove.bind(this))
    this.uninstallUpListener = listen(this.element, 'mouseup', this.onMouseUp.bind(this))

    this.animationArrowHidden()
  }
  onMouseMove (e) {
    e.preventDefault()
    this.moveX(e.pageX)
  }
  onMouseUp (e) {
    e.preventDefault()
    this.uninstallMoveListener()
    this.uninstallUpListener()
  }
  onKeyDown (e) {
    if (document.activeElement !== this.element) {
      return
    }
    this.animationArrowHidden()

    switch (e.key.toLowerCase()) {
      case 'left':
      case 'arrowleft':
        e.preventDefault()
        e.stopPropagation()
        this.moveByKeyLeft()
        break
      case 'right':
      case 'arrowright':
        e.preventDefault()
        e.stopPropagation()
        this.moveByKeyRight()
        break
      case 'pageup':
        e.preventDefault()
        e.stopPropagation()
        this.moveRight(0)
        break
      case 'pagedown':
        e.preventDefault()
        e.stopPropagation()
        this.moveRight(100)
        break
    }
  }
  moveByKeyLeft () {
    this.moveRight(this.position - this.stepSize * 100)
  }
  moveByKeyRight () {
    this.moveRight(this.position + this.stepSize * 100)
  }
  moveX (pageX) {
    let offset = util.rect.getElementOffset(this.element)
    let percentage = ((pageX - offset.left) / offset.width) * 100
    this.moveRight(percentage)
  }
  /**
   * 移动动画
   *
   * @param  {number} percentage 百分比
   * @return {void}            无
   */
  moveRight (percentage) {
    if (percentage <= 0) {
      percentage = 0
    }
    if (percentage >= 100) {
      percentage = 100
    }
    this.position = percentage
    this.rightContainer.style.transform = `translateX(${percentage}%)`
    this.rightImage.style.transform = `translateX(${-percentage}%)`
    this.rightLabel && (this.rightLabel.style.transform = `translateX(${-percentage}%)`)
    this.barWrapper.style.transform = `translateX(${percentage}%)`
    this.leftArrow.style.transform = `translateX(${percentage - 50}%)`
    this.rightArrow.style.transform = `translateX(${percentage - 50}%)`
  }
  animationArrowHidden () {
    this.leftArrow.classList.add('mip-image-slider-arrow-hidden')
    this.rightArrow.classList.add('mip-image-slider-arrow-hidden')
  }
}
