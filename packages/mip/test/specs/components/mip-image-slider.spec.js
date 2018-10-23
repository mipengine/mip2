/**
 * @file mip-image-slider spec file
 * @author chenyongle(chenyongle@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */
import util from 'src/util'

describe('mip-image-slider', () => {
  let sliderWrapper, testPosition, slider, sliderForArrow

  beforeEach(() => {
    sliderWrapper = document.createElement('div')
    sliderWrapper.style.width = '100px'
    sliderWrapper.style.height = '80px'
    sliderWrapper.innerHTML = `
      <style type="text/css">
      #slider .mip-image-slider-arrow-left {
        width: 17px;
      }
      .test {
        height: 20px;
        color: red;
      }
      </style>
      <mip-image-slider
        tabindex="0"
        step-size="0.2"
        layout="responsive"
        width="500"
        height="400"
        initial-slider-position="0.5"
        id="slider">
        <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
        </mip-img>
        <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
        </mip-img>
        <div first class="test">this is the first</div>
        <div second class="test">this is the second</div>
      </mip-image-slider>
      <mip-image-slider
        layout="responsive"
        width="500"
        height="400"
        disable-hint-reappear>
        <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
        </mip-img>
        <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
        </mip-img>
      </mip-image-slider>
      <button on="tap:slider.seekTo(0.3)">button</button>
    `
    sliderForArrow = document.createElement('div')
    sliderForArrow.style.width = '1000px'
    sliderForArrow.style.height = '1800px'
    sliderForArrow.innerHTML = `
      hello world
    `

    document.body.appendChild(sliderWrapper)
    document.body.appendChild(sliderForArrow)
    testPosition = getTestPosition(sliderWrapper)
    slider = sliderWrapper.querySelector('mip-image-slider')
  })
  afterEach(() => {
    document.body.removeChild(sliderWrapper)
    document.body.removeChild(sliderForArrow)
  })

  describe('painting right',function () {
    it('should show custom style on labels and arrow', () => {
      expect(getStyle(slider.querySelector('.mip-image-slider-arrow-left'), 'width')).to.equal('17px')
      expect(getStyle(slider.querySelector('.mip-image-slider-label-wrapper').firstChild, 'height')).to.equal('20px')
    })
    it('should move slider bar to right place when init', () => {
      expect(checkPosition(slider, testPosition.position50)).to.be.true
    })
  })

  describe('using mouse', function () {
    let event
    it('should move to right place on mousedown', () => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
    })
    it('should move slider bar to position on mousemove', () => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      event = createEvent('mousemove', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.true
    })
    it('should subsequently move slider bar to position', () => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      event = createEvent('mousemove', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.true
      event = createEvent('mousemove', testPosition.position100)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position100)).to.be.true
    })
    it('should limit slider bar movements on mousemove when beyond boundary', () => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      event = createEvent('mousemove', testPosition.position110)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position100)).to.be.true
    })
    it('should allow continued slider bar movements on mousemove with mouse going out and coming back',() => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      event = createEvent('mousemove', testPosition.position110)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position100)).to.be.true
      event = createEvent('mousemove', testPosition.position50)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position50)).to.be.true
    })
    it('should not move slider bar after mouseup for mousemove', () => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      event = createEvent('mousemove', testPosition.position50)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position50)).to.be.true
      event = createEvent('mouseup', testPosition.position50)
      slider.dispatchEvent(event)
      event = createEvent('mousemove', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.false
    })
    it('should move slider bar with mousedown after mouseup', () => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      event = createEvent('mousemove', testPosition.position50)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position50)).to.be.true
      event = createEvent('mouseup', testPosition.position50)
      slider.dispatchEvent(event)
      event = createEvent('mousedown', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.true
    })
  })

  describe('using touchscreen', function () {
    let event
    it('should move slider bar to right place on touchstart', () => {
      event = createEvent('touchstart', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
    })
    it('should move slider bar on touchmove', () => {
      event = createEvent('touchstart', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
      event = createEvent('touchmove', testPosition.position50)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position50)).to.be.true
    })
    it('should subsequently move slider bar to position', () => {
      event = createEvent('touchstart', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
      event = createEvent('touchmove', testPosition.position50)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position50)).to.be.true
      event = createEvent('touchmove', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.true
    })
    it('should limit slider bar movements on touchmove when beyond boundary', () => {
      event = createEvent('touchstart', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
      event = createEvent('touchmove', testPosition.position110)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position100)).to.be.true
    })
    it('should allow continued slider bar movements on touchmove with touch going out and coming back', () => {
      event = createEvent('touchstart', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
      event = createEvent('touchmove', testPosition.position110)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position100)).to.be.true
      event = createEvent('touchmove', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.true
    })
    it('should not move slider bar after touchend for touchmove', () => {
      event = createEvent('touchstart', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
      event = createEvent('touchmove', testPosition.position50)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position50)).to.be.true
      event = createEvent('touchend', testPosition.position50)
      slider.dispatchEvent(event)
      event = createEvent('touchmove', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.false
    })
    it('should move slider bar after touchend for touchstart', () => {
      event = createEvent('touchstart', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position20)).to.be.true
      event = createEvent('touchmove', testPosition.position50)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position50)).to.be.true
      event = createEvent('touchend', testPosition.position50)
      slider.dispatchEvent(event)
      event = createEvent('touchstart', testPosition.position70)
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.true
    })
  })

  describe('using keyboard', function () {
    let event, key
    it('ArrowLeft should move slider bar by 20% to the left', () => {
      key = 'ArrowLeft'
      event = new KeyboardEvent('keydown', {key})
      slider.focus()
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position30)).to.be.true
    })
    it('ArrowRight should move slider bar by 20% to the right', () => {
      key = 'ArrowRight'
      event = new KeyboardEvent('keydown', {key})
      slider.focus()
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position70)).to.be.true
    })
    it('PageUp should move slider bar to the leftest', () => {
      key = 'PageUp'
      event = new KeyboardEvent('keydown', {key})
      slider.focus()
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position00)).to.be.true
    })
    it('PageDown should move slider bar to the rightest', () => {
      key = 'PageDown'
      event = new KeyboardEvent('keydown', {key})
      slider.focus()
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position100)).to.be.true
    })
    it('should not move slider bar when slider is not focused', () => {
      key = 'PageDown'
      event = new KeyboardEvent('keydown', {key})
      slider.dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position100)).to.be.false
    })
    it('seekTo should work', () => {
      event = createEvent('click', 0)
      sliderWrapper.querySelector('button').dispatchEvent(event)
      expect(checkPosition(slider, testPosition.position30)).to.be.true
    })
  })

  describe('arrow behavior', function () {
    let event
    this.timeout(1500)
    it('should hide arrow with user interacting', () => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkArrowHide(slider)).to.be.true
    })
    // TODO 下面的测试似乎有点问题，但是测试又基本都通过了。
    it('should toggle arrow when in view and out of viewport', (done) => {
      event = createEvent('mousedown', testPosition.position20)
      slider.dispatchEvent(event)
      expect(checkArrowHide(slider)).to.be.true
      window.scrollTo(0, document.body.scrollHeight)
      setTimeout(() => {
        window.scrollTo(0, getStyle(slider, 'top'))
        setTimeout(() => {
          expect(checkArrowHide(slider)).to.be.false
          done()
        }, 1000)
      }, 100)
    })
    it('should not show arrow with disable-hint-reappear when in and out of view', (done) => {
      event = createEvent('mousedown', testPosition.position20)
      let slider = sliderWrapper.querySelectorAll('mip-image-slider')[1]
      slider.dispatchEvent(event)
      expect(checkArrowHide(slider)).to.be.true
      window.scrollTo(0, document.body.scrollHeight)
      setTimeout(() => {
        window.scrollTo(0, getStyle(slider, 'top'))
        setTimeout(() => {
          expect(checkArrowHide(slider)).to.be.true
          done()
        }, 1000)
      }, 100)
    })
  })

  function checkArrowHide(element) {
    return element.querySelector('.mip-image-slider-arrow').classList.contains('mip-image-slider-arrow-hidden')
  }
  function getStyle(element, styleName) {
    // 直接用 style 会无法读取内联样式之外的 style
    return window.getComputedStyle(element)[styleName]
  }
  function checkPosition (element, position) {
    const offset = util.rect.getElementOffset(element)
    const percentage = ((position - offset.left) / offset.width) * 100
    return (element.querySelector('.mip-image-slider-right-container').style.transform === `translateX(${percentage}%)`) &&
      (element.querySelectorAll('mip-img')[1].style.transform === `translateX(${-percentage}%)`) &&
      (element.querySelectorAll('.mip-image-slider-label-wrapper')[1].style.transform === `translateX(${-percentage}%)`) &&
      (element.querySelector('.mip-image-slider-bar-container').style.transform === `translateX(${percentage}%)`) &&
      (element.querySelectorAll('.mip-image-slider-arrow')[0].style.transform === `translateX(${percentage - 50}%)`) &&
      (element.querySelectorAll('.mip-image-slider-arrow')[1].style.transform === `translateX(${percentage - 50}%)`)
  }
  function getTestPosition (element) {
    const offset = util.rect.getElementOffset(element)
    return {
      position01: offset.left - offset.width * 0.1,
      position00: offset.left,
      position20: offset.left + offset.width * 0.2,
      position30: offset.left + offset.width * 0.3,
      position50: offset.left + offset.width * 0.5,
      position70: offset.left + offset.width * 0.7,
      position100: offset.left + offset.width,
      position110: offset.left + offset.width * 1.1,
    }
  }
  function createEvent (type, x, y = 0) {
    const event = new CustomEvent(type, { bubbles: true })
    event.pageX = x
    event.pageY = y
    event.clientX = x
    event.clientY = y
    event.targetTouches = [{
      pageX: x,
      pageY: y,
      clientX: x,
      clientY: y
    }]
    event.touches = [{
      pageX: x,
      pageY: y,
      clientX: x,
      clientY: y
    }]
    return event
  }
})
