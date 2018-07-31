/**
 * @file mip-carousel 轮播组件
 *
 * @author fengchuantao
 * @modify wangpei07 2016-11-30
 */

// import resources from '../resources'
import CustomElement from '../custom-element'
import resources from '../resources'
import viewer from '../viewer'
let prerenderElement = resources.prerenderElement

let carouselParas = {
  boxClass: 'mip-carousel-container',
  wrapBoxClass: 'mip-carousel-wrapper',
  slideBox: 'mip-carousel-slideBox',
  activeitem: 'mip-carousel-activeitem',
  threshold: 0.2
}
// 按tagName创建一个固定class的tag
function createTagWithClass (className, tagName) {
  tagName = tagName || 'div'
  let tag = document.createElement(tagName)
  tag.className = className || ''
  return tag
}
// 获取carouse标签下所有非mip layout引入的元素
function getChildNodes (element) {
  let allChildNodes = element.children
  let arrNode = Array.prototype.slice.call(allChildNodes)
  let childList = []

  arrNode.map(function (ele, i) {
    if (ele.tagName.toLowerCase() !== 'mip-i-space') {
      // 如果是 autoplay，则不允许有 popup 功能
      if (element.hasAttribute('autoplay')) {
        if (ele.hasAttribute('popup')) {
          ele.removeAttribute('popup')
        }
      }
      childList.push(ele)
      element.removeChild(ele)
    }
  })
  if (childList.length > 0) {
    // 拷贝第一个和最后一个节点拼接dom
    let firstCard = childList[0].cloneNode(true)
    let endCard = childList[childList.length - 1].cloneNode(true)
    childList.unshift(endCard)
    childList.push(firstCard)
  }
  return childList
}

// 移动函数
function translateFn (value, time, wrapBox) {
  wrapBox.style.webkitTransform = 'translate3d(' + value + 'px, 0px, 0px)'
  wrapBox.style.transitionDuration = time
}

// 移出class
function removeClass (dom, className) {
  /* istanbul ignore if */
  if (!dom) {
    return
  }
  let curClassName = dom.className
  dom.className = curClassName.replace(className, '').replace(/(^\s*)|(\s*$)/g, '')
}

// 追加class
function addClass (dom, className) {
  /* istanbul ignore if */
  if (!dom) {
    return
  }
  let curClassName = dom.className
  if (!curClassName) {
    dom.className = className
  } else {
    dom.className = curClassName + ' ' + className
  }
}

/**
 * 计算滚动之后需要到达的坐标 resetPosAndIdx
 *
 * @param {number} curIndex curIndex
 * @param {number} totalNum totalNum
 * @param {number} deviceWidth deviceWidth
 * @param {number} endPos endPos
 * @return {Object}
 */
function resetPosAndIdx (curIndex, totalNum, deviceWidth, endPos) {
  let endInfo = {
    endPos: 0,
    endIndex: curIndex
  }
  if (curIndex === totalNum - 1) {
    endInfo.endPos = -deviceWidth
    endInfo.endIndex = 1
  } else if (curIndex === 0) {
    // if it is last one
    endInfo.endPos = -(totalNum - 2) * deviceWidth
    endInfo.endIndex = totalNum - 2
  } else {
    endInfo.endPos = endPos
  }
  return endInfo
}

// changeIndicatorStyle
function changeIndicatorStyle (startDot, endDot, className) {
  removeClass(startDot, className)
  addClass(endDot, className)
}

class MIPCarousel extends CustomElement {
  /* eslint-disable fecs-max-statements */
  build () {
    let ele = this.element
    let self = this
    let eleWidth = ele.clientWidth

    let dotItems = []

    // 获取用户填写属性
    // 是否自动播放
    let isAutoPlay = ele.hasAttribute('autoplay')

    // 图片间隔时长默认为4000
    let isDefer = ele.getAttribute('defer')

    let isDeferNum = isDefer || 4000

    // 分页显示器
    let showPageNum = ele.hasAttribute('indicator')

    // 翻页按钮
    let showBtn = ele.hasAttribute('buttonController')

    // 翻页按钮
    let indicatorId = ele.getAttribute('indicatorId')

    // 跳转索引
    let index = ele.getAttribute('index')

    let indexNum = parseInt(index) || 1

    // Gesture锁
    let slideLock = {
      stop: 1
    }

    // btn按钮手势锁
    let btnLock = {
      stop: 1
    }

    // 缓存上一次手势位置
    let prvGestureClientx = 0

    // 缓存当前值轮播位置
    let curGestureClientx = -eleWidth

    // 当前图片显示索引
    // let imgIndex = 1
    let imgIndex = indexNum

    // 定时器时间hold
    let moveInterval

    // 禁止左右滑动配置
    let startPos = {}
    let endPos = {}
    let isScrolling = 0

    // 获取carousel下的所有节点
    let childNodes = getChildNodes(ele)

    // 图片显示个数
    // 其实图片个数应该为实际个数+2.copy了头和尾的两部分
    let childNum = childNodes.length

    // length 等于0时，不做任何处理
    if (childNum === 0) {
      return
    }
    // 将getChildNodes获取的元素拼装轮播dom
    let carouselBox = createTagWithClass(carouselParas.boxClass)

    let wrapBox = createTagWithClass(carouselParas.wrapBoxClass)

    childNodes.map(function (ele, i) {
      let slideBox = createTagWithClass(carouselParas.slideBox)
      slideBox.appendChild(ele)
      slideBox.style.width = (100 / childNum) + '%'
      wrapBox.appendChild(slideBox)

      // 遍历mip-img计算布局
      self.applyFillContent(ele, true)
      // inview callback  bug, TODO
      // let MIP = window.MIP || {};
      prerenderElement(ele)
      let allImgs = ele.querySelectorAll('mip-img')
      let len = allImgs.length
      for (let idx = 0; idx < len; idx++) {
        self.applyFillContent(allImgs[idx], true)
        prerenderElement(allImgs[idx])
      }
    })

    wrapBox.style.width = childNum * 100 + '%'

    carouselBox.appendChild(wrapBox)
    ele.appendChild(carouselBox)

    // 初始渲染时应该改变位置到第一张图
    // let initPostion = -eleWidth
    // 初始渲染时如果有跳转索引就改变位置到指定图片
    let initPostion = index ? -eleWidth * indexNum : -eleWidth
    wrapBox.style.webkitTransform = 'translate3d(' + initPostion + 'px, 0, 0)'

    // 绑定wrapBox的手势事件
    // 手势移动的距离
    let diffNum = 0

    // 绑定手势点击事件
    wrapBox.addEventListener('touchstart', function (event) {
      // 以下兼容横屏时禁止左右滑动
      let touch = event.targetTouches[0]
      startPos = {
        x: touch.pageX,
        y: touch.pageY,
        time: Date.now()
      }
      isScrolling = 0 // 这个参数判断是垂直滚动还是水平滚动

      // 获取手势点击位置
      prvGestureClientx = touch.pageX
      clearInterval(moveInterval)
    }, false)

    wrapBox.addEventListener('touchmove', function (event) {
      // 阻止触摸事件的默认行为，即阻止滚屏
      let touch = event.targetTouches[0]
      endPos = {
        x: touch.pageX - startPos.x,
        y: touch.pageY - startPos.y
      }
      isScrolling = Math.abs(endPos.x) < Math.abs(endPos.y) ? 1 : 0 // isScrolling为1时，表示纵向滑动，0为横向滑动
      if (isScrolling === 0) {
        event.preventDefault()
      }

      // 获取手指移动的距离
      diffNum = event.targetTouches[0].pageX - prvGestureClientx

      // 外框同步运动
      translateFn(diffNum + curGestureClientx, '0ms', wrapBox)

      // 滚动手势锁 正在滑动
      slideLock.stop = 0
    }, false)

    wrapBox.addEventListener('touchend', function (event) {
      //  只有滑动之后才会触发
      if (!slideLock.stop) {
        let startIdx = imgIndex
        let endIdx = startIdx
        // 如果大于设定阈值
        if (Math.abs(diffNum) > eleWidth * carouselParas.threshold) {
          endIdx = (diffNum > 0) ? imgIndex - 1 : imgIndex + 1
        }
        move(wrapBox, startIdx, endIdx)
        slideLock.stop = 1
      }

      // 如果存在自动则调用自动轮播
      if (isAutoPlay) {
        clearInterval(moveInterval)
        autoPlay()
      }
    }, false)

    // 自动轮播
    if (isAutoPlay) {
      autoPlay()
    }

    // 指示器
    if (showPageNum) {
      indicator()
    }

    // 控制按钮
    if (showBtn) {
      cratebutton()
    }

    // 是否关联indicator
    if (indicatorId) {
      indicatorDot(indicatorId)
    }

    // 自动轮播
    function autoPlay () {
      moveInterval = setInterval(function () {
        move(wrapBox, imgIndex, imgIndex + 1)
      }, isDeferNum)
    }

    // 创建指示器
    function indicator () {
      let indicatorBox = createTagWithClass('mip-carousel-indicatorbox')
      let indicatorBoxWrap = createTagWithClass('mip-carousel-indicatorBoxwrap', 'p')
      let indicatorNow = createTagWithClass('mip-carousel-indicatornow', 'span')
      let indicatorAllNum = createTagWithClass('', 'span')
      indicatorAllNum.innerHTML = '/' + (childNum - 2)
      indicatorNow.innerHTML = imgIndex
      indicatorBoxWrap.appendChild(indicatorNow)
      indicatorBoxWrap.appendChild(indicatorAllNum)
      indicatorBox.appendChild(indicatorBoxWrap)
      ele.appendChild(indicatorBox)
    }

    // 指示器数字变化
    function indicatorChange (idx) {
      if (!showPageNum) {
        return
      }
      let indicatorNow = ele.querySelector('.mip-carousel-indicatornow')
      indicatorNow.innerHTML = idx
    }

    // 创建左右轮播切换btn
    function cratebutton () {
      let preBtn = document.createElement('p')
      preBtn.className = 'mip-carousel-preBtn'
      let nextBtn = document.createElement('p')
      nextBtn.className = 'mip-carousel-nextBtn'

      ele.appendChild(preBtn)
      ele.appendChild(nextBtn)
      bindBtn()
    }

    // 绑定按钮切换事件
    function bindBtn () {
      ele.querySelector('.mip-carousel-preBtn').addEventListener('click', function (event) {
        /* istanbul ignore if */
        if (!btnLock.stop) {
          return
        }

        btnLock.stop = 0

        imgIndex = imgIndex - 1

        clearInterval(moveInterval)
        move(wrapBox, imgIndex + 1, imgIndex)
        if (isAutoPlay) {
          autoPlay()
        }
      }, false)

      ele.querySelector('.mip-carousel-nextBtn').addEventListener('click', function (event) {
        /* istanbul ignore if */
        if (!btnLock.stop) {
          return
        }

        btnLock.stop = 0

        imgIndex = imgIndex + 1
        clearInterval(moveInterval)
        move(wrapBox, imgIndex - 1, imgIndex)
        if (isAutoPlay) {
          autoPlay()
        }
      }, false)
    }

    // 图片滑动处理与手势滑动函数endPosition为最终距离,Duration变换时间
    function move (wrapBox, startIdx, endIdx, Duration) {
      /* istanbul ignore if */
      if (!wrapBox) {
        return
      }
      // 双保险，确认位移的是 ele 的 width
      if (eleWidth !== ele.clientWidth) {
        eleWidth = ele.clientWidth
      }
      imgIndex = endIdx
      let endPosition = -eleWidth * endIdx
      if (Duration) {
        translateFn(endPosition, '0ms', wrapBox)
        wrapBox.style.transitionDuration = '0ms'
      } else {
        translateFn(endPosition, '300ms', wrapBox)
        wrapBox.style.transitionDuration = '300ms'
      }
      // resetPosAndIdx
      let posIdxObj = resetPosAndIdx(imgIndex, childNum, eleWidth, endPosition)
      curGestureClientx = posIdxObj.endPos
      endIdx = posIdxObj.endIndex
      imgIndex = endIdx

      // 如果有指示器，需更新选中位置的样式
      if (dotItems.length > 0) {
        changeIndicatorStyle(dotItems[startIdx - 1], dotItems[endIdx - 1], carouselParas.activeitem)
      }
      // 如果切换了坐标，需要在动画结束后重置translatex位置
      if (curGestureClientx !== endPosition) {
        setTimeout(function () {
          translateFn(curGestureClientx, '0ms', wrapBox)
          btnLock.stop = 1
        }, 300)
      }
      btnLock.stop = 1
      indicatorChange(imgIndex)
      viewer.eventAction.execute('switchCompleted', ele, {
        currIndex: imgIndex,
        currCarouselItem: childNodes[imgIndex],
        carouselChildrenLength: childNum
      })
    }

    // 处理圆点型指示器
    function indicatorDot (domId) {
      let indicDom = document.getElementById(domId)
      if (!indicDom) {
        return
      }
      dotItems = indicDom.children
      let dotLen = dotItems.length

      if (index) {
        // 清除DOM中预先设置的mip-carousel-activeitem类
        dotItems = Array.prototype.slice.call(dotItems)
        dotItems.forEach(dotItem => {
          removeClass(dotItem, carouselParas.activeitem)
        })
        addClass(dotItems[imgIndex - 1], carouselParas.activeitem)
      }

      if (dotLen === childNum - 2) {
        for (let i = 0; i < dotLen; i++) {
          dotItems[i].count = i
          dotItems[i].addEventListener('click', function (event) {
            let count = this.count
            clearInterval(moveInterval)
            move(wrapBox, imgIndex, count + 1)
            if (isAutoPlay) {
              autoPlay()
            }
          })
        }
      } else {
        // 若个数不匹配，则隐藏掉indicator
        addClass(indicDom, 'hide')
        dotItems = []
      }
    }
    // 横竖屏兼容处理
    window.addEventListener('resize', function () {
      eleWidth = ele.clientWidth
      move(wrapBox, imgIndex, imgIndex, '0ms')
    }, false)

    // 跳转索引
    this.addEventAction('go', function (event, num) {
      clearInterval(moveInterval)
      move(wrapBox, imgIndex, parseInt(num))
      if (isAutoPlay) {
        autoPlay()
      }
    })
  }
}

export default MIPCarousel
