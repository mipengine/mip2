/**
 * @file mip-fixed spec file
 * @author panyuqi(panyuqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, beforeEach, it, expect, afterEach, after, sinon */
import viewport from 'src/viewport'
import util from 'src/util'
const platform = util.platform
const create = util.dom.create

function changeUa (ua) {
  let stub = sinon.stub(platform, '_ua')
  stub.callsFake(() => ua)
  platform.start()
  stub.restore()
}

describe('mip-fixed', function () {
  describe('position', function () {
    let element

    beforeEach(function () {
      element = document.createElement('mip-fixed')
    })

    afterEach(function () {
      element && element.parentNode && element.parentNode.removeChild(element)
    })

    it('should be hidden when type is empty', function () {
      document.body.appendChild(element)

      expect(element.style.display).to.be.equal('none')
    })

    it('should be fixed to bottom when type set to `bottom`', function () {
      element.setAttribute('type', 'bottom')
      document.body.appendChild(element)

      expect(element.offsetHeight + element.offsetTop).to.be.equal(viewport.getHeight())
    })

    it('should be fixed to top when type set to `top`', function () {
      element.setAttribute('type', 'top')
      document.body.appendChild(element)

      expect(element.offsetTop).to.be.equal(0)
    })

    it('should be fixed to left when type set to `left`', function () {
      element.setAttribute('type', 'left')
      element.setAttribute('bottom', '50px')
      document.body.appendChild(element)

      expect(element.offsetLeft).to.be.equal(0)
      expect(element.offsetHeight + element.offsetTop).to.be.equal(viewport.getHeight() - 50)
    })

    it('should be fixed to left when type set to `left`', function () {
      element.setAttribute('type', 'left')
      element.setAttribute('top', '50px')
      document.body.appendChild(element)

      expect(element.offsetLeft).to.be.equal(0)
      expect(element.offsetTop).to.be.equal(50)
    })

    it('should be removed if `top` or `bottom` unset', function () {
      element.setAttribute('type', 'left')
      document.body.appendChild(element)

      expect(element.parentNode).to.be.null
    })

    it('should be fixed to right when type set to `right`', function () {
      element.setAttribute('type', 'right')
      element.setAttribute('bottom', '50px')
      document.body.appendChild(element)

      expect(element.offsetLeft + element.offsetWidth).to.be.equal(viewport.getWidth())
      expect(element.offsetHeight + element.offsetTop).to.be.equal(viewport.getHeight() - 50)
    })

    it('should be fixed to right when type set to `right`', function () {
      element.setAttribute('type', 'right')
      element.setAttribute('top', '50px')
      document.body.appendChild(element)

      expect(element.offsetLeft + element.offsetWidth).to.be.equal(viewport.getWidth())
      expect(element.offsetTop).to.be.equal(50)
    })

    it('should be fixed to right when type set to `right` & empty `top`', function () {
      element.setAttribute('type', 'right')
      element.setAttribute('top', '')
      document.body.appendChild(element)

      expect(element.offsetLeft + element.offsetWidth).to.be.equal(viewport.getWidth())
      expect(element.offsetTop).to.be.equal(48)
    })

    it('should render gototop when type set to `gototop`', function () {
      element.setAttribute('type', 'gototop')
      let gototopElement = document.createElement('mip-gototop')
      element.appendChild(gototopElement)
      document.body.appendChild(element)

      expect(element.offsetHeight + element.offsetTop).to.be.equal(viewport.getHeight() - 90)
    })
  })

  describe('show & hide fixedLayer API', function () {
    let fixedElement
    let fixedLayer
    let placeholder

    beforeEach(function () {
      fixedElement = window.MIP.viewer.fixedElement
      fixedLayer = fixedElement.getFixedLayer()
    })

    after(function () {
      fixedElement._fixedLayer = null
      fixedLayer && fixedLayer.parentNode && fixedLayer.parentNode.removeChild(fixedLayer)
      placeholder && placeholder.parentNode && placeholder.parentNode.removeChild(placeholder)
    })

    it('showFixedLayer', function () {
      fixedElement.showFixedLayer(fixedLayer)
      expect(fixedLayer.style.display).to.be.equal('block')
    })

    it('hideFixedLayer', function () {
      fixedElement.hideFixedLayer(fixedLayer)
      expect(fixedLayer.style.display).to.be.equal('none')
    })

    it('setPlaceholder', function () {
      fixedElement.setPlaceholder()
      placeholder = document.body.querySelector('div[mip-fixed-placeholder]')
      expect(placeholder).to.not.equal(null)

      fixedElement.setPlaceholder(30)
      expect(util.css(placeholder, 'display')).to.be.equal('block')
    })
  })

  describe('iOS', function () {
    let fixedElement
    let element

    beforeEach(function () {
      element = document.createElement('mip-fixed')
      fixedElement = window.MIP.viewer.fixedElement
      fixedElement._fixedElements = []
    })

    afterEach(function () {
      element && element.parentNode && element.parentNode.removeChild(element)
    })

    it('should not move <mip-fixed> to <body> if `still` is set', function () {
      changeUa('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
      expect(platform.isIos()).to.be.true

      fixedElement.init()

      element.setAttribute('still', '')
      element.setAttribute('type', 'left')
      element.setAttribute('bottom', '50px')
      document.body.appendChild(element)

      expect(element.parentNode).to.be.not.equal(fixedElement._fixedLayer)
    })

    it('should move <mip-fixed> to <body>', function () {
      changeUa('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
      expect(platform.isIos()).to.be.true

      fixedElement.init()

      element.setAttribute('type', 'left')
      element.setAttribute('bottom', '50px')
      document.body.appendChild(element)

      expect(element.parentNode).to.be.equal(fixedElement._fixedLayer)
    })

    it('should insert mip-semi-fixed which has an id', function () {
      changeUa('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
      element = create([
        '<div>',
        '<mip-semi-fixed id="my-id" threshold="0" fixedClassNames="fixedStyle">',
        '<div mip-semi-fixed-container id="mip-semi-fixed-fixed-container" class="absoluteStyle">',
        'This is the mip-semi-fixed dom',
        '</div>',
        '</mip-semi-fixed>',
        '</div>'
      ].join(''))

      document.body.appendChild(element)

      fixedElement.init()

      expect(element.querySelector('mip-semi-fixed').id).to.be.equal('my-id')
    })

    it('should insert before the nextSbiling of mip-semi-fixed which has no id', function () {
      changeUa('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
      element = create([
        '<div>',
        '<mip-semi-fixed threshold="0" fixedClassNames="fixedStyle">',
        '<div mip-semi-fixed-container id="mip-semi-fixed-fixed-container" class="absoluteStyle">',
        'This is the mip-semi-fixed dom',
        '</div>',
        '</mip-semi-fixed>',
        '</div>'
      ].join(''))

      let nextSibling = create('<div>this is the sbiling element</div>')
      element.appendChild(nextSibling)
      document.body.appendChild(element)

      fixedElement.init()

      expect(nextSibling).to.equal(element.querySelector('mip-semi-fixed').nextElementSibling)
    })

    it('should insert mip-semi-fixed which has no sibling', function () {
      changeUa('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
      element = create([
        '<div>',
        '<mip-semi-fixed threshold="0" fixedClassNames="fixedStyle">',
        '<div mip-semi-fixed-container id="mip-semi-fixed-fixed-container" class="absoluteStyle">',
        'This is the mip-semi-fixed dom',
        '</div>',
        '</mip-semi-fixed>',
        '</div>'
      ].join(''))

      document.body.appendChild(element)

      fixedElement.init()
    })
  })

  describe('Android & UC', function () {
    let fixedElement
    let element

    beforeEach(function () {
      changeUa('Mozilla/5.0 (Linux; Android 5.0.2; Mobile/14B100 UCBrowser/11.4.7.931 Mobile AliApp(TUnionSDK/0.1.12)')
      element = document.createElement('mip-fixed')
      fixedElement = window.MIP.viewer.fixedElement
      fixedElement._fixedElements = []
      fixedElement._isAndroidUc = true
    })

    it('should not move <mip-fixed> to <body>', function () {
      expect(platform.isAndroid() && platform.isUc()).to.be.true

      element.setAttribute('type', 'gototop')
      let gototopElement = document.createElement('mip-gototop')
      element.appendChild(gototopElement)
      document.body.appendChild(element)

      fixedElement.init()
    })

    it('should set height & width of fixedLayer to 100%', function () {
      let fixedLayer = fixedElement._fixedLayer
      fixedLayer.parentNode && fixedLayer.parentNode.removeChild(fixedLayer)
      fixedElement._fixedLayer = null

      element.setAttribute('type', 'gototop')
      let gototopElement = document.createElement('mip-gototop')
      element.appendChild(gototopElement)
      document.body.appendChild(element)

      fixedElement.init()

      expect(fixedElement._fixedLayer.style.height).to.be.equal('100%')
      expect(fixedElement._fixedLayer.style.width).to.be.equal('100%')
    })
  })
})
