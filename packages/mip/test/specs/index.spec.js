/**
 * @file index spec file
 * @author huanghuiquan(huanghuiquan@baidu.com)
 */

/* globals describe, it, expect, sinon */

import 'src'

describe('MIP', () => {
  it('should expose MIP.version', () => {
    expect(MIP.version).to.equals('2')
  })

  it('should expose MIP.CustomElement', () => {
    expect(MIP.CustomElement).to.be.a('function')
  })

  it('should expose MIP.Services', () => {
    expect(MIP.Services).to.be.a('function')
  })

  it('should expose MIP.builtinComponents', () => {
    expect(MIP.builtinComponents).to.be.an('object')
  })

  it('should expose MIP.css', () => {
    expect(MIP.css).to.be.an('object')
  })

  it('should expose MIP.hash', () => {
    expect(MIP.hash).to.be.an('object')
    expect(MIP.hash).to.equal(MIP.util.hash)
  })

  it('should expose MIP.performance', () => {
    expect(MIP.performance).to.be.an('object')
  })

  it('should expose MIP.prerenderElement', () => {
    expect(MIP.prerenderElement).to.be.a('function')
  })

  it('should expose MIP.push', () => {
    expect(MIP.push).to.be.a('function')
    expect(MIP.push).to.equal(MIP.Services.extensionsFor(window).installExtension)
  })

  it('should expose MIP.registerElement', () => {
    expect(MIP.registerElement).to.be.a('function')
    expect(MIP.registerElement).to.equal(MIP.Services.extensionsFor(window).registerElement)
  })

  it('should expose MIP.registerService', () => {
    expect(MIP.registerService).to.be.a('function')
    expect(MIP.registerService).to.equal(MIP.Services.extensionsFor(window).registerService)
  })

  it('should expose MIP.registerTemplate', () => {
    expect(MIP.registerTemplate).to.be.a('function')
    expect(MIP.registerTemplate).to.equal(MIP.Services.extensionsFor(window).registerTemplate)
  })

  it('should expose MIP.registerCustomElement', () => {
    expect(MIP.registerCustomElement).to.be.a('function')
    expect(MIP.registerCustomElement).to.equal(MIP.registerElement)
  })

  it('should expose MIP.registerVueCustomElement', () => {
    expect(MIP.registerVueCustomElement).to.be.a('function')
    expect(MIP.registerVueCustomElement).to.equal(MIP.registerElement)
  })

  it('should expose MIP.standalone', () => {
    expect(MIP.standalone).to.be.a('boolean')
  })

  it('should expose MIP.templates', () => {
    expect(MIP.templates).to.be.an('object')
    expect(MIP.templates).to.equal(MIP.util.templates)
  })

  it('should expose MIP.util', () => {
    expect(MIP.util).to.be.an('object')
  })

  it('should expose MIP.viewer', () => {
    expect(MIP.viewer).to.be.an('object')
  })

  it('should expose MIP.viewport', () => {
    expect(MIP.viewport).to.be.an('object')
  })

  it('should expose MIP.sandbox', () => {
    expect(MIP.sandbox).to.be.an('object')
  })
})
