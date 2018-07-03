/**
 * @file util gesture index spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect */

import Gesture from 'src/util/gesture'
import domEvent from 'src/util/dom/event'

const docBody = document.body

function mockTouchEvent (name, clientX, clientY) {
  let evt = domEvent.create(name)
  evt.touches = [{
    clientX: clientX || 0,
    clientY: clientY || 0
  }]
  return evt
}
let gesture = new Gesture(docBody)
let data = {}
function dispatch (name, clientX, clientY) {
  docBody.dispatchEvent(mockTouchEvent(name, clientX, clientY))
}

describe('gesture', function () {
  it('on & off', function () {
    data.touchstart = 0
    gesture.on('touchstart', function () {
      data.touchstart++
    })

    dispatch('touchstart')
    // Check native event bind.
    expect(data.touchstart).to.equal(1)

    gesture.off('touchstart')
    dispatch('touchstart')
    // Check native event unbind.
    expect(data.touchstart).to.equal(1)
  })

  it('tap', function () {
    let tapCheck = false
    gesture.on('tap', function () {
      tapCheck = true
    })

    dispatch('touchstart')
    dispatch('touchend')

    expect(tapCheck).to.be.true
  })

  it('tap & doubletap', function (done) {
    data.tap = data.doubletap = 0
    let gesture = new Gesture(document.body)
    gesture.on('tap', function () {
      data.tap++
    })
    gesture.on('doubletap', function () {
      data.doubletap++
    })

    dispatch('touchstart')
    dispatch('touchend')
    dispatch('touchstart')
    dispatch('touchend')
    setTimeout(function () {
      if (data.tap !== 0 || data.doubletap !== 1) {
        return done('tap & doubletap check error')
      }
      done()
    })
  })

  it('swipe', function () {
    data.swipe = data.swipeother = data.swipeleft = 0
    gesture.on('swipe', function () {
      data.swipe++
    })
    gesture.on('swipeup swiperight swipedown', function () {
      data.swipeother++
    })
    gesture.on('swipeleft', function () {
      data.swipeleft++
    })

    dispatch('touchstart', 100, 0)
    dispatch('touchend', 50, 0)

    dispatch('touchstart', 100, 0)
    dispatch('touchend', 50, 0)

    expect(data.swipe).to.equal(2)
    expect(data.swipeother).to.equal(0)
    expect(data.swipeleft).to.equal(2)
  })

  it('recognizer', function () {
    let gesture = new Gesture(docBody)

    gesture.on('tap doubletap', function () {

    })
    expect(!!(gesture._recognizers.tap && gesture._recognizers.doubletap)).to.be.true

    gesture.off('doubletap')
    expect(!!(gesture._recognizers.tap && !gesture._recognizers.doubletap)).to.be.true

    gesture.off()
    expect(gesture._recognizers).to.eql({})
  })

  it('cleanup', function () {
    data.cleanup = 0

    gesture.on('touchstart', function () {
      data.cleanup++
    })

    dispatch('touchstart')
    expect(data.cleanup).to.equal(1)

    gesture.cleanup()
    dispatch('touchstart')
    expect(data.cleanup).to.equal(1)
  })

  it('preventDefault', function () {
    let gesture = new Gesture(docBody, {
      preventDefault: true,
      stopPropagation: true
    })
    data.preventDefault = 0

    gesture.on('touchend', function (event) {
      if (event.defaultPrevented) {
        data.preventDefault++
      }
    })
    dispatch('touchend')
    expect(data.preventDefault).to.equal(1)
  })
})

/* eslint-enable no-unused-expressions */
