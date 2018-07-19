/**
 * @file sandbox.spec.js
 * @author clark-t (clarktanglei@163.com)
 */

/* globals describe, it */

// var chai = require('chai')
// var expect = chai.expect
var sandbox = require('../../lib/sandbox')

// 假定 MIP 在 sandbox 后定义
window.MIP = {
  watch: function () {
    return 'watch'
  }
}

describe('sandbox', function () {
  it('keys', function () {
    expect(Object.keys(sandbox)).to.include.members(['WHITELIST', 'strict'])
  })

  it('this', function () {
    expect(typeof sandbox.this).to.be.equal('function')
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
    expect(sandbox.WHITELIST).to.not.be.equal(sandbox.strict.WHITELIST)
    expect(sandbox.WHITELIST_STRICT).to.not.be.equal(sandbox.strict.WHITELIST_STRICT)
    expect(sandbox.WHITELIST_RESERVED).to.not.be.equal(sandbox.strict.WHITELIST_RESERVED)
    expect(sandbox.WHITELIST_STRICT_RESERVED).to.not.be.equal(sandbox.strict.WHITELIST_STRICT_RESERVED)
  })

  it('sandbox.watch', function () {
    expect(sandbox.MIP.watch()).to.be.equal('watch')
    expect(sandbox.strict.MIP.watch()).to.be.equal('watch')
  })
})
