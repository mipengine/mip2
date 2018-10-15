/**
 * @file mip-img spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */

describe('mip-img', function () {
  describe('with holding src', function () {
    let mipImgWrapper

    before(function () {
      mipImgWrapper = document.createElement('div')
      mipImgWrapper.style.width = '100px'
      mipImgWrapper.style.height = '100px'
      mipImgWrapper.innerHTML = `
        <mip-img popup src="https://www.wrong.org?mip_img_ori=1"></mip-img>
      `
      document.body.appendChild(mipImgWrapper)
    })

    it('should be loading with placeholder', function () {
      let mipImg = mipImgWrapper.querySelector('mip-img')
      let img = mipImg.querySelector('img')

      // ask to popup before loaded
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      img.dispatchEvent(event)

      // expect popup to be created
      let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')
      expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
      expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
      expect(mipPopWrap.tagName).to.equal('DIV')
      expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
      expect(mipPopWrap.querySelector('mip-carousel')).to.be.exist

      // img
      expect(img.classList.contains('mip-img-loading')).to.equal(true)
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.equal('https://www.wrong.org?mip_img_ori=1')

      img.addEventListener('error', () => {
        expect(img.src).to.equal('https://www.wrong.org/?mip_img_ori=1')
      }, false)
      let errEvent = new Event('error')
      img.dispatchEvent(errEvent)

      let placeholder = mipImg.querySelector('div.mip-placeholder')
      expect(placeholder.classList.contains('mip-placeholder-other')).to.equal(true)
    })

    after(function () {
      document.body.removeChild(mipImgWrapper)
      document.body.removeChild(document.querySelector('.mip-img-popUp-wrapper'))
    })
  })

  describe('with holding src2', function () {
    let mipImgWrapper

    before(function () {
      mipImgWrapper = document.createElement('div')
      mipImgWrapper.style.width = '100px'
      mipImgWrapper.style.height = '100px'
      mipImgWrapper.innerHTML = `
        <mip-img popup src="https://www.wrong.org?test=1"></mip-img>
      `
      document.body.appendChild(mipImgWrapper)
    })

    it('should be loading with placeholder', function () {
      let mipImg = mipImgWrapper.querySelector('mip-img')
      let img = mipImg.querySelector('img')

      expect(img.classList.contains('mip-img-loading')).to.equal(true)
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.equal('https://www.wrong.org?test=1')

      img.addEventListener('error', () => {
        expect(img.src).to.equal('https://www.wrong.org/?test=1&mip_img_ori=1')
      }, false)
      let errEvent = new Event('error')
      img.dispatchEvent(errEvent)

      let placeholder = mipImg.querySelector('div.mip-placeholder')
      expect(placeholder.classList.contains('mip-placeholder-other')).to.equal(true)
    })

    after(function () {
      document.body.removeChild(mipImgWrapper)
    })
  })

  describe('with srcset', function () {
    let mipImgWrapper

    before(function () {
      mipImgWrapper = document.createElement('div')
      mipImgWrapper.style.width = '100px'
      mipImgWrapper.style.height = '100px'
      mipImgWrapper.innerHTML = `
        <mip-img srcset="https://www.mipengine.org/static/img/wrong_address1.jpg 1x, https://www.mipengine.org/static/img/swrong_address2.jpg 2x, https://www.mipengine.org/static/img/wrong_address3.jpg 3x"></mip-img>
      `
      document.body.appendChild(mipImgWrapper)
    })

    it('should be loading with placeholder', function () {
      let mipImg = mipImgWrapper.querySelector('mip-img')
      let img = mipImg.querySelector('img')
      expect(img.getAttribute('src')).to.be.null
      expect(img.classList.contains('mip-img-loading')).to.equal(true)
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)

      let placeholder = mipImg.querySelector('div.mip-placeholder')
      expect(placeholder.classList.contains('mip-placeholder-jpg')).to.equal(true)
    })

    after(function () {
      document.body.removeChild(mipImgWrapper)
    })
  })

  describe('with no src', function () {
    let mipImg

    before(function () {
      mipImg = document.createElement('mip-img')
      document.body.appendChild(mipImg)
    })

    it('should be loading with placeholder', function () {
      let img = mipImg.querySelector('img')
      expect(img.classList.contains('mip-img-loading')).to.equal(true)
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.be.null

      let placeholder = mipImg.querySelector('div.mip-placeholder')
      expect(placeholder.classList.contains('mip-placeholder-other')).to.equal(true)
    })

    after(function () {
      document.body.removeChild(mipImg)
    })
  })

  describe('with will-be-finished src', function () {
    let mipImgWrapper

    before(function () {
      mipImgWrapper = document.createElement('div')
      mipImgWrapper.style.width = '100px'
      mipImgWrapper.style.height = '100px'
      mipImgWrapper.innerHTML = `
        <mip-img src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>
      `
      document.body.appendChild(mipImgWrapper)
    })

    it('should load img with placeholder', function (done) {
      let mipImg = mipImgWrapper.querySelector('mip-img')
      let img = mipImg.querySelector('img')
      expect(img.classList.contains('mip-img-loading')).to.equal(true)
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')

      let placeholder = mipImg.querySelector('div.mip-placeholder')
      expect(placeholder.classList.contains('mip-placeholder-jpg')).to.equal(true)

      img.addEventListener('load', function () {
        expect(img.classList.contains('mip-img-loading')).to.equal(false)
        expect(mipImg.classList.contains('mip-img-loaded')).to.equal(true)
        expect(mipImg.querySelector('div.mip-placeholder')).to.be.null
        done()
      }, false)
      let errEvent = new Event('load')
      img.dispatchEvent(errEvent)
    })

    after(function () {
      document.body.removeChild(mipImgWrapper)
    })
  })

  describe('with changable src', function () {
    let mipImg

    before(function () {
      mipImg = document.createElement('mip-img')
      mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
      mipImg.setAttribute('width', '100px')
      mipImg.setAttribute('height', '100px')
      document.body.appendChild(mipImg)

      mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_02.jpg')
    })

    it('should change src and reload img', function () {
      let img = mipImg.querySelector('img')
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
    })

    it('should produce img but not call connectedCallback again', function () {
      document.body.removeChild(mipImg)
      document.body.appendChild(mipImg)

      let img = mipImg.querySelector('img')
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
    })

    after(function () {
      document.body.removeChild(mipImg)
    })
  })

  describe('with full setting', function () {
    let mipImg

    before(function () {
      mipImg = document.createElement('mip-img')
      mipImg.setAttribute('width', '100px')
      mipImg.setAttribute('height', '100px')
      mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
      mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
      mipImg.setAttribute('popup', 'true')
      mipImg.setAttribute('alt', 'baidu mip img')
      let theFirst = document.body.firstChild
      document.body.insertBefore(mipImg, theFirst)
    })

    it('should set props correctly', function () {
      let img = mipImg.querySelector('img')

      expect(mipImg.getAttribute('width')).to.equal('100px')
      expect(mipImg.getAttribute('height')).to.equal('100px')
      expect(mipImg.getAttribute('popup')).to.equal('true')
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')
      expect(img.getAttribute('alt')).to.equal('baidu mip img')

      expect(mipImg.querySelector('div.mip-placeholder')).to.be.null
    })

    it('should popup', function () {
      let img = mipImg.querySelector('img')
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      img.dispatchEvent(event)

      let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')
      mipPopWrap.dispatchEvent(event)

      expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
      expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
      expect(mipPopWrap.tagName).to.equal('DIV')
      expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
      expect(mipPopWrap.querySelector('mip-carousel')).to.be.exist
      expect(mipPopWrap.querySelector('mip-carousel').getAttribute('index')).to.equal('1')
    })

    it('should resize popup according to window resizing', function () {
      let event = document.createEvent('Event')
      event.initEvent('resize', true, true)
      window.dispatchEvent(event)
    })

    after(function () {
      document.body.removeChild(mipImg)
    })
  })

  describe('with special image popuping', function () {
    // 针对长图的大图浏览代码测试，其实只需要设置一张特殊的图即可。
    let mipImg
    before(function () {
      mipImg = document.createElement('mip-img')
      mipImg.setAttribute('width', '100px')
      mipImg.setAttribute('height', '100px')
      mipImg.setAttribute('src', 'https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png')
      mipImg.setAttribute('popup', 'true')
      mipImg.setAttribute('alt', 'baidu mip img')
      let theFirst = document.body.firstChild
      document.body.insertBefore(mipImg, theFirst)
    })

    it('should popup', function () {
      let img = mipImg.querySelector('img')
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      img.dispatchEvent(event)

      let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')
      mipPopWrap.dispatchEvent(event)

      expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
      expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
      expect(mipPopWrap.tagName).to.equal('DIV')
      expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
      expect(mipPopWrap.querySelector('mip-carousel')).to.be.exist
      expect(mipPopWrap.querySelector('mip-carousel').getAttribute('index')).to.equal('1')
    })

    after(function () {
      document.body.removeChild(mipImg)
    })
  })
  after(function () {
    document.body.removeChild(document.querySelector('.mip-img-popUp-wrapper'))
  })
})
