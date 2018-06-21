import mip from '../src/index.js' // eslint-disable-line

describe('MIP', function () {
  it('should expose MIP.registerVueCustomElement', function () {
    expect(MIP.registerVueCustomElement).to.be.a('function')
  })

  it('should expose MIP.registerCustomElement', function () {
    expect(MIP.registerCustomElement).to.be.a('function')
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

  it('should expose MIP.componentHelpers', function () {
    expect(MIP.componentHelpers).to.be.a('object')
  })
})
