/**
 * @file fixed 悬浮组件滑动隐藏
 * @author xuexb <fe.xiaowu@gmail.com>
 */

/* global define */

define(function (require) {
  var viewport = require('viewport')

  /**
     * 视图滚动，触发页面浮动元素隐藏
     *
     * @type {Object}
     */
  var viewportScroll = {

    /**
     * 初始化状态
     *
     * @type {boolean}
     */
    inited: false,

    /**
     * 是否为首次，主要解决 viewport.onscroll 在默认时触发
     *
     * @type {boolean}
     */
    first: true,

    /**
     * 动画处理元素
     *
     * @type {Array}
     * @param {string} animate.position 浮动元素位置：top、bottom
     * @param {HTMLElement} animate.element 浮动元素
     * @param {string} animate.slide 滑动隐藏的类型（样式名）
     */
    animate: [],

    /**
     * 滚动回调
     */
    onscroll: function (event) {
      if (!event.direction) {
        return
      }

      var type = event.direction === 'down' ? 'out' : 'in'
      viewportScroll.animate.forEach(function (item) {
        var positionHandle = viewportScroll.position[item.position]
        if (positionHandle && typeof positionHandle[type] === 'function') {
          positionHandle[type](item.element, item.slide)
        }
      })
    },

    /**
     * 初始化，单例
     */
    init: function (item) {
      // 设置元素
      viewportScroll.animate.push(item)

      // 如果已经绑定事件
      if (viewportScroll.inited) {
        return
      }

      viewportScroll.bindScrollEvent()
    },

    /**
     * 绑定滚动事件
     */
    bindScrollEvent: function () {
      var lastDirection = null
      var direct = 0
      var scrollTop = viewport.getScrollTop()
      var scrollHeight = viewport.getScrollHeight()
      var lastScrollTop = 0

      // 设置状态
      viewportScroll.inited = true

      function pagemove () {
        scrollTop = viewport.getScrollTop()
        scrollHeight = viewport.getScrollHeight()

        if (scrollTop + window.innerHeight >= scrollHeight) {
          if (lastDirection !== 'down') {
            lastDirection = 'down'
            viewportScroll.onscroll({
              direction: 'down'
            })
          }
        } else if (scrollTop > 0) {
          if (lastScrollTop < scrollTop) {
            direct = 1
          } else if (lastScrollTop > scrollTop) {
            direct = -1
          }

          var direction = null
          if (lastDirection !== 'down' && direct === 1) {
            lastDirection = 'down'
            direction = 'down'
          } else if (lastDirection !== 'up' && direct === -1) {
            lastDirection = 'up'
            direction = 'up'
          }

          viewportScroll.onscroll({
            direction: direction
          })
        } else if (scrollTop === 0) {
          if (lastDirection !== 'up') {
            lastDirection = 'up'
            viewportScroll.onscroll({
              direction: 'up'
            })
          }
        }

        lastScrollTop = scrollTop
      }

      // 使用 touch + scroll 兼容在移动端 iframe 和非 iframe
      window.addEventListener('touchstart', function (event) {
        scrollTop = viewport.getScrollTop()
        scrollHeight = viewport.getScrollHeight()
      })
      window.addEventListener('touchmove', pagemove)
      window.addEventListener('touchend', pagemove)
      viewport.on('scroll', function (event) {
        if (viewportScroll.first) {
          viewportScroll.first = false
          return
        }
        pagemove()
      })
    },

    /**
     * 根据元素位置单独处理入场、退场动画，目前只支持顶、底元素滑动隐藏
     *
     * @type {Object}
     */
    position: {
      top: {
        in: function (el, slide) {
          el.classList.remove(slide || 'mip-fixed-hide-top')
        },
        out: function (el, slide) {
          el.classList.add(slide || 'mip-fixed-hide-top')
        }
      },
      bottom: {
        in: function (el, slide) {
          el.classList.remove(slide || 'mip-fixed-hide-bottom')
        },
        out: function (el, slide) {
          el.classList.add(slide || 'mip-fixed-hide-bottom')
        }
      }
    }
  }

  return viewportScroll
})
