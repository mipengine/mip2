/**
 * @file mip-img spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

import dom from 'src/util/dom/dom'

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */

describe('mip-img', function () {
  let mipImgWrapper

  beforeEach(() => {
    mipImgWrapper = document.createElement('div')
    mipImgWrapper.style.width = '100px'
    mipImgWrapper.style.height = '100px'
    document.body.appendChild(mipImgWrapper)
  })

  afterEach(function () {
    document.body.removeChild(mipImgWrapper)
  })

  after(() => {
    // Clear popup wrap
    let popup = document.querySelector('.mip-img-popUp-wrapper')
    if (popup) {
      popup.parentElement.removeChild(popup)
    }
  })

  it('should be loading with placeholder', function () {
    let mipImg = dom.create('<mip-img popup src="https://www.wrong.org?mip_img_ori=1"></mip-img>')
    mipImgWrapper.appendChild(mipImg)
    document.body.appendChild(mipImgWrapper)

    return mipImg._resources.updateState().then(() => {
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
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.equal('https://www.wrong.org?mip_img_ori=1')

      img.addEventListener('error', () => {
        expect(img.src).to.equal('https://www.wrong.org/?mip_img_ori=1')
      }, false)
      let errEvent = new Event('error')
      img.dispatchEvent(errEvent)
    })
  })

  it('should replace src if load img error', async function () {
    mipImgWrapper.innerHTML = `<mip-img popup src="https://www.wrong.org?test=1"></mip-img>`
    let mipImg = mipImgWrapper.querySelector('mip-img')
    await mipImg._resources.updateState()
    let img = mipImg.querySelector('img')

    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    expect(img.getAttribute('src')).to.equal('https://www.wrong.org?test=1')

    await new Promise(resolve => {
      img.addEventListener('error', resolve)
      let errEvent = new Event('error')
      img.dispatchEvent(errEvent)
    })
    expect(img.src).to.equal('https://www.wrong.org/?test=1&mip_img_ori=1')
  })

  it('should work with srcset', function () {
    mipImgWrapper.innerHTML = `
      <mip-img srcset="https://www.mipengine.org/static/img/wrong_address1.jpg 1x,
        https://www.mipengine.org/static/img/swrong_address2.jpg 2x,
        https://www.mipengine.org/static/img/wrong_address3.jpg 3x">
      </mip-img>
    `
    let mipImg = mipImgWrapper.querySelector('mip-img')

    return mipImg._resources.updateState().then(() => {
      let img = mipImg.querySelector('img')
      expect(img.getAttribute('src')).to.be.null
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    })
  })

  it('should build without src', function () {
    mipImgWrapper.innerHTML = `<mip-img></mip-img>`
    let mipImg = mipImgWrapper.querySelector('mip-img')

    return mipImg._resources.updateState().then(() => {
      let img = mipImg.querySelector('img')
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.be.null
    })
  })

  it('should load img with normal src', function () {
    mipImgWrapper.innerHTML = `
      <mip-img src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>
    `
    let mipImg = mipImgWrapper.querySelector('mip-img')
    return mipImg._resources.updateState().then(() => {
      let img = mipImg.querySelector('img')
      expect(img.classList.contains('mip-replaced-content')).to.equal(true)
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')
    })
  })

  it('should change src and reload img', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_02.jpg')

    mipImg._resources.updateState().then(() => {
      let img = mipImg.querySelector('img')
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
      mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_03.jpg')
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_03.jpg')
    })
  })

  it('should produce img but not call connectedCallback again', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_02.jpg')
    mipImgWrapper.appendChild(mipImg)

    return mipImg._resources.updateState().then(() => {
      mipImgWrapper.removeChild(mipImg)
      mipImgWrapper.appendChild(mipImg)
      let img = mipImg.querySelector('img')
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
    })
  })

  it('should set props correctly', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    return mipImg._resources.updateState().then(() => {
      let img = mipImg.querySelector('img')
      expect(mipImg.getAttribute('width')).to.equal('100px')
      expect(mipImg.getAttribute('height')).to.equal('100px')
      expect(mipImg.getAttribute('popup')).to.equal('true')
      expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')
      expect(img.getAttribute('alt')).to.equal('baidu mip img')
      expect(mipImg.querySelector('div.mip-placeholder')).to.be.null
    })
  })

  it('should popup', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    return mipImg._resources.updateState().then(() => {
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
  })
  it('should resize popup according to window resizing', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('srcset', 'https://www.mipengine.org/static/img/sample_01.jpg 1x, https://www.mipengine.org/static/img/sample_01.jpg 2x, https://www.mipengine.org/static/img/sample_01.jpg 3x')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    return mipImg._resources.updateState().then(() => {
      let event = document.createEvent('Event')
      event.initEvent('resize', true, true)
      window.dispatchEvent(event)
    })
  })
  it('with special image popuping should popup', function () {
    // 针对长图的大图浏览代码测试，其实只需要设置一张特殊的图即可。
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png')
    mipImg.setAttribute('popup', 'true')
    mipImg.setAttribute('alt', 'baidu mip img')
    mipImgWrapper.appendChild(mipImg)

    return mipImg._resources.updateState().then(() => {
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
  })
})
