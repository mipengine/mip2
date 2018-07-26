/**
 * @file mip-iframe spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, after, Event */

import {
  CUSTOM_EVENT_RESIZE_PAGE,
  MESSAGE_PAGE_RESIZE
} from 'src/page/const'

describe('mip-iframe', function () {
  let mipIframe
  let iframe

  describe('iframe with default width and attrs', function () {
    this.timeout(600)
    before(function () {
      mipIframe = document.createElement('mip-iframe')
      mipIframe.setAttribute('srcdoc', '<p>Hello MIP!</p>')
      mipIframe.setAttribute('height', '100%')
      mipIframe.setAttribute('allowfullscreen', 'true')
      mipIframe.setAttribute('allowtransparency', 'true')
      document.body.appendChild(mipIframe)
    })

    it('should produce iframe', function () {
      iframe = mipIframe.querySelector('iframe')
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
    this.timeout(600)
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
        height: 10
      }]
      window.dispatchEvent(event)
    })

    it('should resize with detail again', function () {
      let event = new Event(CUSTOM_EVENT_RESIZE_PAGE)
      event.detail = [{
        height: 20
      }]
      window.dispatchEvent(event)
    })

    it('should resize with viewport calculation', function () {
      let event = new Event(CUSTOM_EVENT_RESIZE_PAGE)
      event.detail = [{}]
      window.dispatchEvent(event)
    })

    it('should not resize even if resize event triggered', function () {
      let event = new Event(CUSTOM_EVENT_RESIZE_PAGE)
      window.dispatchEvent(event)
    })

    it('should notifyRootPage when message event triggered', function () {
      window.postMessage({
        type: MESSAGE_PAGE_RESIZE
      }, '*')
    })

    it('should not notifyRootPage when message event triggered', function () {
      window.postMessage({
        type: 'not_' + MESSAGE_PAGE_RESIZE
      }, '*')
    })

    after(function () {
      document.body.removeChild(mipIframe)
    })
  })

  describe('iframe with no src', function () {
    this.timeout(600)
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

  describe('iframe with height', function () {
    this.timeout(600)
    before(function () {
      mipIframe = document.createElement('mip-iframe')
      mipIframe.setAttribute('srcdoc', '<p>Hello MIP!</p>')
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
