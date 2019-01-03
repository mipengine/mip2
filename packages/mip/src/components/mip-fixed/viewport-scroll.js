const MIP_FIXED_HIDE_TOP = 'mip-fixed-hide-top'
const MIP_FIXED_HIDE_BUTTOM = 'mip-fixed-hide-bottom'

/**
 * Add class to the element
 * @param {HTMLElement} el The mip-fixed element
 * @param {String} slide element's data-slide attribute
 * @param {String} reserveClass class name
 */
function addClass (el, slide, reserveClass) {
  el.classList.add(slide || reserveClass)
}

/**
 * Remove class from the element
 * @param {HTMLElement} el the mip-fixed element
 * @param {String} slide element's data-slide attribute
 * @param {String} reserveClass class name
 */
function removeClass (el, slide, reserveClass) {
  el.classList.remove(slide || reserveClass)
}

export default class ViewportScroll {
  constructor () {
    /**
     * 初始化状态
     *
     * @type {boolean}
     */
    this.initialized = false

    /**
     * 是否为首次，主要解决 viewport.onscroll 在默认时触发
     *
     * @type {boolean}
     */
    this.first = true

    /**
     * 动画处理元素
     *
     * @type {Array}
     * @param {string} animate.position 浮动元素位置：top、bottom
     * @param {HTMLElement} animate.element 浮动元素
     * @param {string} animate.slide 滑动隐藏的类型（样式名）
     */
    this.animate = []

    /**
     * 根据元素位置单独处理入场、退场动画，目前只支持顶、底元素滑动隐藏
     *
     * @type {Object}
     */
    this.position = {
      top: {
        in (el, slide) {
          removeClass(el, slide, MIP_FIXED_HIDE_TOP)
        },
        out (el, slide) {
          addClass(el, slide, MIP_FIXED_HIDE_TOP)
        }
      },
      bottom: {
        in (el, slide) {
          removeClass(el, slide, MIP_FIXED_HIDE_BUTTOM)
        },
        out (el, slide) {
          addClass(el, slide, MIP_FIXED_HIDE_BUTTOM)
        }
      }
    }
  }

  /**
   * handle the scroll
   * @param {Number} direction scroll direction
   */
  handleScroll (direction) {
    if (direction === 0) {
      return
    }

    let type = direction > 0 ? 'out' : 'in'
    this.animate.forEach(item => {
      let positionHandler = this.position[item.position]
      if (positionHandler && typeof positionHandler[type] === 'function') {
        positionHandler[type](item.element, item.slide)
      }
    })
  }

  /**
   * get scroll direction, >0 is down, <0 is up, 0 is static
   * @param {Number} scrollTop scrollTop
   * @param {Number} lastScrollTop lastScrollTop
   * @param {Number} scrollHeight scrollHeight
   * @return {Number} scroll direction
   */
  getDirection (scrollTop, lastScrollTop, scrollHeight) {
    // 在底部视作向下滚动
    if (scrollTop + window.innerHeight >= scrollHeight) {
      return 1
    }
    // lockbodyscroll会导致滚动到顶部时产生scrollTop变为0和1的抖动，因此采用1作为判断
    if (scrollTop > 1) {
      return scrollTop - lastScrollTop
    }
    // 在顶部视作向上滚动
    return -1
  }

  /**
   * 初始化
   * @param {Object} item 动画处理元素
   */
  init (item) {
    // 设置元素
    this.animate.push(item)

    // 如果已经绑定事件
    if (this.initialized) {
      return
    }

    this.bindScrollEvent()
  }

  bindScrollEvent () {
    let viewport = window.MIP.viewport
    let direction = 0
    let scrollTop = viewport.getScrollTop()
    let scrollHeight = viewport.getScrollHeight()
    let lastScrollTop = 0

    this.initialized = true

    /**
     *  get the scroll direction and handle it
     */
    let pageMove = () => {
      scrollTop = viewport.getScrollTop()
      scrollHeight = viewport.getScrollHeight()
      direction = this.getDirection(scrollTop, lastScrollTop, scrollHeight)
      this.handleScroll(direction)
      lastScrollTop = scrollTop
    }

    // 使用 touch + scroll 兼容在移动端 iframe 和非 iframe
    window.addEventListener('touchstart', event => {
      scrollTop = viewport.getScrollTop()
      scrollHeight = viewport.getScrollHeight()
    })
    window.addEventListener('touchmove', pageMove)
    window.addEventListener('touchend', pageMove)
    viewport.on('scroll', event => {
      if (this.first) {
        this.first = false
        return
      }
      pageMove()
    })
  }
}
