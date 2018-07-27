/**
 * @file log send spec
 * @author sekiyika(pengxing@baidu.com)
 */

/* globals describe, it, expect */

import ls from 'src/log/log-send'

describe('log-send', function () {
  it('sendLog', function () {
    let msg = {}
    ls.sendLog('type', msg)

    expect(ls.data.event).to.be.equal('log')
    expect(msg.type).to.be.equal('type')
    expect(ls.data.data).to.be.equal(msg)

    ls.data = {}
  })
})
