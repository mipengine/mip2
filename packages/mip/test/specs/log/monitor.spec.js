/**
 * @file monitor spec
 * @author sekiyika(pengxing@baidu.com)
 */

/* globals describe, it, expect, sinon */

import ls from 'src/log/log-send'
import { errorHandler } from 'src/log/monitor'

describe('monitor', function () {
  it('catch error', function (done) {
    let filename = 'https://c.mipcdn.com/static/v2/mip-sidebar/mip-sidebar.js'
    let message = 'test monitor'
    let spy = sinon.stub(ls, 'sendLog').callsFake(function (type, msg = {}) {
      expect(type).to.be.equal('mip-stability')
      expect(msg).to.be.a('object')
      expect(msg.msg).to.be.equal(message)
      expect(msg.file).to.be.equal(filename)
      spy.restore()
      done()
    })

    let e = new Error(message)
    e.filename = filename

    errorHandler(e, { rate: 1 })
  })
})
