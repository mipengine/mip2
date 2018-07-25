/**
 * @file mip-img spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after */

describe('mip-img', function () {
  describe('need placeholder with holding src', function () {
    let mipImgWrapper

    before(function () {
      mipImgWrapper = document.createElement('div')
      mipImgWrapper.style.width = '100px'
      mipImgWrapper.style.height = '100px'
      mipImgWrapper.innerHTML = `
        <mip-img src="https://www.mipengine.org/static/img/wrong_address.jpg?mip_img_ori=1">
      `
      document.body.appendChild(mipImgWrapper)
    })

    it('should be loading with placeholder', function () {
      let mipImg = mipImgWrapper.querySelector('mip-img')
      let img = mipImg.querySelector('img')
      expect(img.classList.contains('mip-img-loading')).to.equal(true)
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/wrong_address.jpg?mip_img_ori=1')

      let placeholder = mipImg.querySelector('div.mip-placeholder')
      expect(placeholder.classList.contains('mip-placeholder-jpg')).to.equal(true)
    })

    after(function () {
      document.body.removeChild(mipImgWrapper)
    })
  })

  describe('need placeholder with srcset', function () {
    let mipImgWrapper

    before(function () {
      mipImgWrapper = document.createElement('div')
      mipImgWrapper.style.width = '100px'
      mipImgWrapper.style.height = '100px'
      mipImgWrapper.innerHTML = `
        <mip-img srcset="https://www.mipengine.org/static/img/wrong_address1.jpg 1x, https://www.mipengine.org/static/img/swrong_address2.jpg 2x, https://www.mipengine.org/static/img/wrong_address3.jpg 3x">
      `
      document.body.appendChild(mipImgWrapper)
    })

    it('should be loading with placeholder', function () {
      let mipImg = mipImgWrapper.querySelector('mip-img')
      let img = mipImg.querySelector('img')
      console.log(img.getAttribute('src'))
      // expect(img.classList.contains('mip-img-loading')).to.equal(true)
      // expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      // expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/wrong_address.jpg')

      let placeholder = mipImg.querySelector('div.mip-placeholder')
      expect(placeholder.classList.contains('mip-placeholder-jpg')).to.equal(true)
    })

    after(function () {
      document.body.removeChild(mipImgWrapper)
    })
  })

  describe('need placeholder with no src', function () {
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

  describe('need placeholder with will-be-finished src', function (done) {
    let mipImgWrapper

    before(function () {
      mipImgWrapper = document.createElement('div')
      mipImgWrapper.style.width = '100px'
      mipImgWrapper.style.height = '100px'
      mipImgWrapper.innerHTML = `
        <mip-img src="https://www.mipengine.org/static/img/sample_01.jpg">
      `
      document.body.appendChild(mipImgWrapper)
    })

    it('should load img with placeholder', function () {
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
    })

    after(function () {
      document.body.removeChild(mipImgWrapper)
    })
  })

  describe('changable src', function () {
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

    after(function () {
      document.body.removeChild(mipImg)
    })
  })

  describe('img with full setting', function () {
    let mipImg

    before(function () {
      mipImg = document.createElement('mip-img')
      mipImg.setAttribute('width', '100px')
      mipImg.setAttribute('height', '100px')
      mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
      mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
      mipImg.setAttribute('popup', 'true')
      mipImg.setAttribute('alt', 'baidu mip img')
      document.body.appendChild(mipImg)

      let img = mipImg.querySelector('img')
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      // event.data = data
      img.dispatchEvent(event)
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
    })

    after(function () {
      document.body.removeChild(mipImg)
    })
  })
})
