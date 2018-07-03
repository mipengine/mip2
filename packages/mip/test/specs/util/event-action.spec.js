/**
 * @file util event-action spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect */

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
        return 'tap:MIP.setData({a:1}})'
      }
    }, 'event')
    action.execute('tap', {
      getAttribute () {
        return 'tap:MIP.$set({a:1}})'
      }
    }, 'event')
    expect(mockElement.arg).to.undefined
  })

  it('normal', function () {
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
    expect(mockElement.arg).to.equal('123')
  })

  it('error check', function () {
    let action = new EventAction()
    expect(action.execute).to.not.throw()
    expect(action.parse(123)).to.eql([])
    expect(action.parse('scroll:id.abc(123', 'tab')).to.eql([])
  })
})

/* eslint-enable no-unused-expressions */
