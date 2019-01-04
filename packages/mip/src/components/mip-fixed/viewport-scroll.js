const MIP_FIXED_HIDE_TOP = 'mip-fixed-hide-top'
const MIP_FIXED_HIDE_BUTTOM = 'mip-fixed-hide-bottom'

class ViewportScroll {
  constructor () {
    /**
     * 初始化状态
     *
     * @type {boolean}
     */
    this.initialized = false

    /**
     * 是否为首次滚动，用于处理 viewer.init 默认触发的 scroll
     *
     * @type {boolean}
     */
    this.firstScroll = true

    /**
     * 浮动元素数组
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
          el.classList.remove(slide || MIP_FIXED_HIDE_TOP)
        },
        out (el, slide) {
          el.classList.add(slide || MIP_FIXED_HIDE_TOP)
        }
      },
      bottom: {
        in (el, slide) {
          el.classList.remove(slide || MIP_FIXED_HIDE_BUTTOM)
        },
        out (el, slide) {
          el.classList.add(slide || MIP_FIXED_HIDE_BUTTOM)
        }
      }
    }
  }

  /**
   * execute the handler based on the scroll direction
   * @param {number} direction scroll direction
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
   * @param {number} scrollTop scrollTop
   * @param {number} lastScrollTop lastScrollTop
   * @param {number} scrollHeight scrollHeight
   * @return {number} scroll direction
   */
  getDirection (scrollTop, lastScrollTop, scrollHeight) {
    // 在底部视作向下滚动
    if (scrollTop + window.innerHeight >= scrollHeight) {
      return 1
    }
    // lockbodyscroll 会导致滚动到顶部时产生 scrollTop 变为 0 和 1 的抖动，因此采用 1 作为判断
    if (scrollTop > 1) {
      return scrollTop - lastScrollTop
    }
    // 在顶部视作向上滚动
    return -1
  }

  /**
   * 添加浮动元素动画处理对象，首次执行需绑定事件
   * @param {Object} item 浮动元素动画处理对象
   */
  init (item) {
    this.animate.push(item)

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
    let pageMove = (event) => {
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
      // 忽略 viewer.init 默认触发的 scroll
      if (this.firstScroll) {
        this.firstScroll = false
        return
      }
      pageMove()
    })
  }
}

export default new ViewportScroll()
