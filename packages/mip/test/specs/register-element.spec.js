/**
 * @file register-element spec file
 * @author huanghuiquan(huanghuiquan@baidu.com)
 */

import registerElement from 'src/register-element'
import CustomElement from 'src/custom-element'
import store from 'src/custom-element-store'
import cssLoader from 'src/util/dom/css-loader'

describe('register-element', () => {
  let prefix = 'mip-test-register-element'
  class MIPExample extends CustomElement {
    static get observedAttributes () {
      return ['name']
    }
  }

  it('should define custom element once', () => {
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

  it('should load css if pass css text', () => {
    let insertStyleElement = sinon.spy(cssLoader, 'insertStyleElement')
    let name = prefix + '-css'
    let css = 'body {color: red;}'

    registerElement(name, MIPExample, css)

    insertStyleElement.restore()

    let style = document.head.querySelector(`[mip-extension=${name}]`)
    expect(style.textContent).to.be.equal(css)
    expect(insertStyleElement.calledOnce).to.be.true
  })
})
