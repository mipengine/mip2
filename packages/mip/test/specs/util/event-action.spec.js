/**
 * @file util event-action spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect, sinon, MIP */

import EventAction from 'src/util/event-action'

let mockElement = {
  executeEventAction (action) {
    this.arg = action.arg
  },
  tagName: 'mip-test'
}

describe('event-action', function () {
  it('white list', function () {
    let MIP = window.MIP = window.MIP || {}
    MIP.setData = function () {}
    MIP.$set = function () {}
    let action = new EventAction({
      getTarget () {
        return mockElement
      }
    })

    action.execute('tap', {
      getAttribute () {
        return 'tap:MIP.setData({a:1})'
      }
    }, 'event')
    action.execute('tap', {
      getAttribute () {
        return 'tap:MIP.$set({a:1})'
      }
    }, 'event')
    expect(mockElement.arg).to.undefined
  })

  it('special target and handler', function () {
    let setData = sinon.spy(MIP, 'setData')
    let $set = sinon.spy(MIP, '$set')
    let ele = document.createElement('div')
    ele.setAttribute('on', 'click:MIP.setData({a:1}) click:MIP.$set({a:parseInt(1,10)}) ')
    let action = new EventAction({
      getTarget () {
        return ele
      }
    })
    action.execute('click', ele, {})
    setData.restore()
    $set.restore()
    let expectedData = {
      a: 1
    }
    sinon.assert.calledWith(setData, expectedData)
    sinon.assert.calledWith($set, expectedData)
  })

  it('should be work without Proxy', function () {
    let OriginalProxy = window.Proxy
    window.Proxy = undefined
    let setData = sinon.spy(MIP, 'setData')
    let $set = sinon.spy(MIP, '$set')
    let ele = document.createElement('div')
    ele.setAttribute('on', 'click:MIP.setData({a:1}) click:MIP.$set({a:parseInt(1,10)}) ')
    let action = new EventAction({
      getTarget () {
        return ele
      }
    })
    action.execute('click', ele, {})
    setData.restore()
    $set.restore()
    let expectedData = {
      a: 1
    }
    sinon.assert.calledWith(setData, expectedData)
    sinon.assert.calledWith($set, expectedData)
    window.Proxy = OriginalProxy
  })

  it('#getTarget', function () {
    let ele = document.createElement('div')
    ele.setAttribute('on', 'tap:testid.open')
    let action = new EventAction()
    sinon.stub(document, 'getElementById').callsFake(id => {})
    let checkTarget = sinon.spy(action, 'checkTarget')
    action.execute('tap', ele, {})
    checkTarget.restore()
    sinon.assert.calledOnce(checkTarget)
  })

  it('#parse', function () {
    let action = new EventAction()
    expect(action.parse('click:MIP.setData({name: "fakeclick"}) tap: MIP.setData({name: "faketap"})', 'tap', {}))
      .to.deep.equal([{
        type: 'tap',
        id: 'MIP',
        handler: 'setData',
        arg: '{name: "faketap"}',
        event: {}
      }])

    expect(action.parse('tap: MIP.setData({name: "faketap ()\\\'"})', 'tap', {}))
      .to.deep.equal([{
        type: 'tap',
        id: 'MIP',
        handler: 'setData',
        arg: '{name: "faketap ()\\\'"}',
        event: {}
      }])
  })

  it('error handler', function () {
    let ele = document.createElement('div')
    ele.setAttribute('on', 'click:MIP.anotherMethod({a:1}) ')
    let action = new EventAction({
      getTarget () {
        return ele
      }
    })
    expect(() => action.execute('click', ele, {}))
      .to.throw(`Can not find handler "anotherMethod" from MIP.`)
  })

  it('normal', function (done) {
    let action = new EventAction({
      getTarget () {
        return mockElement
      }
    })

    action.execute('tap', {
      getAttribute () {
        return 'tap:id.abc(123)'
      }
    }, 'event')
    setTimeout(() => {
      expect(mockElement.arg).to.equal('123')
      done()
    })
  })

  it('error check', function () {
    let action = new EventAction()
    expect(() => action.parse('scroll:id.abc(123', 'tab')).to.throw(SyntaxError)
    expect(action.parse(123)).to.eql([])
  })

  it('emtpy target', function () {
    let action = new EventAction()
    expect(action.execute('tap', null, {})).to.be.undefined
  })
})

/* eslint-enable no-unused-expressions */
