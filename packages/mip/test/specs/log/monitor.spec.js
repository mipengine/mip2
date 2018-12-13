/**
 * @file monitor spec
 * @author sekiyika(pengxing@baidu.com)
 */

/* globals describe, it, expect, sinon */

import viewer from 'src/viewer'
import { errorHandler } from 'src/log/error-monitor'

describe('monitor', function () {
  it('catch error', function (done) {
    let filename = 'https://c.mipcdn.com/static/v2/mip-sidebar/mip-sidebar.js'
    let message = 'test monitor'

    let spy = sinon.stub(viewer, 'sendMessage').callsFake(function (eventName, data = {}) {
      expect(eventName).to.be.equal('stability-log')
      expect(data).to.be.a('object')
      expect(data.msg).to.be.equal(message)
      expect(data.file).to.be.equal(filename)
      spy.restore()
      done()
    })

    let e = new Error(message)
    e.filename = filename

    errorHandler(e, { rate: 1 })
  })

  it('should ignore report when not mipcdn file', function () {
    let filename = 'https://120ask.com/static/v2/mip-a/mip-a.js'
    let message = 'test error monitor'
    let spy = sinon.stub(viewer, 'sendMessage')

    let e = new Error(message)
    e.filename = filename

    errorHandler(e, { rate: 1 })
    expect(spy).to.not.be.called
    spy.restore()
  })

  it('should ignore report when not core or mip-extensions', function () {
    let filename = 'https://c.mipcdn.com/static/v2/mip-a/mip-a.js'
    let message = 'test error monitor'
    let spy = sinon.stub(viewer, 'sendMessage')

    let e = new Error(message)
    e.filename = filename

    errorHandler(e, { rate: 1 })
    expect(spy).to.not.be.called
    spy.restore()
  })
})
