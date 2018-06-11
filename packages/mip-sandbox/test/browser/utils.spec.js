/**
 * @file utils.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
/* globals describe, it */

var chai = require('chai')
var expect = chai.expect

var defUtils = require('../../lib/utils/def')

describe('utils/def', function () {
  describe('#def', function () {
    var def = defUtils.def

    it('define class', function () {
      var obj = {}

      def(obj, 'Date', 'Date')
      def(obj, 'Promise', 'Promise')
      def(obj, 'NaN', 'NaN')
      def(obj, 'Infinity', 'Infinity')

      expect(obj.Date).to.be.equal(Date)
      expect(obj.Promise).to.be.equal(Promise)
      expect(obj.NaN).to.not.be.equal(NaN)
      expect(obj.Infinity).to.be.equal(1 / 0)
    })

    it('define function', function () {
      var obj = {}
      def(obj, 'setTimeout', 'setTimeout')
      def(obj, 'isNaN', 'isNaN')

      expect(obj.setTimeout).to.not.be.equal(setTimeout)
      expect(obj.isNaN(NaN)).to.be.equal(true)
    })

    it('define property', function () {
      var obj = {}

      def(obj, 'undefined', 'undefined', {access: 'readonly'})
      def(obj, 'innerWidth', 'innerWidth', {access: 'readonly'})

      expect(obj.undefined).to.be.equal(undefined)
      expect(typeof obj.innerWidth).to.be.equal('number')

      var innerWidth = obj.innerWidth

      obj.undefined = 1
      obj.innerWidth = 100
      expect(obj.undefined).to.be.equal(undefined)
      expect(obj.innerWidth).to.be.equal(innerWidth)
    })

    it('define getter', function () {
      var obj = {}
      var list = ['a', 'b', 'c']
      def(obj, 'list', list)
      expect(obj.list).to.be.equal(list)
    })
  })

  describe('#traverse', function () {
    var sandbox = {
      access: 'readonly',
      host: 'window',
      children: [
        'Date',
        'NaN',
        'setTimeout',
        'innerWidth',
        {
          name: 'location',
          host: 'location',
          children: [
            'href',
            'protocol'
          ]
        }
      ]
    }

    var obj = defUtils.traverse(sandbox)

    it('enumerable', function () {
      expect(Object.keys(obj)).to.be.deep.equal(['Date', 'NaN', 'setTimeout', 'innerWidth', 'location'])
      expect(Object.keys(obj.location)).to.be.deep.equal(['href', 'protocol'])
    })

    it('child node', function () {
      expect(obj.location.href).to.have.string(obj.location.protocol)
    })
  })
})
