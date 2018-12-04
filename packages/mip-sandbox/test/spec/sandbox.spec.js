/**
 * @file sandbox.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

/* globals describe, it */

window.MIP = {
  watch: function () {
    return 'fall'
  }
}

// var chai = require('chai')
// var expect = chai.expect
var oldSandbox = require('../../lib/sandbox')
var generate = require('../../lib/sandbox-generate')

// 假定 MIP 在 sandbox 后定义
window.MIP = {
  viewer: {
    isIframed: false
  },
  watch: function () {
    return 'watch'
  }
}

window.fetchJsonp = function () {}

// var sandbox = generate()
generate(window.MIP)
var sandbox = window.MIP.sandbox

describe('sandbox', function () {
  it('sandbox', function () {
    expect(sandbox).to.equal(window.MIP.sandbox)
  })

  it('keys', function () {
    expect(Object.keys(sandbox)).to.include.members(['WHITELIST', 'strict'])
  })

  it('this', function () {
    expect(typeof sandbox.this).to.be.equal('function')
    expect(sandbox.this(window)).to.not.be.equal(window)
    expect(sandbox.this(window)).to.be.equal(sandbox)
    expect(sandbox.this(document)).to.be.equal(sandbox.document)
    expect(sandbox.document.cookie).to.be.equal(document.cookie)
    expect(Object.keys(sandbox.strict.document)).to.be.deep.equal(['cookie', 'domain'])
    expect(sandbox.strict.document.cookie).to.be.equal(document.cookie)
    expect(sandbox.strict.MIP.viewer.isIframed).to.be.equal(MIP.viewer.isIframed)
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
    expect(sandbox.location).to.not.be.equal(sandbox.strict.location)

    sandbox.location.hash = 'hash1'
    expect(location.hash).to.be.equal('#hash1')
    expect(sandbox.location.hash).to.be.equal('#hash1')
    expect(sandbox.strict.location.hash).to.be.equal('#hash1')

    sandbox.strict.location.hash = 'hash2'
    expect(location.hash).to.be.equal('#hash1')
    expect(sandbox.location.hash).to.be.equal('#hash1')
    expect(sandbox.strict.location.hash).to.be.equal('#hash1')

    sandbox.location.hash = 'hash2'
    expect(location.hash).to.be.equal('#hash2')
    expect(sandbox.location.hash).to.be.equal('#hash2')
    expect(sandbox.strict.location.hash).to.be.equal('#hash2')
  })

  it('WHITELIST', function () {
    expect(sandbox.WHITELIST).to.not.be.equal(sandbox.strict.WHITELIST)
    expect(sandbox.WHITELIST_STRICT).to.not.be.equal(sandbox.strict.WHITELIST_STRICT)
    expect(sandbox.WHITELIST_RESERVED).to.not.be.equal(sandbox.strict.WHITELIST_RESERVED)
    expect(sandbox.WHITELIST_STRICT_RESERVED).to.not.be.equal(sandbox.strict.WHITELIST_STRICT_RESERVED)
  })

  it('sandbox.watch', function () {
    expect(oldSandbox.MIP.viewer.isIframed).to.be.equal(false)
    expect(sandbox.MIP.viewer.isIframed).to.be.equal(false)
    expect(sandbox.MIP.watch()).to.be.equal('watch')
    expect(sandbox.strict.MIP.watch()).to.be.equal('watch')
    expect(oldSandbox.MIP.watch()).to.be.equal('watch')
    expect(oldSandbox.strict.MIP.watch()).to.be.equal('watch')
    expect(oldSandbox).to.not.be.equal(sandbox)
    expect(window.MIP.sandbox).to.be.equal(window.MIP.sandbox)
  })
})
