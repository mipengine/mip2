/**
 * @file util gesture data-processor spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, expect */

import domEvent from 'src/util/dom/event'
import dataProcessor from 'src/util/gesture/data-processor'

function mockTouchEvent (name, clientX, clientY) {
  let evt = domEvent.create(name)
  evt.touches = [{
    clientX: clientX || 0,
    clientY: clientY || 0
  }]
  return evt
}

describe('gesture/data-processor', function () {
  let startEvent = mockTouchEvent('touchstart')
  let moveEvent = mockTouchEvent('touchmove', 2, 1.5)
  let endEvent = mockTouchEvent('touchend', 4, 3)
  dataProcessor.process(startEvent)
  dataProcessor.process(moveEvent, false, true)
  let moveData = dataProcessor.process(mockTouchEvent('touchmove', 1, 3), true)
  let data = dataProcessor.process(endEvent)

  expect(data.distance).to.equal(5)
  expect(moveEvent.defaultPrevented).to.be.true
  expect(data.direction).to.equal(2)
  expect(moveData.direction).to.equal(3)
})

/* eslint-enable no-unused-expressions */
