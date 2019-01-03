const HIDE_TOP = 'mip-fixed-hide-top'
const HIDE_BOTTOM = 'mip-fixed-hide-bottom'

const UP = 'up'
const DOWN = 'down'

function addClass (el, slide, className) {
  el.classList.add(slide || className)
}

function removeClass (el, slide, className) {
  el.classList.remove(slide || className)
}

export default class ViewportScroll {
  constructor () {
    /**
     * 初始化状态
     *
     * @type {boolean}
     */
    this.inited = false

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
          removeClass(el, slide, HIDE_TOP)
        },
        out (el, slide) {
          addClass(el, slide, HIDE_TOP)
        }
      },
      bottom: {
        in (el, slide) {
          removeClass(el, slide, HIDE_BOTTOM)
        },
        out (el, slide) {
          addClass(el, slide, HIDE_BOTTOM)
        }
      }
    }
  }

  /**
   * 滚动回调
   */
  onscroll (event) {
    if (!event.direction) {
      return
    }

    let type = event.direction === DOWN ? 'out' : 'in'
    this.animate.forEach(item => {
      let positionHandle = this.position[item.position]
      if (positionHandle && typeof positionHandle[type] === 'function') {
        positionHandle[type](item.element, item.slide)
      }
    })
  }

  /**
   * 初始化，单例
   */
  init (item) {
    // 设置元素
    this.animate.push(item)

    // 如果已经绑定事件
    if (this.inited) {
      return
    }

    this.bindScrollEvent()
  }

  /**
   * 绑定滚动事件
   */
  bindScrollEvent () {
    let viewport = window.MIP.viewport
    let lastDirection = null
    let direct = 0
    let scrollTop = viewport.getScrollTop()
    let scrollHeight = viewport.getScrollHeight()
    let lastScrollTop = 0

    // 设置状态
    this.inited = true

    let pagemove = () => {
      scrollTop = viewport.getScrollTop()
      scrollHeight = viewport.getScrollHeight()

      if (scrollTop + window.innerHeight >= scrollHeight) {
        if (lastDirection !== DOWN) {
          lastDirection = DOWN
          this.onscroll({
            direction: DOWN
          })
        }
      // lockbodyscroll会导致滚动到顶部时产生scrollTop变为0和1的抖动，因此采用1作为判断
      } else if (scrollTop > 1) {
        if (lastScrollTop < scrollTop) {
          direct = 1
        } else if (lastScrollTop > scrollTop) {
          direct = -1
        }

        let direction = null
        if (lastDirection !== DOWN && direct === 1) {
          lastDirection = DOWN
          direction = DOWN
        } else if (lastDirection !== UP && direct === -1) {
          lastDirection = UP
          direction = UP
        }

        this.onscroll({
          direction: direction
        })
      } else if (scrollTop === 0 || scrollTop === 1) {
        if (lastDirection !== UP) {
          lastDirection = UP
          this.onscroll({
            direction: UP
          })
        }
      }

      lastScrollTop = scrollTop
    }

    // 使用 touch + scroll 兼容在移动端 iframe 和非 iframe
    window.addEventListener('touchstart', event => {
      scrollTop = viewport.getScrollTop()
      scrollHeight = viewport.getScrollHeight()
    })
    window.addEventListener('touchmove', pagemove)
    window.addEventListener('touchend', pagemove)
    viewport.on('scroll', event => {
      if (this.first) {
        this.first = false
        return
      }
      pagemove()
    })
  }
}
