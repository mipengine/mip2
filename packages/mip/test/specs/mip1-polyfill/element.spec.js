/**
 * @file mip1-polyfill element spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect, before, beforeEach, afterEach, sinon */

import cssLoader from 'src/util/dom/css-loader'
import layout from 'src/layout'
import registerElement from 'src/mip1-polyfill/element'
import customElement from 'src/mip1-polyfill/customElement'
import performance from 'src/performance'

let $

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

describe('mip1 element', function () {
  let MipTestElement

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
    MipTestElement = customElement.create()
  })

  afterEach(function () {
    MipTestElement = null
    $('.mip-element').remove()
    $('.mip-test-mock-node').remove()
  })

  describe('registerElement', function () {
    it('createElement', function () {
      registerElement('mip-test-register-element', MipTestElement)
      createDomByTag('mip-test-register-element')
      expect(document.querySelectorAll('mip-test-register-element').length).to.equal(1)
    })

    it('repeat registration', function () {
      let MipTestElement1 = customElement.create()
      let MipTestElement2 = customElement.create()
      let spy1 = MipTestElement1.prototype.createdCallback = sinon.spy()
      let spy2 = MipTestElement2.prototype.createdCallback = sinon.spy()
      let name = 'mip-test-register-repeat'

      registerElement(name, MipTestElement1)
      registerElement(name, MipTestElement2)

      createDomByTag(name)
      createDomByTag(name)

      expect(spy1).to.have.been.calledTwice
      expect(spy2).to.not.have.been.called
    })

    it('loadCss', function () {
      let name = 'mip-test-register-loadcss'
      let cssText = '.mip-test-register-loadcss {}'
      let spy = sinon.spy(cssLoader, 'insertStyleElement')

      registerElement(name, MipTestElement, cssText)

      expect(spy).to.have.been.calledOnce
      expect(spy).to.deep.have.been.calledWith(
        document,
        document.head,
        cssText,
        name,
        false
      )

      cssLoader.insertStyleElement.restore()
    })
  })

  describe('#createdCallback', function () {
    it('has mip-element className', function () {
      registerElement('mip-test-hash-classname', MipTestElement)
      expect(createDomByTag('mip-test-hash-classname').classList.contains('mip-element')).to.be.true
    })

    it('the customElement method createdCallback is called', function () {
      let spy = MipTestElement.prototype.createdCallback = sinon.spy()
      let name = 'mip-test-method-createdCallback'
      registerElement(name, MipTestElement)
      createDomByTag(name)

      expect(spy).to.have.been.calledOnce
      expect(spy).to.have.been.calledWith()
    })

    it('the performance method addFsElement is called', function () {
      let spy = sinon.spy(performance, 'addFsElement')
      let name = 'mip-test-method-addFsElement'
      MipTestElement.prototype.hasResources = function () {
        return true
      }
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)

      expect(spy).to.have.been.calledOnce
      expect(spy).to.deep.have.been.calledWith(node)

      spy.restore()
    })
  })

  describe('#attachedCallback', function () {
    it('the layout method applyLayout is called', function () {
      let spy = sinon.spy(layout, 'applyLayout')
      let name = 'mip-test-attachedCallback-applyLayout'
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)
      node.attachedCallback()

      expect(spy).to.have.been.called
      expect(spy).to.deep.have.been.calledWith(node)

      spy.restore()
    })

    it('the customElement method attachedCallback is called', function () {
      let spy = MipTestElement.prototype.attachedCallback = sinon.spy()
      let name = 'mip-test-method-attachedCallback'
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)
      node.attachedCallback()

      expect(spy).to.have.been.called
      expect(spy).to.have.been.calledWith()
    })

    it('the resources method add is called', function () {
      let name = 'mip-test-attachedCallback-add'
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)
      let spy = sinon.spy(node._resources, 'add')
      node.attachedCallback()

      expect(spy).to.have.been.calledOnce
      expect(spy).to.deep.have.been.calledWith(node)

      spy.restore()
    })
  })

  describe('#detachedCallback', function () {
    it('the customElement method detachedCallback is called', function () {
      let name = 'mip-test-method-detachedCallback'
      let spy = MipTestElement.prototype.detachedCallback = sinon.spy()
      registerElement(name, MipTestElement)
      createDomByTag(name).detachedCallback()

      expect(spy).to.have.been.calledOnce
      expect(spy).to.have.been.calledWith()
    })

    it('the resources method remove is called', function () {
      let name = 'mip-test-method-detachedCallback-remove'
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)
      let spy = sinon.spy(node._resources, 'remove')
      node.detachedCallback()

      expect(spy).to.have.been.calledOnce
      expect(spy.firstCall.args[0]).to.deep.equal(node)

      spy.restore()
    })

    it('the performance method fsElementLoaded is called', function () {
      let spy = sinon.spy(performance, 'fsElementLoaded')
      let name = 'mip-test-attachedCallback-fsElementLoaded'
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)
      node.detachedCallback()

      expect(spy).to.have.been.calledOnce
      expect(spy).to.deep.have.been.calledWith(node)

      spy.restore()
    })
  })

  it('#attributeChangedCallback', function () {
    let name = 'mip-test-method-attributeChangedCallback'
    let spy = MipTestElement.prototype.attributeChangedCallback = sinon.spy()

    registerElement(name, MipTestElement)
    createDomByTag(name).attributeChangedCallback()

    expect(spy).to.have.been.called
    expect(spy).to.have.been.calledWith()
  })

  it('#inViewport', function () {
    let name = 'mip-test-method-inViewport'
    registerElement(name, MipTestElement)
    let node = createDomByTag(name)

    node._inViewport = true
    expect(node.inViewport()).to.be.true
  })

  it('#isBuilt', function () {
    let name = 'mip-test-method-inViewport'
    registerElement(name, MipTestElement)
    let node = createDomByTag(name)

    node._built = true
    expect(node.isBuilt()).to.be.true
  })

  it('#prerenderAllowed', function () {
    let name = 'mip-test-method-prerenderAllowed'
    let stub = MipTestElement.prototype.prerenderAllowed = sinon.stub()
    registerElement(name, MipTestElement)
    let node = createDomByTag(name)

    stub.withArgs().returns(1)

    expect(node.prerenderAllowed()).to.equal(1)
  })

  it('#executeEventAction', function () {
    let name = 'mip-test-method-executeEventAction'
    let spy = MipTestElement.prototype.executeEventAction = sinon.spy()
    registerElement(name, MipTestElement)
    createDomByTag(name).executeEventAction('MIP')

    expect(spy).to.have.been.calledOnce
    expect(spy).to.have.been.calledWith('MIP')
  })

  it('#resourcesComplete', function () {
    let spy = sinon.spy(performance, 'fsElementLoaded')
    let name = 'mip-test-method-resourcesComplete'
    registerElement(name, MipTestElement)
    let node = createDomByTag(name)
    node.resourcesComplete()

    expect(spy).to.have.been.calledOnce
    expect(spy).to.deep.have.been.calledWith(node)

    spy.restore()
  })

  describe('#build', function () {
    it('the customElement method build is called', function (done) {
      let name = 'mip-test-method-build'
      let spy = MipTestElement.prototype.build = sinon.spy()
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)

      setTimeout(function () {
        expect(spy).to.have.been.calledOnce
        expect(spy).to.have.been.calledWith()
        expect(node.isBuilt()).to.be.true
        expect(node.build()).to.be.undefined

        done()
      })
    })

    it('build error', function () {
      let name = 'mip-test-method-build-error'
      MipTestElement.prototype.build = function () {
        throw new TypeError('error')
      }
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)

      // No variables are set when the compilation fails
      expect(node.isBuilt()).to.be.undefined
    })
  })

  describe('#viewportCallback', function () {
    it('the customElement method firstInviewCallback is called', function () {
      let name = 'mip-test-method-firstInviewCallback'
      let spy = MipTestElement.prototype.firstInviewCallback = sinon.spy()
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)
      node.viewportCallback()
      node.viewportCallback()

      expect(spy).to.have.been.calledOnce
      expect(spy).to.have.been.calledWith()
    })

    it('the customElement method viewportCallback is called', function () {
      let name = 'mip-test-method-viewportCallback'
      let spy = MipTestElement.prototype.viewportCallback = sinon.spy()
      registerElement(name, MipTestElement)
      let node = createDomByTag(name)
      node.viewportCallback()
      node.viewportCallback()

      expect(spy.callCount).to.above(1)
      expect(spy).to.have.been.calledWith()
    })
  })

  it('life cycle', function (done) {
    let queue = []
    let name = 'mip-test-life-cycle';

    [
      'build',
      'createdCallback',
      'attachedCallback',
      'detachedCallback'
    ].forEach(function (key) {
      MipTestElement.prototype[key] = function () {
        queue.push(key)
      }
    })
    registerElement(name, MipTestElement)
    let node = createDomByTag(name)
    node.setAttribute('name', 'MIP')
    document.body.removeChild(node)

    // reserved point DOM rendering time
    setTimeout(function () {
      expect(queue).to.deep.equal(['createdCallback', 'attachedCallback', 'build', 'detachedCallback'])
      done()
    }, 100)
  })
})

/* eslint-enable no-unused-expressions */
