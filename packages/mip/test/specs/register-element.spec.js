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

  it('should warning built error if build throw an error', function () {
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

    warn.restore()
    sinon.assert.calledOnce(warn)

    delete MIPExample.prototype.build
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
})
