/**
 * @file util event-action spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect, sinon, MIP */

import EventAction from 'src/util/event-action'
import dom from 'src/util/dom/dom'
import {actions as elementActions} from 'src/util/event-action/whitelist/element-action'
import {actions as mipActions} from 'src/util/event-action/whitelist/mip-action'

let mockElement = {
  executeEventAction (action) {
    this.arg = action.arg
  },
  tagName: 'mip-test'
}

let action = new EventAction()

let el = document.createElement('div')
let target = dom.create("<input autofocus id='test-event-action'>")

describe.only('Event Action', () => {

  before(() => {
    document.body.appendChild(el)
    document.body.appendChild(target)
  })

  after(() => {
    document.body.removeChild(el)
    document.body.removeChild(target)
  })

  describe('element action', () => {

    it('should handle scroll to', () => {
      let scrollTo = sinon.spy(elementActions, 'scrollTo')
      el.setAttribute('on', "eventName:test-event-action.scrollTo(duration=200, position='center')")
      action.execute('eventName', el, {})
      scrollTo.restore()
      // sinon.assert.calledWithMatch(scrollTo, {
      //   handler: 'scrollTo',
      //   event: {},
      //   args: {duration: 200, position: 'center'},
      //   target
      // })
      let argument = scrollTo.args[0][0]
      expect(argument.args).to.be.eql({duration: 200, position: 'center'})
      expect(argument.target.id).to.be.equal(target.id)
    })

    it('should handle hide', () => {
      let hide = sinon.spy(elementActions, 'hide')
      el.setAttribute('on', "eventName:test-event-action.hide")
      target.classList.remove('mip-hide')
      action.execute('eventName', el, {})
      hide.restore()

      let argument = hide.args[0][0]
      expect(argument.target.id).to.be.equal(target.id)
      expect(target.classList.contains('mip-hide')).to.be.true
      target.classList.remove('mip-hide')
    })

    it('should handle show', () => {
      let show = sinon.spy(elementActions, 'show')
      el.setAttribute('on', "eventName:test-event-action.show")
      target.classList.add('mip-hide')
      action.execute('eventName', el, {})
      show.restore()

      let argument = show.args[0][0]
      expect(argument.target.id).to.be.equal(target.id)
      expect(target.classList.contains('mip-hide')).to.be.false
      expect(document.activeElement === target).to.be.true
    })

    it('should handle toggle', () => {
      let toggle = sinon.spy(elementActions, 'toggle')
      el.setAttribute('on', "eventName:test-event-action.toggle")
      action.execute('eventName', el, {})
      toggle.restore()

      let argument = toggle.args[0][0]
      expect(argument.target.id).to.be.equal(target.id)
      expect(target.classList.contains('mip-hide')).to.be.true

      action.execute('eventName', el, {})
      expect(target.classList.contains('mip-hide')).to.be.false
      expect(document.activeElement === target).to.be.true
    })

    it('should handle toggleClass', () => {
      let toggleClass = sinon.spy(elementActions, 'toggleClass')
      el.setAttribute('on', "eventName:test-event-action.toggleClass(class='toggled', force=true)")
      action.execute('eventName', el, {})
      toggleClass.restore()

      let argument = toggleClass.args[0][0]
      expect(argument.target.id).to.be.equal(target.id)
      expect(argument.args).to.be.eql({class: 'toggled', force: true})
      expect(target.classList.contains('toggled')).to.be.true

      action.execute('eventName', el, {})
      expect(target.classList.contains('toggled')).to.be.true

      el.setAttribute('on', "eventName:test-event-action.toggleClass(class='toggled')")
      action.execute('eventName', el, {})
      expect(target.classList.contains('toggled')).to.be.false
    })

    it('should handle focus', () => {
      let focus = sinon.spy(elementActions, 'focus')
      el.setAttribute('on', "eventName:test-event-action.focus")
      target.blur()
      action.execute('eventName', el, {})
      focus.restore()

      let argument = focus.args[0][0]
      expect(argument.target.id).to.be.equal(target.id)
      expect(document.activeElement === target).to.be.true
    })

    it('should execute custom element action', () => {
      let fixed = dom.create('<mip-fixed id="fixed" type="top"></mip-fixed>')
      document.body.appendChild(fixed)
      el.setAttribute('on', 'eventName:fixed.close')
      action.execute('eventName', el, )
      expect(fixed.style.display).to.be.equal('none')
      document.body.removeChild(fixed)
    })

    it('should support event dot syntax', () => {
      let toggleClass = sinon.spy(elementActions, 'toggleClass')
      el.setAttribute('on', 'eventName:test-event-action.toggleClass(class=event.className)')
      action.execute('eventName', el, {className: 'event'})
      toggleClass.restore()

      let argument = toggleClass.args[0][0]
      expect(argument.target.id).to.be.equal(target.id)
      expect(argument.args).to.be.eql({class: 'event'})
      expect(target.classList.contains('event')).to.be.true
    })
  })

  describe('mip action', () => {
    it('should handle scroll to', () => {
      let scrollTo = sinon.spy(mipActions, 'scrollTo')
      el.setAttribute('on', "eventName:MIP.scrollTo(id='test-event-action', duration=200, position='center')")
      action.execute('eventName', el, {})
      scrollTo.restore()
      let argument = scrollTo.args[0][0]
      expect(argument).to.be.eql({duration: 200, position: 'center', id: 'test-event-action'})
    })

    it('should handle navigate to', () => {
      let navigateTo = sinon.stub(mipActions, 'navigateTo')
      el.setAttribute('on', "eventName:MIP.navigateTo(url='https://www.baidu.com', target='_blank', opener=true)")
      action.execute('eventName', el, {})
      navigateTo.restore()
      let argument = navigateTo.args[0][0]
      expect(argument).to.be.eql({url: 'https://www.baidu.com', target: '_blank', opener: true})
    })

    it('should handle close or navigate to', () => {
      let closeOrNavigateTo = sinon.stub(mipActions, 'closeOrNavigateTo')
      el.setAttribute('on', "eventName:MIP.closeOrNavigateTo(url='https://www.baidu.com', target='_blank', opener=true)")
      action.execute('eventName', el, {})
      closeOrNavigateTo.restore()
      let argument = closeOrNavigateTo.args[0][0]
      expect(argument).to.be.eql({url: 'https://www.baidu.com', target: '_blank', opener: true})
    })

    it('should handle go back', () => {
      let goBack = sinon.stub(mipActions, 'goBack')
      el.setAttribute('on', "eventName:MIP.goBack")
      action.execute('eventName', el, {})
      goBack.restore()
      expect(goBack).to.be.calledOnce
    })

    it('should handle print', () => {
      let print = sinon.stub(mipActions, 'print')
      el.setAttribute('on', "eventName:MIP.print")
      action.execute('eventName', el, {})
      print.restore()
      expect(print).to.be.calledOnce
    })

    it('should handle setData', () => {
      window.m.setDataTest = 1
      let setData = sinon.spy(mipActions, 'setData')
      el.setAttribute('on', "eventName:MIP.setData({setDataTest: m.setDataTest+1})")
      action.execute('eventName', el, {})
      setData.restore()
      let argument = setData.args[0][0]
      expect(argument).to.be.eql({setDataTest: 2})
      expect(window.m.setDataTest).to.be.equal(2)
    })

    it('should handle $set', () => {
      window.m.$setTest = 1
      let $set = sinon.spy(mipActions, '$set')
      el.setAttribute('on', "eventName:MIP.$set({$setTest: 2})")
      action.execute('eventName', el, {})
      $set.restore()
      let argument = $set.args[0][0]
      expect(argument).to.be.eql({$setTest: 2})
      expect(window.m.$setTest).to.be.equal(2)
    })
  })

  // it('white list', () => {
  //   let MIP = window.MIP || {}
  //   MIP.setData = () => {}
  //   MIP.$set = () => {}
  //   let action = new EventAction({
  //     getTarget () {
  //       return mockElement
  //     }
  //   })

  //   action.execute('tap', {
  //     getAttribute () {
  //       return 'tap:MIP.setData({a:1})'
  //     }
  //   }, 'event')
  //   action.execute('tap', {
  //     getAttribute () {
  //       return 'tap:MIP.$set({a:1})'
  //     }
  //   }, 'event')
  //   expect(mockElement.arg).to.undefined
  // })

  // it('special target and handler', () => {
  //   let setData = sinon.spy(MIP, 'setData')
  //   let $set = sinon.spy(MIP, '$set')
  //   let ele = document.createElement('div')
  //   ele.setAttribute('on', 'click:MIP.setData({a:1}) click:MIP.$set({a:parseInt(1,10)}) ')
  //   let action = new EventAction({
  //     getTarget () {
  //       return ele
  //     }
  //   })
  //   action.execute('click', ele, {})
  //   setData.restore()
  //   $set.restore()
  //   let expectedData = {
  //     a: 1
  //   }
  //   sinon.assert.calledWith(setData, expectedData)
  //   sinon.assert.calledWith($set, expectedData)
  // })

  // it('should be work without Proxy', () => {
  //   let OriginalProxy = window.Proxy
  //   window.Proxy = undefined
  //   let setData = sinon.spy(MIP, 'setData')
  //   let $set = sinon.spy(MIP, '$set')
  //   let ele = document.createElement('div')
  //   ele.setAttribute('on', 'click:MIP.setData({a:1}) click:MIP.$set({a:parseInt(1,10)}) ')
  //   let action = new EventAction({
  //     getTarget () {
  //       return ele
  //     }
  //   })
  //   action.execute('click', ele, {})
  //   setData.restore()
  //   $set.restore()
  //   let expectedData = {
  //     a: 1
  //   }
  //   sinon.assert.calledWith(setData, expectedData)
  //   sinon.assert.calledWith($set, expectedData)
  //   window.Proxy = OriginalProxy
  // })

  // it('#getTarget', () => {
  //   el.setAttribute('on', 'tap:testid.open')
  //   sinon.stub(document, 'getElementById').callsFake(id => {})
  //   let checkTarget = sinon.spy(action, 'checkTarget')
  //   action.execute('tap', ele, {})
  //   checkTarget.restore()
  //   sinon.assert.calledOnce(checkTarget)
  // })

  // it('#parse', () => {
  //   let action = new EventAction()
  //   expect(action.parse('click:MIP.setData({name: "fakeclick"}) tap: MIP.setData({name: "faketap"})', 'tap', {}))
  //     .to.deep.equal([{
  //       type: 'tap',
  //       id: 'MIP',
  //       handler: 'setData',
  //       arg: '{name: "faketap"}',
  //       event: {}
  //     }])

  //   expect(action.parse('tap: MIP.setData({name: "faketap ()\\\'"})', 'tap', {}))
  //     .to.deep.equal([{
  //       type: 'tap',
  //       id: 'MIP',
  //       handler: 'setData',
  //       arg: '{name: "faketap ()\\\'"}',
  //       event: {}
  //     }])

  //   let event = {one: 1, two: 2}
  //   expect(action.parse('tap: MIP.setData({num1: event.one, num2: \'event.two\'})', 'tap', event))
  //     .to.deep.equal([{
  //       type: 'tap',
  //       id: 'MIP',
  //       handler: 'setData',
  //       arg: '{num1: event.one, num2: \'event.two\'}',
  //       event: event
  //     }])
  //   expect(action.parse('tap: test.show(event.one, "event.two")', 'tap', event))
  //     .to.deep.equal([{
  //       type: 'tap',
  //       id: 'test',
  //       handler: 'show',
  //       arg: '1,"event.two"',
  //       event: event
  //     }])
  //   expect(action.parse('tap: test.show(20, some text)', 'tap', event))
  //     .to.deep.equal([{
  //       type: 'tap',
  //       id: 'test',
  //       handler: 'show',
  //       arg: '20, some text',
  //       event: event
  //     }])
  // })

  it.skip('error handler', () => {
    el.setAttribute('on', 'click:MIP.anotherMethod({a:1}) ')
    expect(() => action.execute('click', el, {})).to.throw(new Error('不支持 MIP.anotherMethod 全局方法'))
  })

  // it('normal', done => {
  //   let action = new EventAction({
  //     getTarget () {
  //       return mockElement
  //     }
  //   })

  //   action.execute('tap', {
  //     getAttribute () {
  //       return 'tap:id.abc(123)'
  //     }
  //   }, 'event')
  //   setTimeout(() => {
  //     expect(mockElement.arg).to.equal('123')
  //     done()
  //   })
  // })

  // it('error check', () => {
  //   let action = new EventAction()
  //   expect(() => action.parse('scroll:id.abc(123', 'tab')).to.throw(SyntaxError)
  //   expect(action.parse(123)).to.eql([])
  // })

  it('emtpy target', () => {
    expect(action.execute('tap', null, {})).to.be.undefined
  })
})

// describe('split', () => {
//   let action = new EventAction()
//   it('should split the string by the seperator outside the paired mark', () => {
//     expect(action.split('a, "b, c", \'d, e\', `f, g`, (h, i), [j, k], {l, m}', ',')).to.deep.equal(['a', '"b, c"', '\'d, e\'', '`f, g`', '(h, i)', '[j, k]', '{l, m}'])
//     expect(action.split('a, "b, c, {e, f}"', ',')).to.deep.equal(['a', '"b, c, {e, f}"'])
//     expect(action.split('a, {b, [c, e)},', ',')).to.deep.equal(['a', '{b, [c, e)}', ''])
//   })
// })

// describe('handleArguments', () => {
//   let action = new EventAction()
//   let event = {
//     _: 0,
//     one: 1,
//     two: 2,
//     nest: {
//       three: 3
//     },
//     str: 'string',
//     list: [1, 2, 3],
//     bool: true
//   }
//   it('should get event value', () => {
//     expect(action.handleArguments('event._', event)).to.equal('0')
//     expect(action.handleArguments('event.one', event)).to.equal('1')
//     expect(action.handleArguments(' event.one ', event)).to.equal('1')
//     expect(action.handleArguments('event.three', event)).to.equal('undefined')
//     expect(action.handleArguments('event.nest.three', event)).to.equal('3')
//     expect(action.handleArguments('event.nest.four', event)).to.equal('undefined')
//     expect(action.handleArguments('event.nest', event)).to.equal('{"three":3}')
//     expect(action.handleArguments('event.str', event)).to.equal('"string"')
//     expect(action.handleArguments('event.list', event)).to.equal('[1,2,3]')
//     expect(action.handleArguments('event.bool', event)).to.equal('true')
//   })

//   it('should not change if the arg is not exactly matched', () => {
//     expect(action.handleArguments('event', event)).to.equal('event')
//     expect(action.handleArguments('event.', event)).to.equal('event.')
//     expect(action.handleArguments('event..one', event)).to.equal('event..one')
//     expect(action.handleArguments('event.one*', event)).to.equal('event.one*')
//     expect(action.handleArguments('event.two-3', event)).to.equal('event.two-3')
//     expect(action.handleArguments('event.1a', event)).to.equal('event.1a')
//     expect(action.handleArguments('"event.one"', event)).to.equal('"event.one"')
//     expect(action.handleArguments('\'event.one\'', event)).to.equal('\'event.one\'')
//     expect(action.handleArguments('`event.one`', event)).to.equal('`event.one`')
//     expect(action.handleArguments('[event.one]', event)).to.equal('[event.one]')
//     expect(action.handleArguments('(event.one)', event)).to.equal('(event.one)')
//     expect(action.handleArguments('1 event.two', event)).to.equal('1 event.two')
//     expect(action.handleArguments('{num: event.one}', event)).to.equal('{num: event.one}')
//     expect(action.handleArguments('{ event.one : event.one }', event)).to.equal('{ event.one : event.one }')
//   })

//   it('should replace the right part of args if having comma', () => {
//     expect(action.handleArguments('event.one, test, 1, event.two', event)).to.equal('1,test,1,2')
//     expect(action.handleArguments('"hello, event.one"', event)).to.equal('"hello, event.one"')
//     expect(action.handleArguments('[1, event.two, event.bool], event.one', event)).to.equal('[1, event.two, event.bool],1')
//     expect(action.handleArguments('{num: event.one, str: event.str}', event)).to.equal('{num: event.one, str: event.str}')
//     expect(action.handleArguments('event.one, {num1: event.one}, event.one+1', event)).to.equal('1,{num1: event.one},event.one+1')
//   })
// })

// describe('convertToString', () => {
//   let action = new EventAction()
//   it('should convert to string', () => {
//     expect(action.convertToString(1)).to.be.equal('1')
//     expect(action.convertToString(undefined)).to.be.equal('undefined')
//     expect(action.convertToString(null)).to.be.equal('null')
//     expect(action.convertToString('test')).to.be.equal('"test"')
//     expect(action.convertToString({'a': 1})).to.be.equal('{"a":1}')
//     expect(action.convertToString([1, 2, 3])).to.be.equal('[1,2,3]')
//     expect(action.convertToString(true)).to.be.equal('true')
//   })
// })

/* eslint-enable no-unused-expressions */
