/**
 * @file sandbox.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

/* globals describe, it */

window.MIP = {}

var chai = require('chai')
var expect = chai.expect
var sandbox = require('../../lib/sandbox')

describe('sandbox', function () {
  it('keys', function () {
    expect(Object.keys(sandbox)).to.include.members(['WHITELIST', 'strict'])
  })

  it('this', function () {
    expect(sandbox.this(window)).to.be.equal(sandbox)
    expect(sandbox.this(document)).to.be.equal(sandbox.document)
    expect(sandbox.strict.this(window)).to.be.equal(sandbox.strict)
    expect(sandbox.strict.this(document)).to.be.equal(sandbox.strict.document)
  })

  it('window', function () {
    expect(sandbox.window).to.be.equal(sandbox)
  })

  it('strict', function () {
    expect(sandbox.strict).to.be.equal(sandbox.strict.window)
  })

  it('location', function () {
    expect(Object.keys(sandbox.location)).to.have.include.members(Object.keys(sandbox.strict.location))
  })

  it('WHITELIST', function () {
    expect(sandbox.WHITELIST).to.be.equal(sandbox.strict.WHITELIST)
  })
})
