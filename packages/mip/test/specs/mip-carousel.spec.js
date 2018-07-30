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
    this.timeout(200)

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          autoplay
          defer="50"
          width="100"
          height="80">
        <a target="_blank" href="http://wenda.tianya.cn/m/question/1almfj0foas94gc7vtoq6ejbfbmdk3e78ehaa">
            <mip-img
                src="https://www.mipengine.org/static/img/sample_01.jpg" layout="responsive"
            width="600"
            height="400">
            </mip-img>
            <div class="mip-carousle-subtitle">这里是title2</div>
          </a>
          <mip-img popup
              src="https://www.mipengine.org/static/img/sample_01.jpg">
          </mip-img>
          <mip-img
              src="https://www.mipengine.org/static/img/sample_02.jpg">
          </mip-img>
          <mip-img
              src="https://www.mipengine.org/static/img/sample_03.jpg">
          </mip-img>
          <mip-i-space></mip-i-space>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should produce mip-carousel correctly', function () {
      let mipCarousel = div.querySelector('mip-carousel')
    })

    it('should autoplay', function () {

    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe('autoplay with default defer', function () {
    let div
    this.timeout(5000)

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
          <mip-i-space></mip-i-space>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should produce mip-carousel correctly', function () {
      let mipCarousel = div.querySelector('mip-carousel')
    })

    it('should autoplay', function () {

    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe.skip('with number/default indicator', function () {
    let div

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
          <mip-i-space></mip-i-space>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('', function () {

    })

    it.skip('should not move when vertically scrolling', function () {
      let wrapBox = div.querySelector('div.mip-carousel-wrapper')
      var event = document.createEvent('Events')
      event.initEvent('touchstart', true, true)
      event.targetTouches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = [{
        pageX: 0,
        pageY: 30
      }]
      wrapBox.dispatchEvent(event)
    })

    it('should move to next img when touch', function () {
      let wrapBox = div.querySelector('div.mip-carousel-wrapper')
      var event = document.createEvent('Events')
      event.initEvent('touchstart', true, true)
      event.targetTouches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = [{
        pageX: 30,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)
    })

    it.skip('should not move when touch diff is too small', function () {
      let wrapBox = div.querySelector('div.mip-carousel-wrapper')
      var event = document.createEvent('Events')
      event.initEvent('touchstart', true, true)
      event.targetTouches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = [{
        pageX: 1,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)
    })

    it('should move to another direction', function () {
      let wrapBox = div.querySelector('div.mip-carousel-wrapper')
      var event = document.createEvent('Events')
      event.initEvent('touchstart', true, true)
      event.targetTouches = [{
        pageX: 0,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchmove', true, true)
      event.targetTouches = [{
        pageX: -30,
        pageY: 0
      }]
      wrapBox.dispatchEvent(event)

      event.initEvent('touchend', true, true)
      wrapBox.dispatchEvent(event)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe.skip('with customized indicator', function () {
    let div

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          indicator
          indicatorId="mip-carousel-example"
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
          <mip-i-space></mip-i-space>
        </mip-carousel>
        <div class="mip-carousel-indicator-wrapper">
          <div class="mip-carousel-indicatorDot" id="mip-carousel-example">
            <div class="mip-carousel-activeitem mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
            <div class="mip-carousel-indecator-item"></div>
          </div>
        </div>
      `
      document.body.appendChild(div)
    })

    it('', function () {
    })

    after(function () {
      document.body.removeChild(div)
    })
  })

  describe('with buttonController', function () {
    let div

    before(function () {
      div = document.createElement('div')
      div.innerHTML = `
        <mip-carousel
          indicator
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
          <mip-i-space></mip-i-space>
        </mip-carousel>
      `
      document.body.appendChild(div)
    })

    it('should go to next img when click btn', function () {
      let nextBtn = div.querySelector('p.mip-carousel-nextBtn')
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      nextBtn.dispatchEvent(event)
    })

    after(function () {
      document.body.removeChild(div)
    })
  })
})
