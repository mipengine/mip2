/**
 * @file mip1-polyfill index spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* globals describe, it, expect, beforeEach */

import install from 'src/mip1-polyfill'
import customElement from 'src/mip1-polyfill/customElement'
import templates from 'src/util/templates'

/**
 * use the tag name to create dom to the body
 *
 * @param  {string} tagName html tag name
 *
 * @return {HTMLElement}
 */
let createDomByTag = function (tagName) {
  let node = document.createElement(tagName)
  node.classList.add('mip-test-mock-node')
  document.body.appendChild(node)
  return node
}

describe('mip1-polyfill', function () {
  let mip = {}
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
    createDomByTag('mip-test-register-element')
    expect(document.querySelectorAll('mip-test-register-element').length).to.equal(1)
  })

  it('register mip template', function (done) {
    let MipTestTemplate = templates.inheritTemplate()
    MipTestTemplate.prototype.cache = function (html) {
      return html
    }
    MipTestTemplate.prototype.render = function (html, data) {
      return html.replace('{{title}}', data.title)
    }
    mip.registerMipElement('mip-test-template', MipTestTemplate)

    let element = document.createElement('div')
    element.innerHTML = `
      <template type="mip-test-template">
        {{title}}
      </template>
    `

    templates.render(element, {title: 'mip'})
      .then(res => {
        res = res.trim()
        expect(res).to.equal('mip')
        done()
      })
  })
})
