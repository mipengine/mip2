/**
 * @file client-prerender.spec.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import prerenderInstance from 'src/client-prerender'
import hash from 'src/util/hash'

let ClientPrerender = prerenderInstance.constructor

describe('client-prerender', function () {
  it('.execute fn should be delay if prerender === 1', function (done) {
    let get = sinon.stub(hash, 'get').callsFake(() => '1')

    let prerender = new ClientPrerender()

    let fn = sinon.spy()
    let ele = document.createElement('div')

    prerender.execute(fn, ele)
    expect(fn.called).to.be.false

    get.callsFake(() => '')
    window.postMessage({
      name: window.name,
      event: 'page-active'
    }, window.location.origin)

    get.restore()
    setTimeout(() => {
      sinon.assert.calledOnce(fn)
      done()
    }, 100)
  })

  it('params ele maybe be null', function (done) {
    let get = sinon.stub(hash, 'get').callsFake(() => '1')

    let prerender = new ClientPrerender()

    let fn = sinon.spy()

    prerender.execute(fn)
    expect(fn.called).to.be.false

    get.callsFake(() => '')
    window.postMessage({
      name: window.name,
      event: 'page-active'
    }, window.location.origin)

    get.restore()
    setTimeout(() => {
      sinon.assert.calledOnce(fn)
      done()
    }, 100)
  })

  it('.execute fn should be called imediately if prerender !== 1', function () {
    let prerender = new ClientPrerender()

    let fn = sinon.spy()
    let ele = document.createElement('div')

    prerender.execute(fn, ele)
    sinon.assert.calledOnce(fn)
  })

  it('wrong origin', function (done) {
    let get = sinon.stub(hash, 'get').callsFake(() => '1')

    let prerender = new ClientPrerender()

    let fn = sinon.spy()
    let ele = document.createElement('div')
    ele.setAttribute('prerender', 'false')

    prerender.execute(fn, ele)

    window.postMessage({
      name: window.name,
      event: 'page-active'
    }, 'http://error:9876')
    get.restore()
    setTimeout(() => {
      expect(fn.called).to.be.false
      done()
    }, 100)
  })

  it('prerender attribute should be not delay fn', function () {
    let prerender = new ClientPrerender()

    let fn = sinon.spy()
    let ele = document.createElement('div')
    ele.setAttribute('prerender', '')

    prerender.execute(fn, ele)
    sinon.assert.calledOnce(fn)
  })
})
