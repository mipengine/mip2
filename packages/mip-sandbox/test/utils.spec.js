/**
 * @file utils.spec.js
 * @author clark-t (clarktanglei@163.com)
 */
/* globals describe, it */

var chai = require('chai')
var expect = chai.expect

var defUtils = require('../lib/utils/def')
var is = require('../lib/utils/is')
var keys = require('../lib/utils/keys')

var mockWindow = {
  Date: Date,
  Promise: Promise,
  NaN: NaN,
  Infinity: Infinity,
  setTimeout: setTimeout,
  isNaN: isNaN,
  undefined: undefined,
  innerWidth: 200,
  document: {
    cookie: 'cookie',
    getElementById: function () {
      console.log('getElementById')
    }
  }
}

mockWindow.window = mockWindow

describe('utils/def', function () {
  defUtils.globals = mockWindow

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
      expect(obj.innerWidth).to.be.equal(200)

      obj.undefined = 1
      obj.innerWidth = 100
      expect(obj.undefined).to.be.equal(undefined)
      expect(obj.innerWidth).to.be.equal(200)
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
          name: 'document',
          host: 'document',
          children: [
            'cookie'
          ]
        }
      ]
    }

    var obj = defUtils.traverse(sandbox)

    it('enumerable', function () {
      expect(Object.keys(obj)).to.be.deep.equal(['Date', 'NaN', 'setTimeout', 'innerWidth', 'document'])
    })

    it('child node', function () {
      expect(obj.document.cookie).to.be.equal('cookie')
    })

    it('child node exclude', function () {
      expect(obj.document.getElementById).to.be.equal(undefined)
    })
  })
})

describe('utils/is', function () {
  it('#string type', function () {
    expect(is({type: 'Identifier'}, 'Identifier')).to.be.equal(true)
  })

  it('#regexp type', function () {
    expect(is({type: 'ArrowFunctionExpression'}, /Function/)).to.be.equal(true)
    expect(is({type: 'FunctionExpression'}, /Function/)).to.be.equal(true)
    expect(is({type: 'FunctionDeclaration'}, /Function/)).to.be.equal(true)
  })

  it('#params', function () {
    expect(is({type: 'Identifier'}, 'Identifier', {name: 'a'})).to.be.equal(false)
    expect(is({type: 'Identifier', name: 'a'}, 'Identifier', {name: 'a'})).to.be.equal(true)
  })

  it('#array params', function () {
    var prop1 = {
      type: 'Property'
    }
    var prop2 = {
      type: 'Property'
    }

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1, prop2]
        },
        'ObjectExpression',
        {properties: [prop1, prop2]}
      )
    ).to.be.equal(true)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1, prop2]
        },
        'ObjectExpression',
        {properties: [prop2]}
      )
    ).to.be.equal(true)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1, prop2]
        },
        'ObjectExpression',
        {properties: []}
      )
    ).to.be.equal(true)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1]
        },
        'ObjectExpression',
        {properties: [prop1, prop2]}
      )
    ).to.be.equal(false)

    expect(
      is(
        {
          type: 'ObjectExpression',
          properties: [prop1]
        },
        'Identifier',
        {properties: [prop2]}
      )
    ).to.be.equal(false)
  })
})

describe('utils/keys', function () {
  it('should be equal', function () {
    var list = [
      'a',
      'b',
      'c',
      {name: 'd'}
    ]
    expect(keys(list)).to.be.deep.equal(['a', 'b', 'c', 'd'])
  })
})
