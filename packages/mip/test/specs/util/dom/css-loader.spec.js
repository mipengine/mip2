/**
 * @file util dom css-loader file
 * @author sekiyika(pengxing@baidu.com)
 */

/* global describe, it, expect */

import cssLoader from 'src/util/dom/css-loader'

let cssTest = '#test{margin:0; padding:0; opacity: 0.5}'
let cssRuntime = ''

let element = document.createElement('div')
element.id = 'test'
document.body.appendChild(element)

describe('css-loader', function () {
  it('insert', function () {
    // Add runtime style element
    let runtimeStyle = cssLoader.insertStyleElement(document, document.head, cssRuntime, '', true)
    // Add test style element
    let testStyle = cssLoader.insertStyleElement(document, document.head, cssTest, 'mip-test')

    expect(document.defaultView.getComputedStyle(element).opacity).to.equal('0.5')
    expect(runtimeStyle.nextSibling).to.equal(testStyle)

    document.head.removeChild(runtimeStyle)
    document.head.removeChild(testStyle)

    // For testing insert location
    runtimeStyle = cssLoader.insertStyleElement(document, document.head, cssRuntime, '', true)
    document.head.appendChild(runtimeStyle)
    testStyle = cssLoader.insertStyleElement(document, document.head, cssTest, 'mip-test')

    expect(document.head.lastChild).to.equal(testStyle)

    document.head.removeChild(runtimeStyle)
    document.head.removeChild(testStyle)
  })
})
