/**
 * @file mip-iframe spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */

import {
  CUSTOM_EVENT_RESIZE_PAGE,
  MESSAGE_MIPIFRAME_RESIZE
} from 'src/page/const'

import viewport from 'src/viewport'

describe('mip-iframe', function () {
  let mipIframe
  let iframe

  describe('iframe with default width and attrs', function () {
    this.timeout(1200)
    before(function () {
      mipIframe = document.createElement('mip-iframe')
      mipIframe.setAttribute('srcdoc', '<p>Hello MIP!</p>')
      mipIframe.setAttribute('height', '100%')
      mipIframe.setAttribute('allowfullscreen', 'true')
      mipIframe.setAttribute('allowtransparency', 'true')
      document.body.appendChild(mipIframe)
    })

    it('should produce iframe with height 100%', function (done) {
      iframe = mipIframe.querySelector('iframe')
      setTimeout(() => {
        expect(iframe.style.height).to.equal(viewport.getHeight() + 'px')
        done()
      }, 600)
      expect(iframe.frameBorder).to.equal('0')
      expect(iframe.style.width).to.equal('100%')
      expect(iframe.style.height).to.equal('100%')
      expect(iframe.classList.contains('mip-fill-content')).to.equal(true)
      expect(iframe.src).to.equal('data:text/html;charset=utf-8;base64,' + window.btoa('<p>Hello MIP!</p>'))
      expect(iframe.getAttribute('allowfullscreen')).to.equal('true')
      expect(iframe.getAttribute('allowtransparency')).to.equal('true')
      expect(iframe.getAttribute('sandbox')).to.be.null
    })

    after(function () {
      document.body.removeChild(mipIframe)
    })
  })

  describe('iframe with set width and height', function () {
    before(function () {
      mipIframe = document.createElement('mip-iframe')
      mipIframe.setAttribute('srcdoc', '<p>Hello MIP!</p>')
      mipIframe.setAttribute('height', '100px')
      mipIframe.setAttribute('width', '200px')
      document.body.appendChild(mipIframe)
    })

    it('should produce iframe', function () {
      iframe = mipIframe.querySelector('iframe')
      expect(iframe.frameBorder).to.equal('0')
      expect(iframe.style.width).to.equal('200px')
      expect(iframe.style.height).to.equal('100px')
      expect(iframe.classList.contains('mip-fill-content')).to.equal(true)
      expect(iframe.src).to.equal('data:text/html;charset=utf-8;base64,' + window.btoa('<p>Hello MIP!</p>'))
      expect(iframe.getAttribute('allowfullscreen')).to.be.null
      expect(iframe.getAttribute('allowtransparency')).to.be.null
      expect(iframe.getAttribute('sandbox')).to.be.null
    })

    it('should resize with detail', function () {
      let event = new Event(CUSTOM_EVENT_RESIZE_PAGE)
      event.detail = [{
        height: viewport.getHeight()
      }]
      window.dispatchEvent(event)
    })

    it('should resize with viewport calculation', function () {
      let event = new Event(CUSTOM_EVENT_RESIZE_PAGE)
      event.detail = [{}]
      window.dispatchEvent(event)
    })

    it('should resize with viewport calculation', function () {
      let event = new Event(CUSTOM_EVENT_RESIZE_PAGE)
      window.dispatchEvent(event)
    })

    it('should notifyRootPage when message event triggered', function () {
      window.postMessage({
        type: MESSAGE_MIPIFRAME_RESIZE
      }, '*')
    })

    it('should not notifyRootPage when message event triggered', function () {
      window.postMessage({
        type: 'not_' + MESSAGE_MIPIFRAME_RESIZE
      }, '*')
    })

    after(function () {
      document.body.removeChild(mipIframe)
    })
  })

  describe('iframe with no src and height', function () {
    before(function () {
      mipIframe = document.createElement('mip-iframe')
      document.body.appendChild(mipIframe)
    })

    it('should not produce iframe', function () {
      iframe = mipIframe.querySelector('iframe')
      expect(iframe).to.be.null
    })

    after(function () {
      document.body.removeChild(mipIframe)
    })
  })
})
