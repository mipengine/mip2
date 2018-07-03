import registerElement from '../../src/register-element.js'
import CustomElement from '../../src/custom-element.js'

/* globals describe, before, it, expect */

describe('Custom element', function () {
  let ele
  let customElement
  before(function () {
    registerElement('mip-example', class Example extends CustomElement {
      static get observedAttributes () {
        return ['name']
      }

      init () {
        this.initCalled = true
      }

      connectedCallback () {
        this.connectedCallbackCalled = true
        this.applyFillContent(this.element, true)
      }

      disconnectedCallback () {
        this.disconnectedCallbackCalled = true
      }

      attributeChangedCallback () {
        this.attributeChangedCallbackCalled = true
      }

      firstInviewCallback () {
        this.firstInviewCallbackCalled = true
      }

      viewportCallback () {
        this.viewportCallbackCalled = true
      }

      prerenderAllowed () {
        this.prerenderAllowedCalled = true
        return true
      }

      hasResources () {
        this.hasResourcesCalled = true
        return false
      }
      build () {
        this.buildCalled = true
      }
    })
    ele = document.createElement('mip-example')
    document.body.appendChild(ele)
    ele.setAttribute('name', 'fake')
    document.body.removeChild(ele)
    customElement = ele.customElement
  })

  it('.element', function () {
    expect(customElement).to.have.property('element')
  })

  it('#init', function () {
    expect(customElement.initCalled).to.equal(true)
  })

  it('#connectedCallback', function () {
    expect(customElement.connectedCallbackCalled).to.equal(true)
  })

  it('#disconnectedCallback', function () {
    expect(customElement.disconnectedCallbackCalled).to.equal(true)
  })

  it('#attributeChangedCallback', function () {
    expect(customElement.attributeChangedCallbackCalled).to.equal(true)
  })

  it('#firstInviewCallback', function () {
    expect(customElement.firstInviewCallbackCalled).to.equal(true)
  })

  it('#viewportCallback', function () {
    expect(customElement.viewportCallbackCalled).to.equal(true)
  })

  it('#prerenderAllowed', function () {
    expect(customElement.prerenderAllowedCalled).to.equal(true)
  })

  it('#hasResources', function () {
    expect(customElement.hasResourcesCalled).to.equal(true)
  })

  it('#build', function () {
    expect(customElement.buildCalled).to.equal(true)
  })

  it('#applyFillContent', function () {
    expect(ele.classList.contains('mip-fill-content')).to.equal(true)
    expect(ele.classList.contains('mip-replaced-content')).to.equal(true)
  })
})
