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
  },
  util: {
    platform: {
      isIOS: function () {
        return true
      }
    },
    dom: {
      create: function () {
        return 'create'
      }
    }
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
    expect(sandbox.strict.this(window)).to.be.equal(sandbox.strict)
    expect(sandbox.strict.this(document)).to.be.equal(sandbox.strict.document)
  })

  it('window', function () {
    expect(sandbox.window).to.be.equal(sandbox)
  })

  it('strict', function () {
    expect(sandbox.strict).to.be.equal(sandbox.strict.window)
    expect(sandbox.strict.MIP.sandbox).to.be.equal(sandbox.strict)
    expect(sandbox.strict.MIP.sandbox.strict).to.be.equal(sandbox.strict)
    expect(sandbox.strict.MIP.sandbox.strict.window).to.be.equal(sandbox.strict)
    expect(sandbox.strict.MIP.sandbox.window).to.be.equal(sandbox.strict)
    expect(Object.keys(sandbox.strict.MIP.sandbox.document)).to.be.deep.equal(['cookie', 'domain'])
    expect(Object.keys(sandbox.strict.MIP.util)).to.be.deep.equal(['platform', 'customStorage', 'jsonParse', 'string'])
    expect(sandbox.strict.MIP.util.platform.isIOS()).to.be.equal(true)
    expect(Object.keys(sandbox.strict.document)).to.be.deep.equal(['cookie', 'domain'])
    expect(sandbox.strict.document.cookie).to.be.equal(document.cookie)
    expect(sandbox.strict.MIP.viewer.isIframed).to.be.equal(MIP.viewer.isIframed)
  })

  it('document.createElement', function () {
    expect(sandbox.document.createElement('script').tagName).to.be.equal('SCRIPT')
    expect(sandbox.document.createElement('SCRIPT').tagName).to.be.equal('SCRIPT')
    expect(sandbox.document.createElement('DIV').tagName).to.be.equal('DIV')
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

  it('BMap', function () {
    expect(sandbox.BMap).to.be.equal(undefined)
    window.BMap = {a: 1}
    expect(sandbox.BMap).to.be.equal(window.BMap)
    sandbox.BMap = {a: 2}
    expect(window.BMap.a).to.be.equal(2)
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
