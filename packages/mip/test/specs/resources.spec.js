/**
 * @file resources spec file
 */

/* eslint-disable no-unused-expressions */
/* globals describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'
import resources from 'src/resources'
import viewport from 'src/viewport'
import 'src/index'
import rect from 'src/util/dom/rect'
import MIPTestCustomElement from '../util/custom-element'

describe('resources', function () {
  let Resources = resources.constructor
  let app
  let MIP = window.MIP

  beforeEach(function () {
    app = new Resources()
  })

  // reset
  afterEach(function () {
    app._gesture.cleanup()
    app.getResourcesList().forEach(function (element) {
      app.remove(element)
    })
    app._viewport.off('changed resize', app.updateState)
    app._gesture.off('swipe', app.updateState)
    app = null
  })

  describe('#_bindEvent', function () {
    it('changed event', function () {
      let spy = sinon.spy(app, 'updateState')
      app._bindEvent()
      viewport.trigger('changed')

      expect(spy).to.have.been.calledTwice
    })

    it('resize event', function () {
      let spy = sinon.spy(app, 'updateState')
      app._bindEvent()
      viewport.trigger('resize')

      expect(spy).to.have.been.calledTwice
    })

    // Verify that the delay event was successful
    describe('swipe event', function () {
      it('first call', function () {
        let spy = sinon.spy(app, 'updateState')
        app._bindEvent()

        expect(spy).to.have.been.calledOnce
        expect(spy).to.have.been.calledWith
      })

      it('velocity min', function (done) {
        let spy = sinon.spy(app, 'updateState')
        app._bindEvent()
        app._gesture.trigger('swipe', {}, {
          velocity: 0.1
        })

        setTimeout(function () {
          let count = spy.callCount
          expect(spy).to.have.been.calledOnce

          setTimeout(function () {
            expect(spy.callCount).to.be.above(count)
            done()
          }, 100)
        }, 90)
      })

      it('velocity max', function (done) {
        let spy = sinon.spy(app, 'updateState')
        app._bindEvent()
        app._gesture.trigger('swipe', {}, {
          velocity: 3
        })

        setTimeout(function () {
          let count = spy.callCount
          expect(spy).to.have.been.calledOnce

          setTimeout(function () {
            expect(spy.callCount).to.be.above(count)
            done()
          }, 100)
        }, 590)
      })
    })
  })

  it('#add', function (done) {
    MIP.registerCustomElement('mip-test-resources', class extends MIPTestCustomElement {
      prerenderAllowed () {
        return true
      }

      build () {
        done()
      }
    })

    let node = document.createElement('mip-test-resources')
    document.body.appendChild(node)
    document.body.removeChild(node)
  })

  describe('#remove', function () {
    it('element', function () {
      /* eslint-disable fecs-camelcase */
      expect(app.remove({
        _eid: 10086
      })).to.be.false

      expect(app.remove({
        _eid: 'str'
      })).to.be.false
      /* eslint-enable fecs-camelcase */
    })

    it('_eid', function () {
      expect(app.remove(10086)).to.be.false
    })
  })

  it('#getResources', function () {
    expect(app.getResources()).to.be.a('object').and.be.empty
  })

  it('#getResourcesList', function () {
    expect(app.getResourcesList()).to.be.a('array').and.be.empty
  })

  describe('#setInViewport', function () {
    it('inViewport', function (done) {
      app.setInViewport({
        inViewport: function () {
          return true
        },
        viewportCallback: function (args) {
          expect(args).to.be.undefined
          done()
        }
      })
    })

    it('not inViewport', function (done) {
      app.setInViewport({
        inViewport: function () { },
        viewportCallback: function () {
          done('error')
        }
      })

      done()
    })

    it('repeat', function () {
      let element = {
        viewportCallback: function () { },
        inViewport: function () {
          return true
        }
      }
      let spy = sinon.spy(element, 'viewportCallback')

      app.setInViewport(element)
      app.setInViewport(element, false)
      app.setInViewport(element, true)

      expect(spy).have.been.calledTwice
    })
  })

  describe('#_update', function () {
    it('not resources', function () {
      expect(app._update()).to.be.undefined
    })

    it('prerenderAllowed', function (done) {
      sinon.stub(app, 'getResources').callsFake(function () {
        return {
          MIP: {
            prerenderAllowed (offset, viewportRect) {
              expect(offset).to.be.a('object').and.not.empty
              expect(viewportRect).to.be.a('object').and.not.empty
              return true
            },
            getBoundingClientRect () {
              return {
                left: 0,
                top: 0,
                width: 0,
                height: 0
              }
            }
          }
        }
      })

      app.setInViewport = function (element, flag) {
        expect(flag).to.be.true
        done()
      }

      app._update()
    })

    it('overlapping', function (done) {
      // mock
      sinon.stub(app, 'getResources').callsFake(function () {
        return {
          MIP: {
            prerenderAllowed () {
              return false
            }
          }
        }
      })
      sinon.stub(rect, 'overlapping').callsFake(function (getElementRect, viewportRect) {
        expect(getElementRect).to.equal('getElementRect')
        expect(viewportRect).to.be.a('object')
        return true
      })
      sinon.stub(rect, 'getElementRect').callsFake(function () {
        return 'getElementRect'
      })

      app.setInViewport = function (element, flag) {
        expect(flag).to.be.true
        done()
      }

      app._update()
      rect.overlapping.restore()
      rect.getElementRect.restore()
    })
  })

  describe('.prerenderElement', function () {
    it('empty param', function () {
      expect(function () {
        app.prerenderElement()
      }).to.throw()
    })

    it('inViewport', function (done) {
      app.prerenderElement({
        viewportCallback: done,
        inViewport () {
          return true
        }
      })
      done()
    })

    it('not inViewport', function (done) {
      app.prerenderElement({
        inViewport () {
          return false
        }
      })
      app.prerenderElement({
        viewportCallback (flag) {
          expect(flag).to.be.true
          done()
        },
        inViewport () {
          return false
        }
      })
    })
  })
})

/* eslint-enable no-unused-expressions */
