/**
 * @file util dom css-loader file
 * @author sekiyika(pengxing@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* global describe, it, expect, before, after, location */

import dom from 'src/util/dom/dom'

let docElem = document.documentElement
docElem.closest = docElem.contains = null

let element = dom.create(
  `
  <div class="dom-test test">
    <div class="dom-closest-target">
      <div class="dom-closest-source">
      </div>
    </div>
  `
)
let insertEle = dom.create(
  `
  <div class="dom-test test">
    <div class="dist1"></div>
    <div class="move1">
      <span>move1</span>
    </div>
    <div class="move2">
      <span>move2</span>
    </div>
    <div class="move3">
      <span>move3</span>
    </div>
  </div>
  `
)
document.body.appendChild(element)
document.body.appendChild(insertEle)
describe('dom', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('matches', function () {
    expect(dom.matches(element, 'div.dom-test')).to.be.true
    expect(dom.matches('', 'div')).to.be.false
  })

  it('closest', function () {
    expect(dom.closest(element, 'body')).to.equal(document.body)
  })

  it('contains', function () {
    expect(dom.contains(document.body, element)).to.be.true
  })

  it('closestTo', function () {
    let sourceElement = element.querySelector('.dom-closest-source')
    let targetElement = element.querySelector('.dom-closest-target')

    expect(dom.closestTo(sourceElement, '.test', targetElement)).to.be.null
    expect(dom.closestTo(sourceElement, '.test', element)).to.equal(element)
  })

  it('create', function () {
    expect(dom.create('')).to.be.null
    expect(dom.create('<div></div><div></div>')).to.have.lengthOf(2)
  })

  it('insert', function () {
    let move1 = document.querySelector('.move1')
    let move2 = document.querySelector('.move2')
    let move3 = document.querySelector('.move3')
    let dist1 = document.querySelector('.dist1')
    let doms = [move2, move3]
    dom.insert(dist1, move1)
    dom.insert(dist1, doms)
    dom.insert(move1, dist1)
    expect(dom.insert(dist1, null)).to.be.undefined
    expect(dom.insert(null, move1)).to.be.undefined
    expect(dom.contains(dist1, move1)).to.be.true
    expect(dom.contains(dist1, move2)).to.be.true
    expect(dom.contains(dist1, move3)).to.be.true
  })

  it('old waitDocumentReady', function (done) {
    dom.waitDocumentReady(done)
  })

  describe('waitDocumentReady', function () {
    let hash
    before(function () {
      hash = location.hash
      location.hash = 'sample=mip_async1'
    })
    after(function () {
      location.hash = hash
    })

    it('loading document event', function (done) {
      dom.waitDocumentReady(done, {
        readyState: 'loading',
        removeEventListener: function (name, callback) {
          expect(name).to.equal('DOMContentLoaded')
          expect(callback).to.be.a('function')
        },
        addEventListener: function (name, callback) {
          expect(name).to.equal('DOMContentLoaded')
          expect(callback).to.be.a('function')
          callback()
        }
      })
    })

    it('loading window event', function (done) {
      dom.waitDocumentReady(done, {
        readyState: 'loading',
        removeEventListener: function () {},
        addEventListener: function () {}
      }, {
        removeEventListener: function (name, callback) {
          expect(name).to.equal('load')
          expect(callback).to.be.a('function')
        },
        addEventListener: function (name, callback) {
          expect(name).to.equal('load')
          expect(callback).to.be.a('function')
          callback()
        }
      })
    })

    it('complete', function (done) {
      dom.waitDocumentReady(done, {
        readyState: 'complete'
      })
    })
  })

  describe('waitFor', () => {
    let parent
    let child

    beforeEach(() => {
      parent = document.createElement('div')
      child = document.createElement('div')
    })

    function contains () {
      return parent.contains(child)
    }

    it('should immediately return if child is available', () => {
      parent.appendChild(child)
      return dom.waitForChild(parent, contains)
    })

    it('should wait until child is available', () => {
      const waiting = dom.waitForChild(parent, contains)
      parent.appendChild(child)
      return waiting
    })

    it('should prefer MutationObserver and disconnect when done', () => {
      let mutationCallback
      const mutationObserver = {
        observe: sandbox.spy(),
        disconnect: sandbox.spy()
      }
      function MutationObserver (callback) {
        mutationCallback = callback
        this.observe = mutationObserver.observe
        this.disconnect = mutationObserver.disconnect
      }
      const parent = {
        ownerDocument: {
          defaultView: {
            MutationObserver
          }
        }
      }
      let checkFuncValue = false
      const checkFunc = () => checkFuncValue

      const waiting = dom.waitForChild(parent, checkFunc)
      expect(mutationObserver.observe).to.be.calledOnce
      expect(mutationObserver.observe.firstCall.args[0]).to.equal(parent)
      expect(mutationObserver.observe.firstCall.args[1])
        .to.deep.equal({childList: true})
      expect(mutationCallback).to.exist

      // False callback.
      mutationCallback()
      expect(mutationObserver.disconnect).to.have.not.been.called

      // True callback.
      checkFuncValue = true
      mutationCallback()
      return waiting.then(() => {
        expect(mutationObserver.disconnect).to.be.calledOnce
      })
    })

    it('should fallback to polling without MutationObserver', () => {
      let intervalCallback
      const win = {
        setInterval: callback => {
          intervalCallback = callback
          return 1
        },
        clearInterval: sandbox.spy()
      }
      const parent = {
        ownerDocument: {
          defaultView: win
        }
      }
      let checkFuncValue = false
      const checkFunc = () => checkFuncValue

      const waiting = dom.waitForChild(parent, checkFunc)
      expect(intervalCallback).to.exist

      // False callback.
      intervalCallback()
      expect(win.clearInterval).to.have.not.been.called

      // True callback.
      checkFuncValue = true
      intervalCallback()

      return waiting.then(() => {
        expect(win.clearInterval).to.be.calledOnce
      })
    })

    it('should wait for body', () => {
      return dom.waitForBody(document).then(() => {
        expect(document.body).to.exist
      })
    })
  })
})

/* eslint-enable no-unused-expressions */
