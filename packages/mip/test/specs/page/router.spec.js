/**
 * @file router spec file
 * @author panyuqi(panyuqi@baidu.com)
 */

import Router from 'src/page/router'
import History from 'src/page/router/history'

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect, beforeEach, afterEach, sinon */

describe('history', function () {
  let spy
  let spy2
  let history

  beforeEach(function () {
    history = new History()
  })

  afterEach(function () {
    history = null
    if (spy && spy.restore) {
      spy.restore()
    }
    if (spy2 && spy2.restore) {
      spy2.restore()
    }
  })

  it('.go call window.history.go', function () {
    spy = sinon.stub(window.history, 'go').returns(true)

    history.go(2)
    expect(spy).to.have.been.calledWith(2)
  })

  it('.push', function () {
    spy = sinon.stub(history, 'transitionTo').callsFake(function (location, complete) {
      expect(location).to.be.equal('/')
      expect(complete).to.be.a('function')
      complete && complete(location)
    })
    history.push('/')
    expect(spy).to.have.been.called
  })

  it('.replace', function () {
    spy = sinon.stub(history, 'transitionTo').callsFake(function (location, complete) {
      expect(location).to.be.equal('/')
      expect(complete).to.be.a('function')
      complete && complete(location)
    })
    history.replace('/')
    expect(spy).to.have.been.called
  })

  it('.transitionTo call updateRoute before onComplete', function () {
    spy = sinon.stub(history, 'updateRoute').returns(true)
    // mock onComplete callback
    spy2 = sinon.stub().returns(true)
    history.transitionTo('/', spy2)
    expect(spy).to.have.been.calledBefore(spy2)
  })
})

describe('router', function () {
  let spy
  let spy2
  let router

  beforeEach(function () {
    router = new Router()
  })

  afterEach(function () {
    router = null
    if (spy && spy.restore) {
      spy.restore()
    }
    if (spy2 && spy2.restore) {
      spy2.restore()
    }
  })

  it('.push call history.replace in SF mode', function () {
    expect(window.MIP.standalone).to.be.false
    spy = sinon.stub(router.history, 'replace').returns(true)

    router.push('/')
    expect(spy).to.have.been.called
  })

  it('.push call history.push in standlone mode', function () {
    spy = sinon.stub(window.MIP, 'standalone').value(true)
    spy2 = sinon.stub(router.history, 'push').returns(true)

    router.push('/')
    expect(spy2).to.have.been.called
  })

  it('.replace call history.replace in both mode', function () {
    spy = sinon.stub(router.history, 'replace').returns(true)

    router.replace('/')
    expect(spy).to.have.been.called
  })

  it('.back call history.go(-1) in standalone mode', function () {
    spy = sinon.stub(window.MIP, 'standalone').value(true)
    spy2 = sinon.stub(router.history, 'go').returns(true)

    router.back()
    expect(spy2).to.have.been.calledWith(-1)
  })

  it('.forward call history.go(1) in standalone mode', function () {
    spy = sinon.stub(window.MIP, 'standalone').value(true)
    spy2 = sinon.stub(router.history, 'go').returns(true)

    router.forward()
    expect(spy2).to.have.been.calledWith(1)
  })

  it('.back will sendMessage to SF in SF mode', function () {
    spy = sinon.stub(window.MIP.viewer, 'sendMessage').returns(true)

    router.back()
    expect(spy).to.have.been.calledWith('history-navigate', {step: -1})
  })

  it('.forward will sendMessage to SF in SF mode', function () {
    spy = sinon.stub(window.MIP.viewer, 'sendMessage').returns(true)

    router.forward()
    expect(spy).to.have.been.calledWith('history-navigate', {step: 1})
  })
})
