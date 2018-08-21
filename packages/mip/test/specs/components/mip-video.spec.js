/**
 * @file mip-video spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */

import MipVideo from 'src/components/mip-video'

function getAttributeSet (attributes) {
  let attrs = {}
  Array.prototype.slice.apply(attributes).forEach(function (attr) {
    attrs[attr.name] = attr.value
  })
  return attrs
}

describe('mip-video', function () {
  describe('mip-video videoNoHttps', function () {
    let mipVideo
    before(function () {
      mipVideo = document.createElement('mip-video')
      mipVideo.setAttribute('width', '100px')
      mipVideo.setAttribute('height', '100px')
      mipVideo.setAttribute('src', 'http://mip-doc.bj.bcebos.com/sample_video.mp4')
      document.body.appendChild(mipVideo)
    })

    it('produce video 1', function () {
      let video = mipVideo.querySelector('video')
      expect(video.classList.contains('mip-replaced-content')).to.equal(true)
      expect(video.getAttribute('playsinline')).to.equal('playsinline')
      expect(video.getAttribute('webkit-playsinline')).to.equal('webkit-playsinline')
      expect(video.getAttribute('t7-video-player-type')).to.equal('inline')
      expect(video.getAttribute('width')).to.equal('100px')
      expect(video.getAttribute('height')).to.equal('100px')
    })

    after(function () {
      document.body.removeChild(mipVideo)
    })
  })

  describe('mip-video full setting', function () {
    let mipVideo

    before(function () {
      mipVideo = document.createElement('mip-video')
      mipVideo.setAttribute('id', 'mip-video-test')
      mipVideo.setAttribute('controls', 'true')
      mipVideo.setAttribute('loop', 'true')
      mipVideo.setAttribute('muted', 'true')
      mipVideo.setAttribute('currenttime', 2)
      mipVideo.setAttribute('autoplay', 'true')
      mipVideo.setAttribute('width', '100px')
      mipVideo.setAttribute('height', '100px')
      mipVideo.setAttribute('src', 'https://mip-doc.bj.bcebos.com/sample_video.mp4')
      mipVideo.setAttribute('poster', 'https://www.mipengine.org/static/img/sample_04.jpg')
      mipVideo.innerHTML = `
        <mip-i-space></mip-i-space>
        <source
          src="https://mip-doc.bj.bcebos.com/sample_video.webm"
          type="video/webm">
        <source
          src="https://mip-doc.bj.bcebos.com/sample_video.mp4"
          type="video/mp4">
        <source
          src="http://mip-doc.bj.bcebos.com/sample_video.ogv"
          type="video/ogg">
      `
      document.body.appendChild(mipVideo)
    })

    it('produce video 2', function () {
      let video = mipVideo.querySelector('video')
      expect(video.classList.contains('mip-replaced-content')).to.equal(true)
      expect(video.getAttribute('playsinline')).to.equal('playsinline')
      expect(video.getAttribute('webkit-playsinline')).to.equal('webkit-playsinline')
      expect(video.getAttribute('t7-video-player-type')).to.equal('inline')
      expect(video.getAttribute('controls')).to.equal('true')
      expect(video.getAttribute('loop')).to.equal('true')
      expect(video.getAttribute('muted')).to.equal('true')
      expect(video.getAttribute('currenttime')).to.equal('2')
      expect(video.getAttribute('autoplay')).to.equal('true')
      expect(video.getAttribute('width')).to.equal('100px')
      expect(video.getAttribute('height')).to.equal('100px')
      expect(video.getAttribute('poster')).to.equal('https://www.mipengine.org/static/img/sample_04.jpg')

      let sources = video.querySelectorAll('source')
      expect(sources.length).to.equal(3)
    })

    it('should change current time by loadedmetadata event', function () {
      let video = mipVideo.querySelector('video')
      let event = new Event('loadedmetadata')
      video.dispatchEvent(event)
    })

    it('should change current time by seekTo API', function () {
      let p = document.createElement('p')
      p.setAttribute('on', 'click:mip-video-test.seekTo(2)')
      p.textContent = 'click me'
      document.body.appendChild(p)

      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      p.dispatchEvent(event)

      let videoEl = mipVideo.querySelector('video')
      expect(videoEl.currentTime).to.equal(2)
    })
    // 由于谷歌浏览器对video播放有严格的限制（只能人为play，不能js模拟），所以跳过测试。
    it.skip('should pause when the pause button is clicked', function () {
      let button = document.createElement('button')
      button.setAttribute('on', 'click:mip-video-test.pause')
      button.textContent = 'click to pause the video'
      document.body.appendChild(button)

      let videoEl = mipVideo.querySelector('video')
      videoEl.play()
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      button.dispatchEvent(event)
      expect(videoEl.paused).to.be.true
    })

    it.skip('should play when the play button is clicked', function () {
      let button = document.createElement('button')
      button.setAttribute('on', 'click:mip-video-test.play')
      button.textContent = 'click to play the video'
      document.body.appendChild(button)

      let videoEl = mipVideo.querySelector('video')
      videoEl.pause()
      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      button.dispatchEvent(event)
      expect(videoEl.paused).to.be.false
    })

    after(function () {
      document.body.removeChild(mipVideo)
    })
  })

  describe('mip-video sourcesAllHttps', function () {
    let mipVideo

    before(function () {
      mipVideo = document.createElement('mip-video')
      mipVideo.setAttribute('width', '100px')
      mipVideo.setAttribute('height', '100px')
      mipVideo.setAttribute('src', 'https://mip-doc.bj.bcebos.com/sample_video.mp4')
      mipVideo.innerHTML = `
        <source
          src="https://mip-doc.bj.bcebos.com/sample_video.webm"
          type="video/webm">
        <source
          src="https://mip-doc.bj.bcebos.com/sample_video.mp4"
          type="video/mp4">
        <source
          src="https://mip-doc.bj.bcebos.com/sample_video.ogv"
          type="video/ogg">
      `
      document.body.appendChild(mipVideo)
    })

    it('should renderPlayElsewhere with poster', function () {
      let div = document.createElement('div')
      div.setAttribute('controls', 'true')
      div.setAttribute('loop', 'true')
      div.setAttribute('muted', 'true')
      div.setAttribute('autoplay', 'true')
      div.setAttribute('width', '100px')
      div.setAttribute('height', '100px')
      div.setAttribute('src', 'https://mip-doc.bj.bcebos.com/sample_video.mp4')
      div.setAttribute('poster', 'https://www.mipengine.org/static/img/sample_04.jpg')

      let _mipVideo = new MipVideo()
      _mipVideo.attributes = getAttributeSet(div.attributes)
      _mipVideo.element = document.body
      _mipVideo.sourceDoms = mipVideo.querySelectorAll('source')
      let videoEl = _mipVideo.renderPlayElsewhere()

      expect(videoEl.tagName).to.equal('DIV')
      expect(videoEl.classList.contains('mip-video-poster')).to.be.true
      expect(videoEl.style.backgroundImage).to.equal('url("https://www.mipengine.org/static/img/sample_04.jpg")')
      expect(videoEl.style.backgroundSize).to.equal('cover')
      expect(videoEl.dataset.videoSrc).to.equal('https://mip-doc.bj.bcebos.com/sample_video.mp4')

      expect(videoEl.querySelector('span').classList.contains('mip-video-playbtn')).to.be.true
    })

    it('should renderPlayElsewhere without poster and sources', function () {
      let div = document.createElement('div')
      div.setAttribute('controls', 'true')
      div.setAttribute('width', '100px')
      div.setAttribute('height', '100px')
      div.setAttribute('src', 'https://mip-doc.bj.bcebos.com/sample_video.mp4')

      let _mipVideo = new MipVideo()
      _mipVideo.attributes = getAttributeSet(div.attributes)
      _mipVideo.element = document.body
      _mipVideo.sourceDoms = []
      let videoEl = _mipVideo.renderPlayElsewhere()

      let event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      videoEl.dispatchEvent(event)

      expect(videoEl.tagName).to.equal('DIV')
      expect(videoEl.style.backgroundImage).to.be.empty
      expect(videoEl.querySelector('span').classList.contains('mip-video-playbtn')).to.be.true
    })

    it('should renderError with a picture', function () {
      let div = document.createElement('div')
      div.setAttribute('controls', 'true')
      div.setAttribute('width', '100px')
      div.setAttribute('height', '100px')
      div.setAttribute('poster', 'https://www.mipengine.org/static/img/sample_04.jpg')
      div.setAttribute('src', 'https://mip-doc.bj.bcebos.com/sample_video.mp4')

      let _mipVideo = new MipVideo()
      _mipVideo.attributes = getAttributeSet(div.attributes)
      _mipVideo.element = document.body
      _mipVideo.sourceDoms = []
      let videoEl = _mipVideo.renderError()

      expect(videoEl.tagName).to.equal('DIV')
      expect(videoEl.style.backgroundImage).to.equal('url("https://www.mipengine.org/static/img/sample_04.jpg")')
      expect(videoEl.querySelector('span').classList.contains('mip-video-error')).to.be.true
    })

    after(function () {
      document.body.removeChild(mipVideo)
    })
  })
})
