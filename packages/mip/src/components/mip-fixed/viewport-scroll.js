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
     * @param {string} animations.position 浮动元素位置：top、bottom
     * @param {HTMLElement} animations.element 浮动元素
     * @param {string} animations.slide 滑动隐藏的类型（样式名）
     */
    this.animations = []

    /**
     * 根据元素位置单独处理入场、退场动画，目前只支持顶、底元素滑动隐藏
     *
     * @type {Object}
     */
    this.position = {
      top: MIP_FIXED_HIDE_TOP,
      bottom: MIP_FIXED_HIDE_BUTTOM,
      in (el, slide, def) {
        el.classList.remove(slide || def)
      },
      out (el, slide, def) {
        el.classList.add(slide || def)
      }
    }
  }

  /**
   * execute the handler based on the scroll direction
   * @param {number} direction scroll direction
   */
  handleScroll (direction) {
    if (!direction) {
      return
    }

    let type = direction > 0 ? 'out' : 'in'
    this.animations.forEach(item => {
      let positionHandler = this.position[type]
      let hideClass = this.position[item.position]
      if (hideClass) {
        positionHandler(item.element, item.slide, hideClass)
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
    this.animations.push(item)
    if (this.initialized) {
      return
    }
    this.initialized = true
    this.bindScrollEvent()
  }

  bindScrollEvent () {
    let viewport = window.MIP.viewport
    let direction = 0
    let scrollTop = viewport.getScrollTop()
    let scrollHeight = viewport.getScrollHeight()
    let lastScrollTop = 0

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
    window.addEventListener('touchstart', () => {
      scrollTop = viewport.getScrollTop()
      scrollHeight = viewport.getScrollHeight()
    })
    window.addEventListener('touchmove', pageMove)
    window.addEventListener('touchend', pageMove)
    viewport.on('scroll', () => {
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
