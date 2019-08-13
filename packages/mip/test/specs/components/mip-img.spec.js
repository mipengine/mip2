/**
 * @file mip-img spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

import dom, {waitForChild} from 'src/util/dom/dom'
import util from 'src/util'
import viewer from 'src/viewer'
import Services, {installTimerService} from 'src/services'

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */

const {event, platform} = util
installTimerService()
const timer = Services.timer()

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
    // Clear popup wrap
    let popup = document.querySelector('.mip-img-popUp-wrapper')
    if (popup) {
      popup.parentElement.removeChild(popup)
    }
  })

  it('should be loading with default placeholder if not define a size', async () => {
    let mipImg = dom.create('<mip-img src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>')
    mipImgWrapper.appendChild(mipImg)
    document.body.appendChild(mipImgWrapper)
    mipImg.viewportCallback(true)
    expect(mipImg.querySelectorAll('.mip-default-placeholder').length).to.be.equal(1)
  })

  it('should be loading with placeholder', async () => {
    let mipImg = dom.create('<mip-img popup src="https://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg"></mip-img>')
    mipImgWrapper.appendChild(mipImg)
    document.body.appendChild(mipImgWrapper)
    mipImg.viewportCallback(true)

    expect(mipImg.querySelector('.mip-default-placeholder')).to.be.exist
    // 等待组件加载完成
    await new Promise(resolve => event.listen(mipImg, 'load', resolve))
    expect(mipImg.querySelector('.mip-default-placeholder')).to.not.exist
  })

  it('should replace src if load img error', async () => {
    mipImgWrapper.innerHTML = `<mip-img popup src="https://www.wrong.org?test=1"></mip-img>`
    let mipImg = mipImgWrapper.querySelector('mip-img')
    mipImg.viewportCallback(true)

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

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    expect(img.getAttribute('src')).to.be.null
    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
  })

  it('should build without src', function () {
    mipImgWrapper.innerHTML = `<mip-img></mip-img>`
    let mipImg = mipImgWrapper.querySelector('mip-img')

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    expect(img.getAttribute('src')).to.be.null
  })

  it('should load img with normal src', function () {
    mipImgWrapper.innerHTML = `
      <mip-img src="https://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg"></mip-img>
    `
    let mipImg = mipImgWrapper.querySelector('mip-img')
    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    let loading = new Promise(resolve => event.listen(img, 'load', resolve))
    expect(img.classList.contains('mip-replaced-content')).to.equal(true)
    expect(img.getAttribute('src')).to.equal('https://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg')
    return loading
  })

  it('should change src and reload img', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_02.jpg')

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_03.jpg')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_03.jpg')
  })

  it('should produce img but not call connectedCallback again', function () {
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_01.jpg')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://www.mipengine.org/static/img/sample_02.jpg')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)
    mipImgWrapper.removeChild(mipImg)
    mipImgWrapper.appendChild(mipImg)
    let img = mipImg.querySelector('img')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_02.jpg')
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

    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')
    expect(mipImg.getAttribute('width')).to.equal('100px')
    expect(mipImg.getAttribute('height')).to.equal('100px')
    expect(mipImg.getAttribute('popup')).to.equal('true')
    expect(img.getAttribute('src')).to.equal('https://www.mipengine.org/static/img/sample_01.jpg')
    expect(img.getAttribute('alt')).to.equal('baidu mip img')
    expect(mipImg.querySelector('div.mip-placeholder')).to.be.null
  })

  it('should popup and close the popup', async () => {
    let mipImg = document.createElement('mip-img')
    let carou = document.createElement('mip-carousel')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://boscdn.baidu.com/assets/mipengine/wide.jpg')
    mipImg.setAttribute('popup', 'true')
    // carousel for triggering open-popup and close-popup event
    carou.appendChild(mipImg)
    mipImgWrapper.appendChild(carou)

    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')
    // 等图片加载完成
    await new Promise(resolve => event.listen(img, 'load', resolve))
    let evt = document.createEvent('MouseEvents')
    evt.initEvent('click', true, true)
    img.dispatchEvent(evt)
    // 等待 popup 生成
    await waitForChild(document.body, body => body.querySelector('mip-carousel'))
    let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')
    expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
    expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
    expect(mipPopWrap.tagName).to.equal('DIV')
    expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
    let carousel = mipPopWrap.querySelector('mip-carousel')
    expect(carousel).to.be.exist

    // 等待 carousel 生成
    await waitForChild(carousel, carousel => carousel.querySelector('.mip-carousel-wrapper'))
    mipPopWrap.dispatchEvent(evt)
    // 等待 popup 完全关闭
    await timer.sleep(500)
    expect(mipPopWrap.style.display).to.equal('none')
    mipImgWrapper.removeChild(carou)
  }).timeout(5000)

  it('should not popup if the image is not loaded', async () => {
    mipImgWrapper.innerHTML = `<mip-img popup src="https://www.wrong.org?test=1"></mip-img>`
    let mipImg = mipImgWrapper.querySelector('mip-img')
    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    let evt = document.createEvent('MouseEvents')
    evt.initEvent('click', true, true)
    img.dispatchEvent(evt)
    await timer.sleep(500)
    expect(document.querySelector('.mip-img-popUp-wrapper')).to.not.exist
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

    mipImg.viewportCallback(true)

    let evt = document.createEvent('Event')
    evt.initEvent('resize', true, true)
    window.dispatchEvent(evt)
  })
  it('with special image popuping should popup', async () => {
    // 针对长图的大图浏览代码测试，其实只需要设置一张特殊的图即可。
    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png')
    mipImg.setAttribute('popup', 'true')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')
    // 等图片加载完成
    await new Promise(resolve => event.listen(img, 'load', resolve))
    let evt = document.createEvent('MouseEvents')
    evt.initEvent('click', true, true)
    img.dispatchEvent(evt)

    // 等待 popup 生成
    await waitForChild(document.body, body => body.querySelector('mip-carousel'))
    let mipPopWrap = document.querySelector('.mip-img-popUp-wrapper')
    expect(mipPopWrap.getAttribute('data-name')).to.equal('mip-img-popUp-name')
    expect(mipPopWrap.parentNode.tagName).to.equal('BODY')
    expect(mipPopWrap.tagName).to.equal('DIV')

    // 等待 carousel 生成
    await waitForChild(mipPopWrap, mipPopWrap => mipPopWrap.querySelector('mip-carousel'))
    expect(mipPopWrap.querySelector('.mip-img-popUp-bg')).to.be.exist
    expect(mipPopWrap.querySelector('mip-carousel')).to.be.exist
    expect(mipPopWrap.querySelector('mip-carousel').getAttribute('index')).to.equal('1')

    // 等待 carousel 生成
    let carousel = mipPopWrap.querySelector('mip-carousel')
    await waitForChild(carousel, carousel => carousel.querySelector('.mip-carousel-wrapper'))
    mipPopWrap.dispatchEvent(evt)
    // 等待 popup 完全关闭
    await timer.sleep(500)
    expect(mipPopWrap.style.display).to.equal('none')
  }).timeout(4000)
  it('should invoke image browser in BaiduApp when the popup image is clicked', async () => {
    let appStub = sinon.stub(platform, 'isBaiduApp')
    appStub.callsFake(() => true)

    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png')
    mipImg.setAttribute('popup', 'true')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    // 等图片加载完成
    await new Promise(resolve => event.listen(img, 'load', resolve))
    let evt = document.createEvent('MouseEvents')
    evt.initEvent('click', true, true)
    img.dispatchEvent(evt)

    appStub.restore()
    return waitForChild(document.body, body => body.querySelector('iframe'))
  })
  it('should invoke image browser in ios BaiduApp when the image is long pressed', async () => {
    let appStub = sinon.stub(platform, 'isBaiduApp')
    let iframeStub = sinon.stub(viewer, 'isIframed')
    let iosStub = sinon.stub(platform, 'isIOS')
    appStub.callsFake(() => true)
    iframeStub.callsFake(() => true)
    iosStub.callsFake(() => true)

    let mipImg = document.createElement('mip-img')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png')
    mipImgWrapper.appendChild(mipImg)

    mipImg.viewportCallback(true)
    let img = mipImg.querySelector('img')
    // 等图片加载完成
    await new Promise(resolve => event.listen(img, 'load', resolve))
    let evt = new Event('touchstart')
    img.dispatchEvent(evt)

    appStub.restore()
    iframeStub.restore()
    iosStub.restore()
    return waitForChild(document.body, body => body.querySelector('iframe')).then(() => {
      let evt = new Event('touchend')
      img.dispatchEvent(evt)
      evt = new Event('touchmove')
      img.dispatchEvent(evt)
    })
  }).timeout(4000)
  it('should work with source tag', async () => {
    let mipImg = document.createElement('mip-img')
    let source = document.createElement('source')
    source.setAttribute('srcset', 'https://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg')
    mipImg.setAttribute('width', '100px')
    mipImg.setAttribute('height', '100px')
    mipImg.setAttribute('src', 'https://boscdn.baidu.com/v1/assets/mip/mip2-component-lifecycle.png')
    mipImg.setAttribute('popup', 'true')
    mipImg.appendChild(source)
    mipImgWrapper.appendChild(mipImg)
    mipImg.viewportCallback(true)

    let img = mipImg.querySelector('img')
    let loading = new Promise(resolve => event.listen(img, 'load', resolve))
    expect(mipImg.querySelector('picture')).to.be.exist
    await loading
    expect(img.currentSrc).to.equal('https://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg')
  })
})
