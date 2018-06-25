
import registerElement from '../src/register-element.js'
import CustomElement from '../src/custom-element.js'

describe('Register element', function () {
  let ele
  before(function () {
    registerElement('mip-example', class Example extends CustomElement {})
    ele = document.createElement('mip-example')
    document.body.appendChild(ele)
  })

  it('should register a custom element', function () {
    expect(ele).to.have.property('customElement')
  })

  it('should has a mip-element class in dom', function () {
    expect(ele.classList.contains('mip-element')).to.equal(true)
  })
})
