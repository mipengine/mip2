/**
 * @file util customStorage spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect, beforeEach, afterEach, sinon, localStorage */

import util from 'src/util'

const platform = util.platform
const CustomStorage = util.customStorage

let ls = new CustomStorage(0)
let as = new CustomStorage(1)
let cs = new CustomStorage(2)
let name = 'name'
let nameValue = 'testName'
let expireName = 'expireName'
let expireNameValue = 'expireTestName'
let age = 'age'
let ageValue = '22'
let expire = 1
let exceedName = 'exceedName'
let exceedNameValue
for (let i = 0; i < 1024 * 1024 * 5; i++) {
  exceedNameValue += 'a'
}

let cacheStub

// describe('customStorage', function() {
describe('localstorage', function () {
  beforeEach(function () {
    cacheStub = sinon.stub(ls, '_isCachePage')
    cacheStub.callsFake(() => true)
  })

  afterEach(function () {
    cacheStub.restore()
  })

  it('set', function () {
    // Check boundary condition
    ls.set(null, null)

    ls.set(name, nameValue)
    ls.set(age, ageValue, expire)
    expect(ls.get(name)).to.be.equal(nameValue)
  })

  it('get', function () {
    // Check boundary condition
    ls.get(null)

    expect(ls.get(name)).to.be.equal(nameValue)
  })

  it('rm', function () {
    // Check boundary condition
    ls.rm(null)

    ls.set(name, nameValue)
    ls.rm(name)
    expect(!!ls.get(name)).to.be.false
  })

  it.skip('rmExpires', function (done) {
    ls.set(expireName, expireNameValue, 1)
    setTimeout(function () {
      ls.rmExpires()
      expect(!!ls.get(expireName)).to.be.false
      done()
    }, 50)
  })

  it('clear', function () {
    ls.clear()
    expect(!!ls.get(name)).to.be.false
    expect(!!ls.get(age)).to.be.false
  })

  it('exceed', function (done) {
    if (ls._supportLs()) {
      try {
        localStorage.setItem(name, nameValue, 20000)
        localStorage.setItem(age, ageValue, 20000)
        localStorage.setItem('test', 'test')
        ls._setLocalStorage(exceedName, exceedNameValue, function (data) {})
        !!ls.get(exceedName)
      } catch (e) {
        done()
      }
    } else {
      done()
    }
  })

  it('coverBranch', function () {
    let stub = sinon.stub(ls, '_supportLs')
    stub.callsFake(() => false)
    ls._getLocalStorage()
    ls._rmLocalStorage(name)
    ls.rmExpires()
    ls._isExceed({
      name: 'NS_ERROR_DOM_QUOTA_REACHED',
      code: 1014
    })
    ls._isExceed({
      number: -2147024882
    })
    stub.restore()
  })
})

describe('localstorage-nocache', function () {
  beforeEach(function () {
    cacheStub = sinon.stub(ls, '_isCachePage')
    cacheStub.callsFake(() => false)
  })

  afterEach(function () {
    cacheStub.restore()
  })

  it('noSupportLs', function () {
    let stub = sinon.stub(ls, '_supportLs')
    stub.callsFake(() => false)
    ls.set(name, nameValue)
    ls.set(age, ageValue)
    expect(!!ls.get(name)).to.be.true
    ls.rm(name)
    expect(!!ls.get(name)).to.be.false
    ls.clear()
    expect(!!ls.get(age)).to.be.false
    try {
      ls.set(exceedName, exceedNameValue, function () {})
      expect(!!ls.get(exceedName)).to.be.false
    } catch (e) {}
    stub.restore()
  })

  it('supportLs', function () {
    let stub = sinon.stub(ls, '_supportLs')
    stub.callsFake(() => true)
    ls.set(name, nameValue)
    ls.set(age, ageValue)
    expect(!!ls.get(name)).to.be.true
    ls.rm(name)
    expect(!!ls.get(name)).to.be.false
    ls.clear()
    expect(!!ls.get(age)).to.be.false
    try {
      ls.set(exceedName, exceedNameValue, function () {})
      expect(!!ls.get(exceedName)).to.be.false
    } catch (e) {}
    stub.restore()
  })
})

describe('localstorage-isCachePage', function () {
  it('isCachePage', function () {
    expect(ls._isCachePage()).to.be.false
  })
})

describe('asyncstorage', function () {
  it('request1', function (done) {
    // Check boundary condition
    as.request()

    let server = sinon.fakeServer.create()
    server.respondWith('POST', '/req1', [200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, '{ok:1}'])
    as.request({
      url: '/req1',
      method: 'POST',
      body: 'content',
      headers: {
        'Access-Control-Request-Headers': 'X-PINGOTHER'
      },
      success (data) {
        done()
      },
      error () {
        done()
      }
    })
    setTimeout(function () {
      server.respond()
    }, 100)
  })
  it('request2', function (done) {
    as.request({
      url: 'http://localhost:3000/req2',
      mode: 'cors',
      credentials: 'omit',
      cache: 'default',
      success: function (data) {
        done()
      },
      error () {
        done()
      }
    })
    setTimeout(function () {
      done()
    }, 200)
  })
  it('request3', function (done) {
    let server = sinon.fakeServer.create()
    server.respondWith('POST', '/req3', [200, {
      'Content-Type': 'application/json'
    }, '{}'])
    as.request({
      url: '/req3',
      method: 'POST',
      success: function (data) {
        done()
      },
      error () {
        done()
      }
    })
    setTimeout(function () {
      server.respond()
    }, 300)
  })
})

// 先针对谷歌浏览器测试，后续需要优化方法
if (platform.isChrome() && !platform.isIos()) {
  describe('asyncstorage', function () {
    it('delExceedCookie', function () {
      let exceedNameValue = ''
      for (let i = 0; i < 1024 * 3; i++) {
        exceedNameValue += 'a'
      };
      document.cookie = 'test1=' + exceedNameValue + ';path=/;domain=' + window.location.hostname
      cs.delExceedCookie()
      document.cookie = 'test2=' + exceedNameValue + ';path=/;domain=' + window.location.hostname
      document.cookie = 'test3=' + exceedNameValue + ';path=/;domain=' + window.location.hostname
      document.cookie = 'test4=' + exceedNameValue + ';path=/;domain=' + window.location.hostname
      document.cookie = 'test5=' + exceedNameValue + ';path=/;domain=' + window.location.hostname
      document.cookie = 'test6=' + exceedNameValue + ';path=/;domain=' + window.location.hostname
      cs.delExceedCookie()
      expect(document.cookie.length / 1024).to.be.below(3)
    })

    it('not isIframed', function () {
      let stub = sinon.stub(cs, '_notIframed')
      stub.callsFake(() => true)
      cs.delExceedCookie()
      stub.restore()
    })
  })
}

/* eslint-enable no-unused-expressions */
