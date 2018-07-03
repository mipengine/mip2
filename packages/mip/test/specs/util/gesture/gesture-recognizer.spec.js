/**
 * @file util gesture data-processor spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, expect, it, sinon */

import Recognizer from 'src/util/gesture/gesture-recognizer'

let mockGesture = {
  trigger () {}
}

describe('gesture/recognizer', function () {
  let TapRecognizer = Recognizer.get('tap')
  let DoubleTapRecognizer = Recognizer.get('doubletap')
  let SwipeRecognizer = Recognizer.get('swipe')

  // Caution: class name will be uglified to one single alphabet, if under webpack mode production
  expect(TapRecognizer.name).to.equal('TapRecognizer')

  Recognizer.conflict('tap', 'doubletap')
  expect(Recognizer.getConflictList('tap')).to.have.lengthOf(2)
  expect(Recognizer.getConflictList('swipe')).to.eql([])

  Recognizer.getConflictList('tap').pop()
  Recognizer.getConflictList('doubletap').pop()

  expect(Recognizer.conflict).to.not.throw(Error)

  it('base', function () {
    let base = new Recognizer(mockGesture)
    // isState
    expect(base.isState('start') && base.isState(1)).to.be.true

    // setState
    expect(base.setState(2)).to.equal(2)
    expect(base.setState(7)).to.equal(2)

    // Auto reset & process & emit
    base.setState('hold')
    let data = {
      eventState: 'start'
    }
    sinon.spy(base, 'reset')
    sinon.spy(base, 'process')
    sinon.spy(base, 'emit')
    base.recognize(data)
    expect(base.reset).to.have.been.called
    expect(base.process).to.have.been.called
    base.process = function () {
      // Return end state
      return 4
    }
    base.recognize(data)
    expect(base.emit).to.have.been.calledWith(data)

    base.setState('hold')
    base.recognize({
      eventState: 'move'
    })
    expect(base.emit).to.have.been.calledOnce
  })

  it('tap', function (done) {
    let tap = new TapRecognizer(mockGesture)
    let doubletap = new DoubleTapRecognizer(mockGesture)
    let data = {
      eventState: 'end',
      pointers: [''],
      deltaTime: 10,
      distance: 0
    }

    tap.conflictList.doubletap = doubletap
    doubletap.conflictList.tap = tap

    doubletap.setState('wait')
    tap.recognize(data)

    // While doubletap is wait, tap also should be wait.
    expect(tap.isState('wait')).to.be.true

    doubletap.setState('hold')
    tap.recognize(data)
    setTimeout(function () {
      done(tap.isState('end'))
    }, tap.holdTime + 10)
  })

  it('swipe', function () {
    let swipe = new SwipeRecognizer(mockGesture)
    let data = {
      eventState: 'end',
      pointers: ['', ''],
      deltaTime: 10,
      distance: 40,
      direction: 3,
      velocity: 0.04
    }
    swipe.recognize(data)
    expect(swipe.isState('hold')).to.be.true

    data.pointers.pop()
    swipe.setState('start')
    swipe.recognize(data)
    expect(swipe.isState('end')).to.be.true
  })
})

/* eslint-enable no-unused-expressions */
