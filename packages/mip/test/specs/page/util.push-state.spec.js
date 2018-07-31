/**
 * @file page.util.push-state spec file
 * @author panyuqi(panyuqi@baidu.com)
 */

import {pushState, replaceState} from 'src/page/util/push-state'
/* eslint-disable no-unused-expressions */
/* globals describe, it, expect, afterEach, sinon */

describe('push-state', function () {
  let spy

  afterEach(function () {
    if (spy && spy.restore) {
      spy.restore()
    }
  })

  it('.pushState call history.replaceState', function () {
    spy = sinon.stub(window.history, 'replaceState')
    spy.returns(true)

    pushState('testurl', true)

    expect(spy).to.have.been.calledWith()
  })

  it('.pushState call history.pushState', function () {
    spy = sinon.stub(window.history, 'pushState')
    spy.returns(true)

    pushState('testurl')

    expect(spy).to.have.been.calledWith()
  })

  it('.replaceState', function () {
    spy = sinon.stub(window.history, 'replaceState')
    spy.returns(true)

    replaceState('testurl')

    expect(spy).to.have.been.calledWith()
  })
})
