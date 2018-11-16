/**
 * @file mip1-polyfill index spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* globals describe, it, expect, beforeEach */

import install from 'src/mip1-polyfill'
import customElement from 'src/mip1-polyfill/customElement'
import templates from 'src/util/templates'

describe('mip1-polyfill', function () {
  let mip = {
    registerElement: sinon.spy(),
    registerTemplate: sinon.spy()
  }
  let MipTestElement

  beforeEach(function () {
    MipTestElement = customElement.create()
  })

  it('install', function () {
    install(mip)
    expect(mip.registerMipElement).to.be.a('function')
  })

  it('esl module', function (done) {
    let list = [
      'util', 'viewer', 'viewport', 'templates', 'customElement', 'performance',
      'utils/customStorage', 'fetch-jsonp', 'fixed-element', 'hash', 'dom/event',
      'mip', 'naboo', 'dom/css-loader', 'dom/css', 'dom/dom', 'dom/rect', 'utils/event-action',
      'utils/event-emitter', 'utils/fn', 'utils/platform', 'utils/gesture'
    ]
    window.require(list, (...args) => {
      expect(args.length).to.equal(list.length)
      for (let i = 0; i < args.length; i++) {
        expect(args[i]).should.not.equal(undefined)
      }
      done()
    })
  })

  it('register mip element', function () {
    mip.registerMipElement('mip-test-register-element', MipTestElement)
    expect(mip.registerElement).to.be.calledOnceWithExactly(
      'mip-test-register-element',
      MipTestElement,
      undefined,
      {version: '1'}
    )
  })

  it('register mip template', function () {
    let MipTestTemplate = templates.inheritTemplate()
    MipTestTemplate.prototype.cache = function (html) {
      return html
    }
    MipTestTemplate.prototype.render = function (html, data) {
      return html.replace('{{title}}', data.title)
    }
    mip.registerMipElement('mip-test-template', MipTestTemplate)
    expect(mip.registerTemplate).to.be.calledOnceWithExactly(
      'mip-test-template',
      MipTestTemplate,
      {version: '1'}
    )
  })
})
