/**
 * @file index spec file
 * @author huanghuiquan(huanghuiquan@baidu.com)
 */

/* globals describe, it, expect, sinon */

import 'src/index'

describe('MIP', function () {
  let prefix = 'mip-index-'
  let MIP = window.MIP

  it('should expose MIP.registerVueCustomElement', function () {
    let name = prefix + 'vue-element'
    let created = sinon.spy()

    MIP.registerVueCustomElement(name, {
      created
    })

    let ele = document.createElement(name)
    document.body.appendChild(ele)
    document.body.removeChild(ele)

    sinon.assert.calledOnce(created)
    expect(MIP.registerVueCustomElement).to.be.a('function')
  })

  it('should expose MIP.registerCustomElement', function () {
    expect(MIP.registerCustomElement).to.be.a('function')
  })

  it('should expose MIP.CustomElement', function () {
    expect(MIP.CustomElement).to.be.a('function')
  })

  it('should expose MIP.util', function () {
    expect(MIP.util).to.be.a('object')
  })

  it('should expose MIP.viewer', function () {
    expect(MIP.viewer).to.be.a('object')
  })

  it('should expose MIP.viewport', function () {
    expect(MIP.viewport).to.be.a('object')
  })

  it('should expose MIP.standalone', function () {
    expect(MIP.standalone).to.be.a('boolean')
  })

  it('should expose MIP.sandbox', function () {
    expect(MIP.sandbox).to.be.a('object')
  })

  it('should expose MIP.push', function () {
    expect(MIP.push).to.be.a('function')
  })

  it('should expose MIP.prerenderElement', function () {
    expect(MIP.prerenderElement).to.be.a('function')
  })
})
