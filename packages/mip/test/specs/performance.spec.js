/**
 * @file performance spec file
 * @author sekiyika(pengxing@baidu.com)
 */

/* globals describe, before, it, expect */

import registerElement from 'src/register-element'
import MIPTestCustomElement from '../util/custom-element'
import performance from 'src/performance'
import util from 'src/util'

describe('performance', function () {
  before(function () {
    registerElement('mip-test-performance', MIPTestCustomElement)
  })

  it('.start', function (done) {
    performance.start()
    performance.start()

    util.dom.waitDocumentReady(function () {
      setTimeout(function () {
        expect(performance.getTiming()).to.include.all.keys([
          'MIPFirstScreen',
          'MIPStart',
          'MIPDomContentLoaded'
        ])

        done()
      }, 500)
    })
  })

  it('.getTiming', function () {
    let old = window.performance

    expect(performance.getTiming()).to.be.a('object')
    window.performance = null
    expect(performance.getTiming()).to.be.a('object')

    window.performance = {}
    expect(performance.getTiming()).to.be.a('object')

    window.performance = {
      timing: {}
    }
    expect(performance.getTiming()).to.be.a('object')

    window.performance = {
      timing: {
        toJSON: function () {
          return {}
        }
      }
    }
    expect(performance.getTiming()).to.be.a('object')

    window.performance = old
  })

  it('.addFsElement', function () {
    expect(performance.addFsElement).to.be.a('function')
    expect(function () {
      performance.addFsElement(document.createElement('mip-test-performance'))
    }).to.not.throw()
  })

  it('.fsElementLoaded', function () {
    expect(performance.fsElementLoaded).to.be.a('function')
    expect(function () {
      performance.fsElementLoaded(document.createElement('mip-test-performance'))
    }).to.not.throw()
  })

  it('.on', function () {
    expect(performance.on).to.be.a('function')
    expect(function () {
      performance.on('name')
    }).to.not.throw()
  })
})
