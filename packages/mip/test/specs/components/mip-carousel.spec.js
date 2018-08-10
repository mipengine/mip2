/**
 * @file mip-carousel spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after */

describe('mip-carousel', function () {
  describe('no pics', function () {
    let div

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          autoplay
          defer="100"
          width="100"
          height="80">
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should render nothing', function () {
      expect(div.querySelector('mip-carousel').children.length).to.equal(0)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe('autoplay with defer and have subheader', function () {
    let div
    let wrapBox
    let slideBoxs
    this.timeout(1200)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          autoplay
          defer="400"
          width="100"
          height="80">
          <mip-i-space></mip-i-space>
          <a target="_blank" href="http://wenda.tianya.cn/m/question/1almfj0foas94gc7vtoq6ejbfbmdk3e78ehaa">
              <mip-img
                  src="https://www.mipengine.org/static/img/sample_01.jpg" layout="responsive"
              width="600"
              height="400">
              </mip-img>
              <div class="mip-carousle-subtitle">这里是title2</div>
          </a>
          <mip-img popup
              src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
              src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should produce mip-carousel correctly', function () {
      let mipCarouselContainer = div.querySelector('div.mip-carousel-container')
      wrapBox = div.querySelector('div.mip-carousel-wrapper')
      slideBoxs = wrapBox.querySelectorAll('div.mip-carousel-slideBox')
      expect(mipCarouselContainer).to.be.exist
      expect(wrapBox).to.be.exist
      expect(wrapBox.parentNode.classList.contains('mip-carousel-container')).to.be.true
      expect(slideBoxs.length).to.equal(5)
      expect(slideBoxs[0].querySelector('img').getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_03.jpg')
      expect(slideBoxs[4].querySelector('img').getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')
    })

    it('should autoplay', function (done) {
      setTimeout(() => {
        expect(wrapBox.style.transform).to.equal('translate3d(-200px, 0px, 0px)')
        done()
      }, 500) // 400 + 100
    })

    it('should not popup when autoplay', function () {
      expect(slideBoxs[2].getAttribute('popup')).to.be.null
    })

    it('should move to next img when touch', function (done) {
      // after move to -300
      setTimeout(() => {
        let event = document.createEvent('Events')
        event.initEvent('touchstart', true, true)
        event.targetTouches = event.touches = [{
          pageX: 0,
          pageY: 0
        }]
        wrapBox.dispatchEvent(event)

        event.initEvent('touchmove', true, true)
        event.targetTouches = event.touches = [{
          pageX: -60,
          pageY: 0
        }]
        wrapBox.dispatchEvent(event)

        event.initEvent('touchend', true, true)
        wrapBox.dispatchEvent(event)
      }, 400)
      setTimeout(() => {
        expect(wrapBox.style.transform).to.be.oneOf(['translate3d(-100px, 0px, 0px)', 'translate3d(-400px, 0px, 0px)'])
        done()
      }, 500)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe.skip('autoplay with default defer', function () {
    let div
    this.timeout(5500)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          autoplay
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should autoplay', function (done) {
      let wrapBox = div.querySelector('.mip-carousel-wrapper')
      setTimeout(() => {
        expect(wrapBox.style.transform).to.equal('translate3d(-200px, 0px, 0px)')
        done()
      }, 5000)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe('with number/default indicator', function () {
    let div
    let wrapBox
    let event = document.createEvent('Events')
    let indicator
    this.timeout(2000)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          indicator
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should show default indicator', function () {
      let indicatorbox = div.querySelector('div.mip-carousel-indicatorbox')
      let indicatorBoxwrap = indicatorbox.querySelector('p.mip-carousel-indicatorBoxwrap')
      indicator = indicatorBoxwrap.querySelectorAll('span')[0]
      expect(indicatorbox).to.be.exist
      expect(indicatorBoxwrap).to.be.exist
      expect(indicatorBoxwrap.querySelectorAll('span').length).to.equal(2)
      expect(indicator.innerHTML).to.equal('1')
      expect(indicatorBoxwrap.querySelectorAll('span')[1].innerHTML).to.equal('/3')
    })

    it('should not move when vertically scrolling', function (done) {
      wrapBox = div.querySelector('div.mip-carousel-wrapper')
      event.initEvent('touchstart', true, true)
      event.targetTouches = event.touches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = event.touches = [{
        pageX: 0,
        pageY: 30
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-100px, 0px, 0px)')
        expect(indicator.innerHTML).to.equal('1')
        done()
      }, 330)
    })

    it('should not move when touch diff is too small', function (done) {
      event.initEvent('touchstart', true, true)
      event.targetTouches = event.touches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = event.touches = [{
        pageX: 1,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-100px, 0px, 0px)')
        expect(indicator.innerHTML).to.equal('1')
        done()
      }, 330)
    })

    it('should move to next img when touch', function (done) {
      event.initEvent('touchstart', true, true)
      event.targetTouches = event.touches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = event.touches = [{
        pageX: -60,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-200px, 0px, 0px)')
        expect(indicator.innerHTML).to.equal('2')
        done()
      }, 330)
    })

    it('should move to another direction', function (done) {
      event.initEvent('touchstart', true, true)
      event.targetTouches = event.touches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = event.touches = [{
        pageX: 60,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-100px, 0px, 0px)')
        expect(indicator.innerHTML).to.equal('1')
        done()
      }, 330)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe('customized indicator', function () {
    let divOk
    let divOkAuto
    let divNo
    let divWrong
    let indicatorDom
    let dotsDom
    this.timeout(3000)

    it('should be not ok with appointed indicatorId but not indicator', function () {
      divNo = document.createElement('div')
      divNo.innerHTML = `
        <mip-carousel
          indicatorId="mip-carousel-example1"
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
      `
      document.body.appendChild(divNo)

      expect(divNo.querySelector('#mip-carousel-example1')).to.be.null
    })

    it('should be not ok with wrong indicator', function () {
      divWrong = document.createElement('div')
      divWrong.innerHTML = `
        <mip-carousel
          indicatorId="mip-carousel-example2"
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
        <div class="mip-carousel-indicator-wrapper">
          <div id="mip-carousel-example2">
            <div class="mip-carousel-activeitem mip-carousel-indecator-item"></div>
          </div>
        </div>
      `
      document.body.appendChild(divWrong)

      let indicatorDom = divWrong.querySelector('#mip-carousel-example2')
      expect(indicatorDom.classList.contains('hide')).to.be.true
      expect(window.getComputedStyle(indicatorDom, null).display).to.include('none')
    })

    it('should be ok with correct setting', function () {
      divOk = document.createElement('div')
      divOk.innerHTML = `
        <mip-carousel
          indicatorId="mip-carousel-example3"
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
        <div class="mip-carousel-indicator-wrapper">
          <div class="mip-carousel-indicatorDot" id="mip-carousel-example3">
            <div class="mip-carousel-activeitem mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
          </div>
        </div>
      `
      document.body.appendChild(divOk)

      // render indicator
      indicatorDom = divOk.querySelector('#mip-carousel-example3')
      dotsDom = indicatorDom.querySelectorAll('.mip-carousel-indecator-item')
      expect(dotsDom.length).to.equal(3)
      expect(dotsDom[0].classList.contains('mip-carousel-activeitem')).to.be.true
    })

    it('should change dot indicator by carousel moving', function (done) {
      let wrapBox = divOk.querySelector('div.mip-carousel-wrapper')
      // touchmove
      let event = document.createEvent('Events')
      event.initEvent('touchstart', true, true)
      event.targetTouches = event.touches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = event.touches = [{
        pageX: -60,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)

      setTimeout(function () {
        expect(dotsDom[1].classList.contains('mip-carousel-activeitem')).to.be.true
        done()
      }, 300)
    })

    it('should move when click divOK indicator', function (done) {
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      dotsDom[2].dispatchEvent(event)

      setTimeout(function () {
        expect(dotsDom[2].classList.contains('mip-carousel-activeitem')).to.be.true
        done()
      }, 300)
    })

    it('should be ok with autoplay', function () {
      divOkAuto = document.createElement('div')
      divOkAuto.innerHTML = `
        <mip-carousel
          autoplay
          defer="1000"
          indicatorId="mip-carousel-example4"
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
        <div class="mip-carousel-indicator-wrapper">
          <div class="mip-carousel-indicatorDot" id="mip-carousel-example4">
            <div class="mip-carousel-activeitem mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
          </div>
        </div>
      `
      document.body.appendChild(divOkAuto)

      // render indicator
      indicatorDom = divOkAuto.querySelector('#mip-carousel-example4')
      dotsDom = indicatorDom.querySelectorAll('.mip-carousel-indecator-item')
      expect(dotsDom.length).to.equal(3)
      expect(dotsDom[0].classList.contains('mip-carousel-activeitem')).to.be.true
    })

    it('should move when divOKAuto autoplay', function (done) {
      setTimeout(function () {
        expect(dotsDom[1].classList.contains('mip-carousel-activeitem')).to.be.true
        done()
      }, 1200)
    })

    it('should move when divOKAuto indicator', function (done) {
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      dotsDom[2].dispatchEvent(event)

      setTimeout(function () {
        expect(dotsDom[2].classList.contains('mip-carousel-activeitem')).to.be.true
        done()
      }, 400)
    })

    after(function () {
      document.body.removeChild(divOk)
      document.body.removeChild(divOkAuto)
      document.body.removeChild(divNo)
      document.body.removeChild(divWrong)
    })
  })

  describe('with buttonController', function () {
    let div
    let wrapBox
    let eventClick = document.createEvent('MouseEvents')
    this.timeout(1000)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          buttonController
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should go to next img when click btn', function (done) {
      let nextBtn = div.querySelector('p.mip-carousel-nextBtn')
      eventClick.initEvent('click', true, true)
      nextBtn.dispatchEvent(eventClick)

      wrapBox = div.querySelector('div.mip-carousel-wrapper')
      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-200px, 0px, 0px)')
        done()
      }, 330)
    })

    let preBtn
    it('should go to pre img when click btn', function (done) {
      preBtn = div.querySelector('p.mip-carousel-preBtn')
      eventClick.initEvent('click', true, true)
      preBtn.dispatchEvent(eventClick)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-100px, 0px, 0px)')
        done()
      }, 330)
    })

    it('should go to last img by clicking preBtn', function (done) {
      eventClick.initEvent('click', true, true)
      preBtn.dispatchEvent(eventClick)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-300px, 0px, 0px)')
        done()
      }, 330)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe('with buttonController and autoplay', function () {
    let div
    let eventClick = document.createEvent('MouseEvents')
    let wrapBox
    this.timeout(1000)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          autoplay
          defer="1000"
          buttonController
          width="100"
          height="80">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should go to next img when click btn', function (done) {
      let nextBtn = div.querySelector('p.mip-carousel-nextBtn')
      eventClick.initEvent('click', true, true)
      nextBtn.dispatchEvent(eventClick)

      wrapBox = div.querySelector('div.mip-carousel-wrapper')
      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-200px, 0px, 0px)')
        done()
      }, 330)
    })

    it('should go to pre img when click btn', function (done) {
      let preBtn = div.querySelector('p.mip-carousel-preBtn')
      eventClick.initEvent('click', true, true)
      preBtn.dispatchEvent(eventClick)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-100px, 0px, 0px)')
        done()
      }, 330)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe('with index and switchTo API', function () {
    let div
    let wrapBox
    let indicatorDom
    let dotsDom
    let eventClick = document.createEvent('MouseEvents')
    this.timeout(1000)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          id="carousel"
          autoplay
          defer="1000"
          width="100"
          height="80"
          indicator
          indicatorId="mip-carousel-example5"
          buttonController
          index="2"
        >
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
        <div class="mip-carousel-indicator-wrapper">
          <div class="mip-carousel-indicatorDot" id="mip-carousel-example5">
            <div class="mip-carousel-activeitem mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
          </div>
        </div>
        <div class="mip-carousel-switchBtn" on="tap:carousel.go(3)">
          <p>跳转到第<span>3</span>页</p>
        </div>
      `
      document.body.appendChild(div)
    })

    it('should start from index img', function () {
      wrapBox = div.querySelector('div.mip-carousel-wrapper')
      expect(wrapBox.style.transform).to.equal('translate3d(-200px, 0px, 0px)')

      indicatorDom = div.querySelector('#mip-carousel-example5')
      dotsDom = indicatorDom.querySelectorAll('.mip-carousel-indecator-item')
      expect(dotsDom.length).to.equal(3)
      expect(dotsDom[1].classList.contains('mip-carousel-activeitem')).to.be.true
    })

    it('should switch to certain img when emit tap event', function (done) {
      let switchBtn = div.querySelector('div.mip-carousel-switchBtn')
      eventClick.initEvent('click', true, true)
      switchBtn.dispatchEvent(eventClick)

      setTimeout(function () {
        expect(wrapBox.style.transform).to.equal('translate3d(-300px, 0px, 0px)')
        done()
      }, 330)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })
  // 图片又可能因为不在 viewport 所以一直没加载，所以又要放到 body 的最前面，时间不能设置太短，可能真的没加载
  describe('with lazy loading', function () {
    let div
    this.timeout(2000)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          buttonController
          width="100"
          height="80"
          index="1">
          <mip-img
            src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/P2x1_457e18b.jpg">
          </mip-img>
          <mip-img
            src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
        </mip-carousel>
      `
      let theFirst = document.body.firstChild
      document.body.insertBefore(div, theFirst)
    })
    // 一定要挑一张图片上面的代码都没用到过，并且不能在第一张和最后一张
    it('should not load picture samplePX', function (done) {
      setTimeout(() => {
        let mipImg = div.querySelectorAll('mip-img')[3]
        let img = mipImg.querySelector('img')
        expect(img.getAttribute('src')).to.not.equal('https://www.mipengine.org/static/img/P2x1_457e18b.jpg')
        done()
      }, 500);
    })
    it('should load picture samplePX when swiping', function (done) {
      let eventClick = document.createEvent('MouseEvents')
      let nextBtn = div.querySelector('p.mip-carousel-nextBtn')
      eventClick.initEvent('click', true, true)
      nextBtn.dispatchEvent(eventClick)

      setTimeout(() => {
        let img = div.querySelectorAll('mip-img')[3].querySelector('img')
        expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/P2x1_457e18b.jpg')
        done()
      }, 1500);
    })

    after(function () {
      document.body.removeChild(div)
    })
  })
})
