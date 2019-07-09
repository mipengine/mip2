import util, {fn} from '../../util'
import viewport from '../../viewport'

export function scrollTo (height, { duration = 500, scrollTop = 0 } = {}) {
  let top = height

  if (top === scrollTop) {
    return Promise.resolve()
  }

  let rest = top - scrollTop
  let sign = rest > 0

  return new Promise(resolve => {
    transition(
      duration,
      t => {
        let delta = Math.ceil(t * rest)
        let toScroll = delta + scrollTop

        if ((sign && toScroll >= top) ||
          (!sign && toScroll <= top)
        ) {
          scroll(top)
          return false
        }

        scroll(toScroll)
        return true
      },
      () => {
        scroll(top)
        resolve()
      }
    )
  })
}

function transition (duration, step, callback) {
  let start = Date.now()

  fn.raf(loop)

  function loop () {
    let now = Date.now() - start

    if (step(bezier(now, 0, 1, duration))) {
      fn.raf(loop)
    } else {
      callback()
    }
  }
}

function bezier (t, b, c, d) {
  return 1.0042954579734844 * Math.exp(
    -6.4041738958415664 * Math.exp(-7.2908241330981340 * t / d)
  ) * c + b
}

function scroll (top) {
  viewport.setScrollTop(top)
  // if (scrollingFunction) {
  //   scrollingFunction.call()
  // } else {
  //   window.scrollTo(0, top)
  // }
}

/**
 * scrollTo 接口
 * 滚动到指定元素的特定位置
 * 
 * @param {HTMLElement} element 目标元素
 * @param {number} duration 滚动动画时间
 * @param {string} position 滚动后元素显示的位置，取值范围 'top'、'bottom'、'center'
 */
export function handleScrollTo (element, {duration = 0, position = 'top'} = {}) {
  /* istanbul ignore if */
  if (!element) {
    return
  }
  /* istanbul ignore if */
  if (!typeof duration === 'number' || !isFinite(duration)) {
    duration = 0
  }
  let offset = -viewport.getHeight() + util.rect.getElementRect(element).height
  switch (position) {
    case 'bottom':
      break
    case 'center':
      offset /= 2
      break
    default:
      offset = 0
      break
  }
  scrollTo(element.offsetTop + offset, {duration})
}
