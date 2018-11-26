import registerElement from '../../src/register-element.js'
import CustomElement from '../../src/custom-element.js'

/* globals describe, before, it, expect */

describe('Custom element', function () {
  let MipTestExample
  let el
  before(() => {
    MipTestExample = class Example extends CustomElement {
      init () {}
    }
    registerElement('mip-example', MipTestExample)

    el = document.createElement('mip-example')

    expect(el.customElement).to.be.an.instanceof(MipTestExample)
    document.body.appendChild(el)
  })

  it('event action', function (done) {
    setTimeout(() => {
      let handler = sinon.spy()
      el.customElement.addEventAction('test-event-action', handler)
      el.customElement.executeEventAction({
        handler: 'test-event-action'
      })
      expect(handler.calledOnce).to.be.true
      done()
    }, 1)
  })

  it('.expendAttr', function () {
    let attrs = ['checked', 'unknown']
    el.setAttribute('checked', 'checked')

    let div = document.createElement('div')

    el.customElement.expendAttr(attrs, div)
    expect(div.getAttribute('checked')).to.equal('checked')
    expect(div.getAttribute('unknown')).to.be.null
  })

  it('.applyFillContent', function () {
    let div = document.createElement('div')
    el.customElement.applyFillContent(div)
    expect(div.classList.contains('mip-fill-content')).to.be.true
    expect(div.classList.contains('mip-replaced-content')).to.be.false

    div = document.createElement('div')
    el.customElement.applyFillContent(div, true)
    expect(div.classList.contains('mip-fill-content')).to.be.true
    expect(div.classList.contains('mip-replaced-content')).to.be.true
  })
})
