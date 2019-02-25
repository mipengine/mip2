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

    let event = {one: 1, two: 2}
    expect(action.parse('tap: MIP.setData({num1: event.one, num2: \'event.two\'})', 'tap', event))
      .to.deep.equal([{
        type: 'tap',
        id: 'MIP',
        handler: 'setData',
        arg: '{num1: event.one, num2: \'event.two\'}',
        event: event
      }])
    expect(action.parse('tap: test.show(event.one, "event.two")', 'tap', event))
      .to.deep.equal([{
        type: 'tap',
        id: 'test',
        handler: 'show',
        arg: '1,"event.two"',
        event: event
      }])
    expect(action.parse('tap: test.show(20, some text)', 'tap', event))
      .to.deep.equal([{
        type: 'tap',
        id: 'test',
        handler: 'show',
        arg: '20, some text',
        event: event
      }])
  })

  it('#handleArguments', () => {
    let action = new EventAction()
    let event = {
      one: 1,
      two: 2,
      nest: {
        three: 3
      },
      str: 'string',
      list: [1, 2, 3],
      bool: true
    }
    expect(action.handleArguments('event', event)).to.equal('event')
    expect(action.handleArguments('event.', event)).to.equal('event.')
    expect(action.handleArguments('event.one', event)).to.equal('1')
    expect(action.handleArguments('event.one, test, 1, event.two', event)).to.equal('1,test,1,2')
    expect(action.handleArguments('event.three', event)).to.equal('undefined')
    expect(action.handleArguments('event.nest.three', event)).to.equal('3')
    expect(action.handleArguments('event.nest.four', event)).to.equal('undefined')
    expect(action.handleArguments('event.list', event)).to.equal('[1,2,3]')
    expect(action.handleArguments('event.nest', event)).to.equal('{"three":3}')
    expect(action.handleArguments('event.bool', event)).to.equal('true')
    expect(action.handleArguments('event..one', event)).to.equal('event..one')
    expect(action.handleArguments('event.one*', event)).to.equal('event.one*')
    expect(action.handleArguments('event.two-3', event)).to.equal('event.two-3')
    expect(action.handleArguments('event.1a', event)).to.equal('event.1a')
    expect(action.handleArguments('1 event.two', event)).to.equal('1 event.two')
    expect(action.handleArguments('"hello, event.one"', event)).to.equal('"hello, event.one"')
    expect(action.handleArguments('[1, event.two, event.bool], event.one', event)).to.equal('[1, event.two, event.bool],1')
    expect(action.handleArguments('{num: event.one, str: event.str}', event)).to.equal('{num: event.one, str: event.str}')
    expect(action.handleArguments('{ event.one : event.one }', event)).to.equal('{ event.one : event.one }')
    expect(action.handleArguments('event.one, {num1: event.one}, event.one+1', event)).to.equal('1,{num1: event.one},event.one+1')
  })

  it('#split', () => {
    let action = new EventAction()
    expect(action.split('a, "b, c", \'d, e\', `f, g`, (h, i), [j, k], {l, m}', ',')).to.deep.equal(['a', '"b, c"', '\'d, e\'', '`f, g`', '(h, i)', '[j, k]', '{l, m}'])
    expect(action.split('a, "b, c, {e, f}"', ',')).to.deep.equal(['a', '"b, c, {e, f}"'])
    expect(action.split('a, {b, [c, e)},', ',')).to.deep.equal(['a', '{b, [c, e)}', ''])
  })

  it('#convertToString', () => {
    let action = new EventAction()
    expect(action.convertToString(1)).to.be.equal('1')
    expect(action.convertToString(undefined)).to.be.equal('undefined')
    expect(action.convertToString(null)).to.be.equal('null')
    expect(action.convertToString('test')).to.be.equal('"test"')
    expect(action.convertToString({'a': 1})).to.be.equal('{"a":1}')
    expect(action.convertToString([1, 2, 3])).to.be.equal('[1,2,3]')
    expect(action.convertToString(true)).to.be.equal('true')
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
