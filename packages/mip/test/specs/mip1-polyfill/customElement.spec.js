/**
 * @file mip1-polyfill customElement spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect, before, beforeEach, afterEach, sinon */

import customElement from 'src/mip1-polyfill/customElement'
import registerElement from 'src/mip1-polyfill/element'

let Created = customElement.create()
let $

describe('mip1 customElement', function () {
  let cElement

  before(() => {
    return new Promise(resolve => {
      // load zepto
      window.require(['zepto'], (zepto) => {
        $ = zepto
        resolve()
      })
    })
  })

  beforeEach(function () {
    cElement = new Created()
  })

  afterEach(function () {
    cElement = null
    $('.mip-element').remove()
  })

  describe('default method validation', function () {
    [
      'applyFillContent',
      'createdCallback',
      'attachedCallback',
      'detachedCallback',
      'attributeChangedCallback',
      'firstInviewCallback',
      'viewportCallback',
      'prerenderAllowed',
      'hasResources',
      'expendAttr',
      'addEventAction',
      'executeEventAction',
      'resourcesComplete'
    ].forEach(function (key) {
      it('.' + key, function () {
        expect(cElement[key]).to.be.a('function')
      })
    })
  })

  it('init call', function () {
    let Element = customElement.create()
    Element.prototype.init = sinon.spy()

    let initElement = new Element()
    expect(initElement.init).to.have.been.calledOnce
  })

  it('#prerenderAllowed', function () {
    expect(cElement.prerenderAllowed()).to.equal(false, 'prerenderAllowed() the return value must be false')
  })

  it('#hasResources', function () {
    expect(cElement.hasResources()).to.equal(false, 'hasResources() the return value must be false')
  })

  it('#applyFillContent', function () {
    let Element = customElement.create()
    let initElement = new Element()
    let node = document.createElement('div')

    initElement.applyFillContent(node)
    expect(node.classList.contains('mip-fill-content')).to.be.true
    expect(node.classList.contains('mip-replaced-content')).to.be.false

    initElement.applyFillContent(node, true)
    expect(node.classList.contains('mip-replaced-content')).to.be.true
  })

  it('#resourcesComplete', function (done) {
    let Element = customElement.create()
    let initElement = new Element()

    let context = {
      element: {
        resourcesComplete: function (data) {
          expect(data).to.be.undefined
          done()
        }
      }
    }

    initElement.resourcesComplete.call(context)
  })

  it('#build', function (done) {
    let mipTestBuild = customElement.create()

    mipTestBuild.prototype.build = function () {
      expect(this.element).to.not.undefined
      done()
    }

    registerElement('mip-test-build', mipTestBuild)

    document.body.appendChild(document.createElement('mip-test-build'))
  })

  it('#expendAttr', function (done) {
    let mipTestAttr = customElement.create()

    mipTestAttr.prototype.build = function () {
      let clone = document.createElement('div')
      let result = this.expendAttr([
        'data-name',
        'data-version',
        'data-desc'
      ], clone)

      expect(result).to.deep.equal(clone, 'the return value must be element')
      expect(clone.getAttribute('data-name')).to.equal('MIP')
      expect(clone.getAttribute('data-version')).to.equal('1.0')
      expect(!clone.getAttribute('data-desc')).to.be.true

      // test object
      let data = {}
      let output = this.expendAttr([
        'data-name'
      ], data)

      expect(output).to.deep.equal(data)
      expect(output['data-name']).to.equal('MIP')

      done()
    }

    registerElement('mip-test-attr', mipTestAttr)

    let node = document.createElement('mip-test-attr')
    node.setAttribute('data-name', 'MIP')
    node.setAttribute('data-version', '1.0')
    document.body.appendChild(node)
  })

  describe('event call', function () {
    it('do not bind trigger', function () {
      cElement.executeEventAction({
        handler: 'open'
      })

      expect(cElement._actionEvent).to.be.undefined
    })

    it('multiple trigger', function () {
      let index = 0

      cElement.addEventAction('open', function (event, args) {
        index += 1
      })

      cElement.addEventAction('close', function (event, args) {
        index += 1
      })

      cElement.executeEventAction({
        handler: 'open'
      })
      cElement.executeEventAction({
        handler: 'open'
      })

      cElement.executeEventAction({
        handler: 'error'
      })

      expect(index).to.equal(2)
    })

    it('trigger parameters is empty', function (done) {
      cElement.addEventAction('open', function (event, args) {
        expect(event).to.be.undefined
        expect(args).to.be.undefined
        done()
      })

      cElement.executeEventAction({
        handler: 'open'
      })
    })

    it('trigger parameters', function (done) {
      cElement.addEventAction('open', function (event, args) {
        expect(event).to.equal('click')
        expect(args.name).to.equal('MIP')
        done()
      })

      cElement.executeEventAction({
        handler: 'open',
        event: 'click',
        arg: {
          name: 'MIP'
        }
      })
    })
  })
})

/* eslint-enable no-unused-expressions */
