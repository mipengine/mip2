/**
 * @file register-element spec file
 * @author huanghuiquan(huanghuiquan@baidu.com)
 */

import registerElement from 'src/register-element.js'
import CustomElement from 'src/custom-element.js'
import store from 'src/custom-element-store.js'
import cssLoader from 'src/util/dom/css-loader'
import performance from 'src/performance'

describe('Register element', function () {
  let prefix = 'mip-test-register-element'
  class MIPExample extends CustomElement {
    static get observedAttributes () {
      return ['name']
    }
  }

  let createElement = (tag) => document.createElement(tag)

  it('twice should define customElements once', function () {
    let get = sinon.spy(store, 'get')
    let set = sinon.spy(store, 'set')
    let def = sinon.spy(window.customElements, 'define')
    let name = prefix + '-store'

    registerElement(name, MIPExample)
    registerElement(name, MIPExample)

    get.restore()
    set.restore()

    expect(get.calledWith(name)).to.be.true
    expect(set.calledWith(name, MIPExample, 'mip2')).to.be.true
    expect(get.calledTwice).to.be.true
    expect(set.calledOnce).to.be.true
    expect(def.calledOnce).to.be.true
  })

  it('should load css if pass css text', function () {
    let insertStyleElement = sinon.spy(cssLoader, 'insertStyleElement')
    let name = prefix + '-css'
    let css = 'body {color: red;}'

    registerElement(name, MIPExample, css)

    insertStyleElement.restore()

    let style = document.head.querySelector(`[mip-extension=${name}]`)
    expect(style.textContent).to.be.equal(css)
    expect(insertStyleElement.calledOnce).to.be.true
  })

  it('should call customElement life cycle hooks in order', function () {
    let name = prefix + 'custom-element'
    let lifecycs = [
      // 'constuctor'
      'attributeChangedCallback',
      'connectedCallback',
      'build',
      'viewportCallback',
      'firstInviewCallback',
      'disconnectedCallback'
    ]

    registerElement(name, MIPExample)

    let ele = createElement(name)
    let lifecycSpies = lifecycs.map(cbName => sinon.spy(ele.customElement, cbName))

    ele.setAttribute('name', 'fake')

    document.body.appendChild(ele)
    ele.viewportCallback(true)
    document.body.removeChild(ele)

    lifecycSpies.forEach(spy => spy.restore())
    sinon.assert.callOrder(...lifecycSpies)
  })

  it('should has a mip-element class in dom', function () {
    let name = prefix + 'add-class'
    registerElement(name, MIPExample)

    let ele = createElement(name)

    document.body.appendChild(ele)
    document.body.removeChild(ele)

    expect(ele.classList.contains('mip-element')).to.be.true
  })

  it('should warning built error if build throw an error', function (done) {
    let name = prefix + '-build-error'
    let warn = sinon.stub(console, 'warn')

    registerElement(name, class extends CustomElement {
      build () {
        throw new Error('make a build error')
      }
    })

    let ele = createElement(name)
    expect(ele.customElement.build).to.throw('build error')

    document.body.appendChild(ele)
    document.body.removeChild(ele)

    setTimeout(() => {
      warn.restore()
      sinon.assert.calledOnce(warn)
      delete MIPExample.prototype.build
      done()
    }, 1)
  })

  it('should add element to performance if has resource', function () {
    let name = prefix + '-performance'

    let addFsElement = sinon.spy(performance, 'addFsElement')

    registerElement(name, class extends CustomElement {
      hasResources () {
        return true
      }
    })

    let ele = createElement(name)
    document.body.appendChild(ele)
    document.body.removeChild(ele)

    addFsElement.restore()

    sinon.assert.calledOnce(addFsElement)
  })

  describe('placeholder', function () {
    let name = prefix + 'placeholder'
    let ele
    registerElement(name, class extends MIPExample {
      createPlaceholderCallback () {
        let loader = document.createElement('div')
        loader.classList.add('default-placeholder')
        return loader
      }
    })

    beforeEach(() => {
      ele = createElement(name)
    })

    afterEach(() => {
      ele.parentElement && ele.parentElement.removeChild(ele)
    })

    it('should show default placeholder if not placeholder attribute', async function () {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')

      document.body.appendChild(ele)

      ele.viewportCallback(true)

      let placeholder = ele.querySelector('.default-placeholder')
      expect(placeholder).to.not.be.null
    })

    it('should show placeholder if element has placeholder attribute', async function () {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')

      let placeholder = createElement('div')
      placeholder.setAttribute('placeholder', '')
      ele.appendChild(placeholder)
      document.body.appendChild(ele)

      ele.viewportCallback(true)
      let eleRect = ele.getBoundingClientRect()
      let placeholderRect = placeholder.getBoundingClientRect()
      expect(eleRect).to.deep.equal(placeholderRect)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false

      await new Promise(resolve => (ele.customElement.firstLayoutCompleted = resolve))
      expect(placeholder.classList.contains('mip-hidden')).to.be.true
      ele.customElement.togglePlaceholder(true)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false
    })

    it('should ignore input placeholder if element has placeholder attribute', async function () {
      let placeholder = createElement('input')
      placeholder.setAttribute('placeholder', 'ddd')
      ele.appendChild(placeholder)
      document.body.appendChild(ele)

      ele.viewportCallback(true)
      let eleRect = ele.getBoundingClientRect()
      let placeholderRect = placeholder.getBoundingClientRect()
      expect(eleRect).to.not.equal(placeholderRect)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false

      await new Promise(resolve => (ele.customElement.firstLayoutCompleted = resolve))
      expect(placeholder.classList.contains('mip-hidden')).to.be.false
    })

    it('should not show placeholder if self is a placeholder', async function () {
      let placeholder = createElement('div')
      placeholder.setAttribute('placeholder', '')
      ele.setAttribute('placeholder', '')
      ele.appendChild(placeholder)
      document.body.appendChild(ele)

      ele.viewportCallback(true)
      let eleRect = ele.getBoundingClientRect()
      let placeholderRect = placeholder.getBoundingClientRect()
      expect(eleRect).to.not.equal(placeholderRect)
      expect(placeholder.classList.contains('mip-hidden')).to.be.false

      await new Promise(resolve => (ele.customElement.firstLayoutCompleted = resolve))
      expect(placeholder.classList.contains('mip-hidden')).to.be.false
    })
  })

  describe('loading', function () {
    let name = prefix + 'loading'
    let ele
    class MIPLoadingExample extends MIPExample {
      isLoadingEnabled () {
        return true
      }
    }
    registerElement(name, MIPLoadingExample)

    beforeEach(() => {
      ele = createElement(name)
    })

    afterEach(() => {
      ele.parentElement && ele.parentElement.removeChild(ele)
    })

    it('should show loading if extensions enable loading', async function () {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')
      document.body.appendChild(ele)

      expect(ele.querySelector('.mip-loading-container')).to.be.null

      ele.viewportCallback(true)

      // show loading
      let loader = ele.querySelector('.mip-loading-container')
      expect(loader).to.be.not.null
      let eleRect = ele.getBoundingClientRect()
      let loaderRect = loader.getBoundingClientRect()
      expect(eleRect).to.not.equal(loaderRect)

      await Promise.resolve()
      expect(ele.querySelector('.mip-loading-container')).to.be.null
    })

    it('should not show loading if element implict noloading', async function () {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')
      ele.setAttribute('noloading', '')
      document.body.appendChild(ele)

      expect(ele.querySelector('.mip-loading-container')).to.be.null

      ele.viewportCallback(true)

      // show loading
      let loader = ele.querySelector('.mip-loading-container')
      expect(loader).to.be.null
    })
  })

  describe('fallback', function () {
    let name = prefix + 'fallback'
    let ele
    registerElement(name, MIPExample)

    beforeEach(() => {
      ele = createElement(name)
    })

    afterEach(() => {
      ele.parentElement && ele.parentElement.removeChild(ele)
    })

    it('should show fallback element if declare in html and load resources error', async function () {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1')
      ele.setAttribute('height', '1')

      let fallback = createElement('div')
      fallback.setAttribute('fallback', '')
      ele.appendChild(fallback)
      document.body.appendChild(ele)

      await new Promise(resolve => {
        // override to make it reject
        ele.customElement.layoutCallback = function (err) {
          resolve()
          return Promise.reject(err)
        }
        ele.viewportCallback(true)
      })

      let eleRect = ele.getBoundingClientRect()
      let fallbackRect = fallback.getBoundingClientRect()
      expect(eleRect).to.deep.equal(fallbackRect)
      expect(fallback.classList.contains('mip-hidden')).to.be.false
    })
  })

  describe('applySizesAndMediaQuery', function () {
    let name = prefix + 'size-and-media-query'
    let ele
    let ww = window.innerWidth
    registerElement(name, MIPExample)

    beforeEach(() => {
      ele = createElement(name)
    })

    afterEach(() => {
      document.body.removeChild(ele)
    })

    it('normal sizes not match', async function () {
      ele.setAttribute('sizes', `(min-width: ${ww + 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('100vw')
    })

    it('normal sizes match', async function () {
      ele.setAttribute('sizes', `(min-width: ${ww - 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('50vw')
    })

    it('normal heights not match', async function () {
      ele.setAttribute('sizes', `(min-width: ${ww + 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('100vw')
    })

    it('normal heights match', async function () {
      ele.setAttribute('sizes', `(min-width: ${ww - 1}px) 50vw, 100vw`)
      document.body.appendChild(ele)
      expect(ele.style.width).to.equal('50vw')
    })

    it('normal media query match', async function () {
      ele.setAttribute('media', `(min-width: ${ww - 1}px)`)
      document.body.appendChild(ele)
      expect(ele.classList.contains('mip-hidden-by-media-query')).to.be.false
    })

    it('normal media query not match', async function () {
      ele.setAttribute('media', `(min-width: ${ww + 1}px)`)
      document.body.appendChild(ele)
      expect(ele.classList.contains('mip-hidden-by-media-query')).to.be.true
    })

    it('normal heights width layout=responsive', async function () {
      ele.setAttribute('layout', 'responsive')
      ele.setAttribute('width', '1px')
      ele.setAttribute('height', '1px')
      ele.setAttribute('heights', `(min-width: ${ww + 1}px) 50vw, 100vw`)
      console.log('ddd')
      document.body.appendChild(ele)

      expect(ele.querySelector('mip-i-space').style.paddingTop).to.equal('100vw')
    })
  })
})
