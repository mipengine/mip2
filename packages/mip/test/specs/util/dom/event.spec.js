/**
 * @file util dom css-loader file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect, Event */
import event from 'src/util/dom/event'

describe('event', function () {
  it('delegate', function () {
    let flag = false
    function handler () {
      flag = this.tagName.toLowerCase() === 'div'
    };
    let undelegate = event.delegate(document.body, 'div', 'click', handler)
    let customEvent = new Event('click')
    customEvent.initEvent('click', true, true)

    let element = document.body.appendChild(document.createElement('div'))
    element.dispatchEvent(customEvent)
    expect(flag).to.be.true

    // div
    flag = false
    let spanElement = document.body.appendChild(document.createElement('span'))
    spanElement.dispatchEvent(customEvent)
    expect(flag).to.be.false

    undelegate()
    element.dispatchEvent(customEvent)
    expect(flag).to.be.false
  })

  it('create', function () {
    let element = document.body.appendChild(document.createElement('div'))
    let data
    element.addEventListener('click', function (evt) {
      data = evt.data
    }, false)
    element.dispatchEvent(event.create('click', 'mock data'))
    expect(data).to.equal('mock data')
  })
})

/* eslint-enable no-unused-expressions */
