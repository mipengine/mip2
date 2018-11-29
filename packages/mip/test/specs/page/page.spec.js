/**
 * @file page spec file
 * @author panyuqi(panyuqi@baidu.com)
 */
import {
  MESSAGE_ROUTER_PUSH,
  MESSAGE_ROUTER_REPLACE,
  MESSAGE_ROUTER_BACK,
  MESSAGE_ROUTER_FORWARD,
  MESSAGE_CROSS_ORIGIN,
  MESSAGE_BROADCAST_EVENT
} from 'src/page/const'

/* eslint-disable no-unused-expressions */
/* globals describe, it, expect, afterEach, sinon */

// =============================== Router methods ===============================
describe('page API #router', function () {
  let spy
  let spy2
  let page = window.MIP.viewer.page

  afterEach(function () {
    if (spy && spy.restore) {
      spy.restore()
    }
    if (spy2 && spy2.restore) {
      spy2.restore()
    }
  })

  it('.back notifyRootPage with MESSAGE_ROUTER_BACK message', function () {
    spy = sinon.stub(page, 'notifyRootPage').returns(true)

    page.back()
    expect(spy).to.have.been.calledWith({type: MESSAGE_ROUTER_BACK})
  })

  it('.forward notifyRootPage with MESSAGE_ROUTER_FORWARD message', function () {
    spy = sinon.stub(page, 'notifyRootPage').returns(true)

    page.forward()
    expect(spy).to.have.been.calledWith({type: MESSAGE_ROUTER_FORWARD})
  })

  it('.push notifyRootPage with MESSAGE_ROUTER_PUSH message', function () {
    spy = sinon.stub(page, 'notifyRootPage').returns(true)

    page.push('/')
    expect(spy).to.have.been.calledWith({
      type: MESSAGE_ROUTER_PUSH,
      data: {route: '/', options: {}}
    })
  })

  it('.replace notifyRootPage with MESSAGE_ROUTER_REPLACE message', function () {
    spy = sinon.stub(page, 'notifyRootPage').returns(true)

    page.replace('/')
    expect(spy).to.have.been.calledWith({
      type: MESSAGE_ROUTER_REPLACE,
      data: {route: '/', options: {}}
    })
  })
})

// =============================== Message methods ===============================
describe('page API #message', function () {
  let spy
  let spy2
  let page = window.MIP.viewer.page

  afterEach(function () {
    if (spy && spy.restore) {
      spy.restore()
    }
    if (spy2 && spy2.restore) {
      spy2.restore()
    }
  })

  it('.notifyRootPage', function () {
    spy = sinon.stub(window, 'postMessage').returns(true)

    page.notifyRootPage({type: 'test-message'})
    expect(spy).to.have.been.calledWith({type: 'test-message'}, window.location.origin)
  })

  it('.emitCustomEvent in cross origin scene', function () {
    let customEvent = {name: 'e', data: {}}
    spy = sinon.stub(window, 'postMessage').returns(true)

    page.emitCustomEvent(window, true, customEvent)

    // postMessage MESSAGE_CROSS_ORIGIN to targetWindow
    expect(spy).to.have.been.calledWith({
      type: MESSAGE_CROSS_ORIGIN,
      data: customEvent
    }, '*')
  })

  it('.broadcastCustomEvent in root page', function () {
    let customEvent = {name: 'e', data: {}}
    spy = sinon.stub(window, 'postMessage').returns(true)

    page.addChild({
      pageId: 'http://example.com/path',
      targetWindow: window
    })

    page.addChild({
      pageId: 'http://example.com/path2',
      targetWindow: window
    })

    // add a duplicate child
    page.addChild({
      pageId: 'http://example.com/path2',
      targetWindow: window
    })

    page.broadcastCustomEvent(customEvent)

    // postMessage called twice in children
    expect(spy).to.have.been.calledTwice
    expect(spy).to.have.been.calledWith({
      type: MESSAGE_CROSS_ORIGIN,
      data: customEvent
    }, '*')

    page.children = []
  })

  it('.broadcastCustomEvent in child page', function () {
    let customEvent = {name: 'e', data: {}}
    spy = sinon.stub(window.parent, 'postMessage').returns(true)
    spy2 = sinon.stub(page, 'isRootPage').value(false)

    page.broadcastCustomEvent(customEvent)

    expect(spy).to.have.been.calledWith({
      type: MESSAGE_BROADCAST_EVENT,
      data: customEvent
    }, '*')
  })
})

// =============================== Root Page methods ===============================
describe('page API #root page', function () {
  let spy
  let spy2
  let page = window.MIP.viewer.page

  afterEach(function () {
    if (spy && spy.restore) {
      spy.restore()
    }
    if (spy2 && spy2.restore) {
      spy2.restore()
    }
  })

  it('.getPageById', function () {
    page.addChild({
      pageId: 'http://example.com/path',
      targetWindow: window
    })

    page.addChild({
      pageId: 'http://example.com/path2',
      targetWindow: window
    })

    expect(page.getPageById('http://example.com/path').pageId).to.be.equal('http://example.com/path')
    expect(page.getPageById('Not exist')).to.be.null
  })

  it('.getElementsInRootPage', function () {
    expect(page.getElementsInRootPage().length > 0).to.be.true
  })
})

// =============================== UI methods ===============================
describe('page API #UI', function () {
  let spy
  let spy2
  let page = window.MIP.viewer.page

  afterEach(function () {
    if (spy && spy.restore) {
      spy.restore()
    }
    if (spy2 && spy2.restore) {
      spy2.restore()
    }
  })

  it('.setupBouncyHeader', function () {
    page.setupBouncyHeader()
    expect(page.bouncyHeaderSetup).to.be.true
  })

  it('.destroy', function () {
    page.destroy()
  })

  it('.togglePageMask', function () {
    let toggle = false
    let options = {}
    spy = sinon.stub(page, 'emitCustomEvent').returns(true)

    // in child page
    page.togglePageMask(toggle, options)
    expect(spy).to.have.been.not.called

    // in root page
    spy2 = sinon.stub(page, 'isRootPage').value(false)
    page.togglePageMask(toggle, options)
    expect(spy).to.have.been.calledWith(window.parent, true, {
      name: 'mipShellEvents',
      data: {
        type: 'togglePageMask',
        data: {
          toggle,
          options
        }
      }
    })
  })

  it('.toggleDropdown', function () {
    page.toggleDropdown(true)
    spy2 = sinon.stub(page, 'isRootPage').value(false)
    page.toggleDropdown(true)
  })
})
